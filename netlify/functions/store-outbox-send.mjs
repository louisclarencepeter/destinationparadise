// Scheduled notification-outbox processor. Kinds:
//   order_receipt / booking_confirmations — after finalize (paid orders)
//   request_received / request_team_alert — after a request-cart submission
//   quote_ready — after staff confirm dates/prices (carries the accept link)
// Sending happens strictly AFTER commercial state is safe (rows are written
// inside the SQL transactions); failures back off and retry; guest-facing
// rows that carry a raw order token are redacted immediately after sending.

import { createResendSender, escapeHtml, sanitizeHeaderLine } from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import { callStoreRpc, storeApiEnabled } from './_store_shared.mjs';

const FUNCTION_NAME = 'store-outbox-send';

const TEAM_TO = process.env.TEAM_EMAIL_BOOKING || 'info@yournexttriptoparadise.com';
const FROM_ADDRESS = process.env.RESEND_FROM_BOOKING || 'Destination Paradise <booking@yournexttriptoparadise.com>';
const TEAM_REPLY_TO = process.env.TEAM_REPLY_TO || 'info@yournexttriptoparadise.com';
const PUBLIC_ORIGIN = (process.env.STORE_PUBLIC_ORIGIN || 'https://yournexttriptoparadise.com').replace(/\/+$/, '');

// Which order statuses make a kind sendable (wrong status → retry later).
const KIND_STATUS = {
  order_receipt: ['paid'],
  booking_confirmations: ['paid'],
  request_received: ['awaiting_availability', 'quoted', 'pending_payment', 'paid'],
  request_team_alert: ['awaiting_availability', 'quoted', 'pending_payment', 'paid'],
  quote_ready: ['quoted', 'pending_payment', 'paid'],
};

const GUEST_COPY = {
  en: {
    subject: (ref) => `Your Destination Paradise booking — order ${ref}`,
    heading: (name) => `Asante${name ? `, ${name}` : ''} — your next trip to Paradise!`,
    intro: 'Your payment is confirmed. Every experience below has its own booking code — keep this email for the day.',
    guests: 'guests',
    total: 'Total paid',
    footer: 'Questions? Just reply to this email.',
    requestSubject: (ref) => `We got your trip request — ${ref}`,
    requestIntro: 'Thanks for your request! We are checking availability with our local partners and will confirm dates and a final price by email, usually within 24 hours. Nothing is charged.',
    requestTrack: 'Track your request',
    quoteSubject: (ref) => `Your trip is confirmed — review and accept (${ref})`,
    quoteIntro: 'Good news — everything below is confirmed by our partners. Review your trips and accept to continue to payment. Accepting holds your places.',
    quoteCta: 'Review & accept your trip',
    quoteExpiry: 'This confirmation is valid until',
    totalDue: 'Total due',
  },
  de: {
    subject: (ref) => `Deine Destination-Paradise-Buchung — Bestellung ${ref}`,
    heading: (name) => `Asante${name ? `, ${name}` : ''} — deine nächste Reise ins Paradies!`,
    intro: 'Deine Zahlung ist bestätigt. Jedes Erlebnis unten hat seinen eigenen Buchungscode — heb dir diese E-Mail für den Tag auf.',
    guests: 'Gäste',
    total: 'Gesamt bezahlt',
    footer: 'Fragen? Antworte einfach auf diese E-Mail.',
    requestSubject: (ref) => `Wir haben deine Reiseanfrage — ${ref}`,
    requestIntro: 'Danke für deine Anfrage! Wir prüfen die Verfügbarkeit mit unseren Partnern vor Ort und bestätigen Termine und Endpreis per E-Mail, meist innerhalb von 24 Stunden. Es wird nichts abgebucht.',
    requestTrack: 'Anfrage verfolgen',
    quoteSubject: (ref) => `Deine Reise ist bestätigt — prüfen und annehmen (${ref})`,
    quoteIntro: 'Gute Nachrichten — alles unten ist von unseren Partnern bestätigt. Prüfe deine Touren und nimm an, um zur Zahlung fortzufahren. Mit der Annahme werden deine Plätze reserviert.',
    quoteCta: 'Reise prüfen & annehmen',
    quoteExpiry: 'Diese Bestätigung gilt bis',
    totalDue: 'Jetzt fällig',
  },
  pl: {
    subject: (ref) => `Twoja rezerwacja Destination Paradise — zamówienie ${ref}`,
    heading: (name) => `Asante${name ? `, ${name}` : ''} — twoja następna podróż do raju!`,
    intro: 'Twoja płatność jest potwierdzona. Każda atrakcja poniżej ma własny kod rezerwacji — zachowaj tę wiadomość.',
    guests: 'gości',
    total: 'Zapłacono łącznie',
    footer: 'Pytania? Po prostu odpowiedz na tę wiadomość.',
    requestSubject: (ref) => `Mamy twoje zapytanie o podróż — ${ref}`,
    requestIntro: 'Dziękujemy za zapytanie! Sprawdzamy dostępność u naszych lokalnych partnerów i potwierdzimy terminy oraz ostateczną cenę mailowo, zwykle w ciągu 24 godzin. Nic nie zostanie pobrane.',
    requestTrack: 'Śledź swoje zapytanie',
    quoteSubject: (ref) => `Twoja podróż jest potwierdzona — sprawdź i zaakceptuj (${ref})`,
    quoteIntro: 'Dobre wieści — wszystko poniżej zostało potwierdzone przez naszych partnerów. Sprawdź wycieczki i zaakceptuj, aby przejść do płatności. Akceptacja rezerwuje twoje miejsca.',
    quoteCta: 'Sprawdź i zaakceptuj podróż',
    quoteExpiry: 'To potwierdzenie jest ważne do',
    totalDue: 'Do zapłaty',
  },
};

const money = (minor, currency) => `${(Number(minor) / 100).toFixed(2)} ${currency}`;

function itemRows(order) {
  return order.items.map((item) => `
    <tr>
      <td style="padding:6px 10px 6px 0"><strong>${escapeHtml(item.title)}</strong><br>
        ${escapeHtml(String(item.date))} · ${escapeHtml(item.time)} · ${escapeHtml(String(item.guests))} · ${escapeHtml(item.optionName || '')}<br>
        <span style="color:#4a6c82">${escapeHtml(item.pickup || '')}</span></td>
      <td style="padding:6px 0;white-space:nowrap;vertical-align:top">
        <strong>${escapeHtml(item.bookingCode || '—')}</strong><br>${escapeHtml(money(item.totalMinor, order.currency))}</td>
    </tr>`).join('');
}

function guestEmail(order) {
  const copy = GUEST_COPY[order.language] || GUEST_COPY.en;
  const html = `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1A4D6E">
    <h2 style="color:#215A7C">${escapeHtml(copy.heading(order.contactName?.split(' ')[0] || ''))}</h2>
    <p>${escapeHtml(copy.intro)}</p>
    <p style="color:#4a6c82">Order <strong>${escapeHtml(order.reference)}</strong></p>
    <table style="width:100%;border-collapse:collapse">${itemRows(order)}</table>
    <p style="border-top:1px solid #E1E6EB;padding-top:10px"><strong>${escapeHtml(copy.total)}: ${escapeHtml(money(order.totalMinor, order.currency))}</strong></p>
    <p style="color:#4a6c82;font-size:14px">${escapeHtml(copy.footer)}</p>
  </div>`;
  return {
    from: FROM_ADDRESS,
    to: [order.contactEmail],
    reply_to: TEAM_REPLY_TO,
    subject: sanitizeHeaderLine(copy.subject(order.reference), 200),
    html,
  };
}

function requestItemRows(order) {
  return order.items.map((item) => `
    <tr>
      <td style="padding:6px 10px 6px 0"><strong>${escapeHtml(item.title)}</strong><br>
        ${item.kind === 'request'
          ? escapeHtml(item.requestedDates || '—')
          : `${escapeHtml(String(item.date || ''))} · ${escapeHtml(item.time || '')}`}
        · ${escapeHtml(String(item.guests))}<br>
        ${item.staffNote ? `<span style="color:#4a6c82">${escapeHtml(item.staffNote)}</span>` : ''}</td>
      <td style="padding:6px 0;white-space:nowrap;vertical-align:top">
        ${item.totalMinor != null ? escapeHtml(money(item.totalMinor, order.currency)) : '—'}</td>
    </tr>`).join('');
}

function orderLink(order, accessToken) {
  const base = `${PUBLIC_ORIGIN}/store/order/${encodeURIComponent(order.reference)}`;
  return accessToken ? `${base}?t=${encodeURIComponent(accessToken)}` : base;
}

// Guest acknowledgement right after a request-cart submission.
function requestReceivedEmail(order, accessToken) {
  const copy = GUEST_COPY[order.language] || GUEST_COPY.en;
  const link = orderLink(order, accessToken);
  const html = `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1A4D6E">
    <h2 style="color:#215A7C">${escapeHtml(copy.heading(order.contactName?.split(' ')[0] || ''))}</h2>
    <p>${escapeHtml(copy.requestIntro)}</p>
    <p style="color:#4a6c82">Order <strong>${escapeHtml(order.reference)}</strong></p>
    <table style="width:100%;border-collapse:collapse">${requestItemRows(order)}</table>
    <p><a href="${escapeHtml(link)}" style="color:#C8442F">${escapeHtml(copy.requestTrack)}</a></p>
    <p style="color:#4a6c82;font-size:14px">${escapeHtml(copy.footer)}</p>
  </div>`;
  return {
    from: FROM_ADDRESS,
    to: [order.contactEmail],
    reply_to: TEAM_REPLY_TO,
    subject: sanitizeHeaderLine(copy.requestSubject(order.reference), 200),
    html,
  };
}

// Guest quote email with the accept link (token-bearing; payload redacted after send).
function quoteReadyEmail(order, accessToken) {
  const copy = GUEST_COPY[order.language] || GUEST_COPY.en;
  const link = orderLink(order, accessToken);
  const expiry = order.quoteExpiresAt ? new Date(order.quoteExpiresAt).toUTCString() : null;
  const html = `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1A4D6E">
    <h2 style="color:#215A7C">${escapeHtml(copy.heading(order.contactName?.split(' ')[0] || ''))}</h2>
    <p>${escapeHtml(copy.quoteIntro)}</p>
    ${order.quoteNote ? `<p style="color:#4a6c82">${escapeHtml(order.quoteNote)}</p>` : ''}
    <p style="color:#4a6c82">Order <strong>${escapeHtml(order.reference)}</strong></p>
    <table style="width:100%;border-collapse:collapse">${requestItemRows(order)}</table>
    <p style="border-top:1px solid #E1E6EB;padding-top:10px"><strong>${escapeHtml(copy.totalDue)}: ${escapeHtml(money(order.totalMinor, order.currency))}</strong></p>
    <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#16445F;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none">${escapeHtml(copy.quoteCta)}</a></p>
    ${expiry ? `<p style="color:#4a6c82;font-size:14px">${escapeHtml(copy.quoteExpiry)} ${escapeHtml(expiry)}.</p>` : ''}
    <p style="color:#4a6c82;font-size:14px">${escapeHtml(copy.footer)}</p>
  </div>`;
  return {
    from: FROM_ADDRESS,
    to: [order.contactEmail],
    reply_to: TEAM_REPLY_TO,
    subject: sanitizeHeaderLine(copy.quoteSubject(order.reference), 200),
    html,
  };
}

// Team alert for a fresh request (includes the guest's wishes verbatim).
function requestTeamEmail(order) {
  const rows = order.items.map((item) =>
    `<li><strong>${escapeHtml(item.title)}</strong> — ${item.kind === 'request'
      ? `requested: ${escapeHtml(item.requestedDates || '—')}`
      : `${escapeHtml(String(item.date || ''))} ${escapeHtml(item.time || '')}`} · ${escapeHtml(String(item.guests))} guests</li>`).join('');
  const html = `
  <div style="font-family:Arial,sans-serif;color:#1A4D6E">
    <h3>New trip request ${escapeHtml(order.reference)}</h3>
    <p>${escapeHtml(order.contactName)} · ${escapeHtml(order.contactEmail)}${order.contactPhone ? ` · ${escapeHtml(order.contactPhone)}` : ''} · lang ${escapeHtml(order.language)}</p>
    <ul>${rows}</ul>
    <p>Confirm with suppliers, then quote via <code>store_staff_quote</code> — see docs/store-ops.md.</p>
  </div>`;
  return {
    from: FROM_ADDRESS,
    to: [TEAM_TO],
    reply_to: order.contactEmail ? [order.contactEmail] : undefined,
    subject: sanitizeHeaderLine(`Trip request ${order.reference} — ${order.items.length} item(s)`, 200),
    html,
  };
}

function teamEmail(order) {
  const rows = order.items.map((item) =>
    `<li><strong>${escapeHtml(item.bookingCode || '—')}</strong> — ${escapeHtml(item.title)} · ${escapeHtml(String(item.date))} ${escapeHtml(item.time)} · ${escapeHtml(String(item.guests))} guests · ${escapeHtml(money(item.totalMinor, order.currency))}</li>`).join('');
  const html = `
  <div style="font-family:Arial,sans-serif;color:#1A4D6E">
    <h3>Paid store order ${escapeHtml(order.reference)} — ${escapeHtml(money(order.totalMinor, order.currency))}</h3>
    <p>${escapeHtml(order.contactName)} · ${escapeHtml(order.contactEmail)}${order.contactPhone ? ` · ${escapeHtml(order.contactPhone)}` : ''}</p>
    <ul>${rows}</ul>
  </div>`;
  return {
    from: FROM_ADDRESS,
    to: [TEAM_TO],
    reply_to: order.contactEmail ? [order.contactEmail] : undefined,
    subject: sanitizeHeaderLine(`Store booking ${order.reference} — ${order.items.length} trip(s)`, 200),
    html,
  };
}

export default async () => {
  const resendKey = process.env.RESEND_API_KEY || '';
  if (!storeApiEnabled() || !resendKey) return new Response('outbox disabled', { status: 200 });
  const send = createResendSender(resendKey);

  try {
    const due = await callStoreRpc('store_outbox_due', { p_limit: 10 });
    let sent = 0;
    for (const entry of Array.isArray(due) ? due : []) {
      try {
        const order = await callStoreRpc('store_order_for_notification', { p_reference: entry.reference });
        const allowedStatuses = KIND_STATUS[entry.kind] || ['paid'];
        if (!order?.ok || !allowedStatuses.includes(order.status)) {
          await callStoreRpc('store_outbox_mark', { p_id: entry.id, p_sent: false });
          continue;
        }

        const accessToken = entry.accessToken || null;
        let payload;
        switch (entry.kind) {
          case 'order_receipt': payload = guestEmail(order); break;
          case 'request_received': payload = requestReceivedEmail(order, accessToken); break;
          case 'quote_ready': payload = quoteReadyEmail(order, accessToken); break;
          case 'request_team_alert': payload = requestTeamEmail(order); break;
          default: payload = teamEmail(order);
        }

        const response = await send(payload);
        const delivered = response.ok;
        await callStoreRpc('store_outbox_mark', { p_id: entry.id, p_sent: delivered });
        // Never leave a raw order token at rest once the email is out.
        if (delivered && accessToken) {
          await callStoreRpc('store_outbox_redact', { p_id: entry.id }).catch(() => {});
        }
        if (delivered) sent += 1;
      } catch (error) {
        await callStoreRpc('store_outbox_mark', { p_id: entry.id, p_sent: false }).catch(() => {});
        await captureFunctionException(error, { functionName: FUNCTION_NAME, extra: { stage: 'outbox-entry' } });
      }
    }
    console.log(`${FUNCTION_NAME}: sent ${sent}/${Array.isArray(due) ? due.length : 0}`);
    return Response.json({ ok: true, sent });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME });
    return Response.json({ ok: false }, { status: 500 });
  }
};

export const config = { schedule: '*/5 * * * *' };
