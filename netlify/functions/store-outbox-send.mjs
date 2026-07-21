// Scheduled notification-outbox processor: sends the order receipt (guest)
// and the booking manifest (team) queued by store_finalize_paid_order.
// Sending happens strictly AFTER commercial state is safe (the outbox rows
// are written in the finalize transaction); failures back off and retry, and
// a row is marked sent only on a 2xx from Resend.
//
// Copy is deliberately compact — full template/i18n polish is Phase 4.

import { createResendSender, escapeHtml, sanitizeHeaderLine } from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import { callStoreRpc, storeApiEnabled } from './_store_shared.mjs';

const FUNCTION_NAME = 'store-outbox-send';

const TEAM_TO = process.env.TEAM_EMAIL_BOOKING || 'info@yournexttriptoparadise.com';
const FROM_ADDRESS = process.env.RESEND_FROM_BOOKING || 'Destination Paradise <booking@yournexttriptoparadise.com>';
const TEAM_REPLY_TO = process.env.TEAM_REPLY_TO || 'info@yournexttriptoparadise.com';

const GUEST_COPY = {
  en: {
    subject: (ref) => `Your Destination Paradise booking — order ${ref}`,
    heading: (name) => `Asante${name ? `, ${name}` : ''} — you're going to Paradise!`,
    intro: 'Your payment is confirmed. Every experience below has its own booking code — keep this email for the day.',
    guests: 'guests',
    total: 'Total paid',
    footer: 'Questions? Just reply to this email.',
  },
  de: {
    subject: (ref) => `Deine Destination-Paradise-Buchung — Bestellung ${ref}`,
    heading: (name) => `Asante${name ? `, ${name}` : ''} — es geht ins Paradies!`,
    intro: 'Deine Zahlung ist bestätigt. Jedes Erlebnis unten hat seinen eigenen Buchungscode — heb dir diese E-Mail für den Tag auf.',
    guests: 'Gäste',
    total: 'Gesamt bezahlt',
    footer: 'Fragen? Antworte einfach auf diese E-Mail.',
  },
  pl: {
    subject: (ref) => `Twoja rezerwacja Destination Paradise — zamówienie ${ref}`,
    heading: (name) => `Asante${name ? `, ${name}` : ''} — ruszasz do raju!`,
    intro: 'Twoja płatność jest potwierdzona. Każda atrakcja poniżej ma własny kod rezerwacji — zachowaj tę wiadomość.',
    guests: 'gości',
    total: 'Zapłacono łącznie',
    footer: 'Pytania? Po prostu odpowiedz na tę wiadomość.',
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
        if (!order?.ok || order.status !== 'paid') {
          await callStoreRpc('store_outbox_mark', { p_id: entry.id, p_sent: false });
          continue;
        }
        const payload = entry.kind === 'order_receipt' ? guestEmail(order) : teamEmail(order);
        const response = await send(payload);
        const delivered = response.ok;
        await callStoreRpc('store_outbox_mark', { p_id: entry.id, p_sent: delivered });
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
