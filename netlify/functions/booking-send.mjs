// Booking send — booking request form, delivered via Resend.

import { resolve4, resolve6, resolveMx } from 'node:dns/promises';
import { domainToASCII } from 'node:url';

const TEAM_TO = process.env.TEAM_EMAIL_BOOKING || 'info@yournexttriptoparadise.com';
const FROM_ADDRESS = process.env.RESEND_FROM_BOOKING || 'Destination Paradise <booking@yournexttriptoparadise.com>';
const TEAM_REPLY_TO = process.env.TEAM_REPLY_TO || 'info@yournexttriptoparadise.com';

const MAX_REQUEST_BYTES = 60_000;
const MAX_FIELD = 400;
const MAX_MESSAGE = 8_000;
const MAX_DRAFT = 8_000;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const EMAIL_SYNTAX_MESSAGE = 'That email does not look right. Could you double-check it?';
const EMAIL_DOMAIN_MESSAGE = 'That email domain does not appear to receive mail. Please check for typos or use another address.';
const EMAIL_DOMAIN_VERIFY_MESSAGE = 'We could not verify that email domain just now. Please try again in a moment or use another address.';
const EMAIL_DOMAIN_CACHE_TTL_MS = 30 * 60_000;
const PERMANENT_DNS_CODES = new Set(['ENODATA', 'ENOTFOUND', 'ENONAME', 'ENODOMAIN', 'ENOENT', 'NOTFOUND']);
const TEMPORARY_DNS_CODES = new Set(['EAI_AGAIN', 'ETIMEOUT', 'ESERVFAIL', 'SERVFAIL', 'ECONNREFUSED']);
const emailDomainCache = new Map();

const defaultDnsResolver = {
  resolveMx,
  resolve4,
  resolve6,
};

const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX_REQUESTS = 4;
const rateLimitBuckets = new Map();

function rateLimitKey(req) {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  return forwarded.split(',')[0].trim() || req.headers.get('x-nf-client-connection-ip') || 'unknown';
}

function checkRateLimit(key) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(key, { start: now, count: 1 });
    return { ok: true };
  }
  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.start)) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}

const escapeHtml = (text) => String(text || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const trimField = (value, max = MAX_FIELD) => String(value || '').trim().slice(0, max);

const errorResponse = (message, status = 400) =>
  Response.json({ ok: false, error: message }, { status });

function isValidDnsLabel(label) {
  return (
    label.length > 0 &&
    label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  );
}

function normalizeEmailAddress(email) {
  if (!EMAIL_REGEX.test(email) || email.length > 254) return null;

  const atIndex = email.lastIndexOf('@');
  const local = email.slice(0, atIndex);
  const domain = domainToASCII(email.slice(atIndex + 1).toLowerCase());
  const labels = domain.split('.');
  const tld = labels.at(-1);

  if (
    !local ||
    local.length > 64 ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    local.includes('..') ||
    !domain ||
    domain.length > 253 ||
    labels.length < 2 ||
    labels.some((label) => !isValidDnsLabel(label)) ||
    !/^[a-z]{2,63}$/i.test(tld)
  ) {
    return null;
  }

  return {
    email: `${local}@${domain}`,
    domain,
  };
}

function dnsCode(err) {
  return err?.code || err?.cause?.code || '';
}

function isPermanentDnsError(err) {
  return PERMANENT_DNS_CODES.has(dnsCode(err));
}

function isTemporaryDnsError(err) {
  return TEMPORARY_DNS_CODES.has(dnsCode(err));
}

async function lookupRecords(lookup) {
  try {
    const records = await lookup();
    return { records: Array.isArray(records) ? records : [] };
  } catch (err) {
    return { error: err };
  }
}

async function domainAcceptsMail(domain, resolver = defaultDnsResolver) {
  const cached = emailDomainCache.get(domain);
  if (cached && Date.now() - cached.createdAt < EMAIL_DOMAIN_CACHE_TTL_MS) return cached.result;

  const mx = await lookupRecords(() => resolver.resolveMx(domain));
  const mxRecords = mx.records || [];
  if (mxRecords.some((record) => record.exchange && record.exchange !== '.')) {
    const result = { ok: true };
    emailDomainCache.set(domain, { result, createdAt: Date.now() });
    return result;
  }
  if (mxRecords.some((record) => record.exchange === '.')) {
    const result = { ok: false, status: 400, message: EMAIL_DOMAIN_MESSAGE };
    emailDomainCache.set(domain, { result, createdAt: Date.now() });
    return result;
  }

  const [a, aaaa] = await Promise.all([
    lookupRecords(() => resolver.resolve4(domain)),
    lookupRecords(() => resolver.resolve6(domain)),
  ]);

  if ((a.records || []).length > 0 || (aaaa.records || []).length > 0) {
    const result = { ok: true };
    emailDomainCache.set(domain, { result, createdAt: Date.now() });
    return result;
  }

  const errors = [mx.error, a.error, aaaa.error].filter(Boolean);
  if (errors.some(isTemporaryDnsError) && !errors.every(isPermanentDnsError)) {
    return { ok: false, status: 503, message: EMAIL_DOMAIN_VERIFY_MESSAGE };
  }

  const result = { ok: false, status: 400, message: EMAIL_DOMAIN_MESSAGE };
  emailDomainCache.set(domain, { result, createdAt: Date.now() });
  return result;
}

export async function validateEmailAddress(email, resolver = defaultDnsResolver) {
  const normalized = normalizeEmailAddress(email);
  if (!normalized) return { ok: false, status: 400, message: EMAIL_SYNTAX_MESSAGE };

  const domainResult = await domainAcceptsMail(normalized.domain, resolver);
  if (!domainResult.ok) return domainResult;

  return { ok: true, email: normalized.email, domain: normalized.domain };
}

function row(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:8px 12px;font-size:12px;color:#4a6c82;width:170px;vertical-align:top;text-transform:uppercase;letter-spacing:.04em;font-weight:700;">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;font-size:14px;color:#1a1a1a;line-height:1.5;">${escapeHtml(value)}</td>
  </tr>`;
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const requestBytes = Number(req.headers.get('content-length') || 0);
  if (requestBytes > MAX_REQUEST_BYTES) return errorResponse('That request is too large.');

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return errorResponse('Please send JSON.', 415);

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "You've sent a few requests already — give the team a moment, then try again." },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Could not read request body.');
  }

  if (body && typeof body === 'object' && body.botField) {
    return Response.json({ ok: true });
  }

  const name = trimField(body?.name, 120);
  let email = trimField(body?.email, 200);
  const phone = trimField(body?.phone, 60);
  const whatsapp = trimField(body?.whatsapp, 60);
  const serviceType = trimField(body?.serviceType, 40);
  const product = trimField(body?.product, 200);
  const productLabel = trimField(body?.productLabel, 200);
  const estimatedPrice = trimField(body?.estimatedPrice, 200);
  const startDate = trimField(body?.startDate, 40);
  const endDate = trimField(body?.endDate, 40);
  const guests = trimField(body?.guests, 40);
  const transferTier = trimField(body?.transferTier, 80);
  const pickupLocation = trimField(body?.pickupLocation, 160);
  const dropoffLocation = trimField(body?.dropoffLocation, 160);
  const flightNumber = trimField(body?.flightNumber, 80);
  const transferTime = trimField(body?.transferTime, 40);
  const budget = trimField(body?.budget, 80);
  const accommodationLevel = trimField(body?.accommodationLevel, 80);
  const paymentPreference = trimField(body?.paymentPreference, 80);
  const message = String(body?.message || '').trim().slice(0, MAX_MESSAGE);
  const source = trimField(body?.source, 40) || 'booking';
  const plannerDraft = String(body?.plannerDraft || '').trim().slice(0, MAX_DRAFT);

  if (!name) return errorResponse('Please share your name.');
  const emailValidation = await validateEmailAddress(email);
  if (!emailValidation.ok) return errorResponse(emailValidation.message, emailValidation.status);
  email = emailValidation.email;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('booking-send: missing RESEND_API_KEY');
    return errorResponse('The mailer is not configured yet. Please email us directly, or message us on WhatsApp.', 503);
  }

  const productLine = productLabel && productLabel !== 'Not selected'
    ? productLabel
    : (serviceType ? `Flexible — ${serviceType}` : 'Flexible custom plan');

  const datesLine = endDate
    ? `${startDate || 'Flexible'} → ${endDate}`
    : (startDate || 'Flexible');

  const subject = `Booking request — ${productLine} (${name})`;

  const summaryRows = [
    row('Service', serviceType),
    row('Product', productLine),
    row('Estimated price', estimatedPrice),
    row('Dates', datesLine),
    row('Guests', guests),
    row('Transfer tier', transferTier),
    row('Pickup', pickupLocation),
    row('Drop-off', dropoffLocation),
    row('Flight / ferry', flightNumber),
    row('Pickup time', transferTime),
    row('Budget', budget),
    row('Comfort', accommodationLevel),
    row('Payment', paymentPreference),
  ].join('');

  const contactRows = [
    row('Name', name),
    row('Email', email),
    row('Phone', phone),
    row('WhatsApp', whatsapp),
  ].join('');

  const messageBlock = message
    ? `<h2 style="margin:24px 0 10px 0;font-size:13px;color:#4a6c82;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">From the guest</h2>
       <div style="padding:14px 16px;background:#fafbfd;border-left:3px solid #1A4D6E;border-radius:0 6px 6px 0;font-size:14px;line-height:1.55;color:#1a1a1a;white-space:pre-wrap;">${escapeHtml(message)}</div>`
    : '';

  const draftBlock = plannerDraft
    ? `<h2 style="margin:24px 0 10px 0;font-size:13px;color:#4a6c82;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">AI planner draft</h2>
       <div style="padding:14px 16px;background:#FFF6F4;border-left:3px solid #FF6F61;border-radius:0 6px 6px 0;font-size:13px;line-height:1.6;color:#1a1a1a;white-space:pre-wrap;">${escapeHtml(plannerDraft)}</div>`
    : '';

  const teamHtml = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(26,77,110,0.08);">
      <div style="padding:22px 24px;background:linear-gradient(120deg,#1A4D6E 0%,#FF6F61 100%);color:#fff;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.85;">Booking request${source === 'planner' ? ' · planner handoff' : ''}</div>
        <h1 style="margin:6px 0 0 0;font-size:22px;font-weight:700;">${escapeHtml(name)} wants to book</h1>
      </div>
      <div style="padding:24px;">
        <h2 style="margin:0 0 10px 0;font-size:13px;color:#4a6c82;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Trip request</h2>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#fafbfd;border-radius:8px;overflow:hidden;margin-bottom:18px;">${summaryRows}</table>
        <h2 style="margin:18px 0 10px 0;font-size:13px;color:#4a6c82;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Contact</h2>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#fafbfd;border-radius:8px;overflow:hidden;">${contactRows}</table>
        ${messageBlock}
        ${draftBlock}
        <p style="margin:24px 0 0 0;font-size:13px;color:#4a6c82;line-height:1.55;">Reply directly to this email and your message will go straight to the guest. They received their own confirmation copy.</p>
      </div>
    </div>
  </body></html>`;

  const teamText = [
    `Booking request from ${name}${source === 'planner' ? ' (planner handoff)' : ''}`,
    '',
    `Service: ${serviceType}`,
    `Product: ${productLine}`,
    estimatedPrice ? `Estimated price: ${estimatedPrice}` : '',
    `Dates: ${datesLine}`,
    guests ? `Guests: ${guests}` : '',
    transferTier ? `Transfer tier: ${transferTier}` : '',
    pickupLocation ? `Pickup: ${pickupLocation}` : '',
    dropoffLocation ? `Drop-off: ${dropoffLocation}` : '',
    flightNumber ? `Flight / ferry: ${flightNumber}` : '',
    transferTime ? `Pickup time: ${transferTime}` : '',
    budget ? `Budget: ${budget}` : '',
    accommodationLevel ? `Comfort: ${accommodationLevel}` : '',
    paymentPreference ? `Payment: ${paymentPreference}` : '',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : '',
    whatsapp ? `WhatsApp: ${whatsapp}` : '',
    '',
    message ? `--- Guest message ---\n${message}` : '',
    plannerDraft ? `\n--- AI planner draft ---\n${plannerDraft}` : '',
    '',
    'Reply directly to this email to reach the guest.',
  ].filter(Boolean).join('\n');

  const guestSubject = `We got your booking request — Destination Paradise`;
  const guestHtml = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(26,77,110,0.08);">
      <div style="padding:22px 24px;background:linear-gradient(120deg,#1A4D6E 0%,#FF6F61 100%);color:#fff;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.85;">Destination Paradise</div>
        <h1 style="margin:6px 0 0 0;font-size:22px;font-weight:700;">Asante, ${escapeHtml(name.split(' ')[0])} — your request is in!</h1>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 14px 0;font-size:15px;color:#1a1a1a;line-height:1.6;">We got your booking request and our team is on it. You'll hear back within a day with availability, a final price, and (if you asked for it) a secure online payment link.</p>
        <p style="margin:0 0 18px 0;font-size:14px;color:#4a6c82;line-height:1.6;">Here's a copy of what you sent us, just for your records.</p>
        <h2 style="margin:18px 0 10px 0;font-size:13px;color:#4a6c82;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Trip request</h2>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#fafbfd;border-radius:8px;overflow:hidden;margin-bottom:18px;">${summaryRows}</table>
        ${messageBlock}
        ${draftBlock}
        <div style="margin:28px 0 0 0;padding:16px 18px;background:#fafbfd;border-radius:10px;font-size:13px;color:#4a6c82;line-height:1.6;">
          <strong style="color:#1A4D6E;">Need us sooner? Just reply to this email,</strong> or reach us on:<br>
          WhatsApp: <a href="https://wa.me/255768779517" style="color:#1A4D6E;">+255 768 779 517</a><br>
          Email: info@yournexttriptoparadise.com
        </div>
      </div>
    </div>
  </body></html>`;

  const guestText = [
    `Asante, ${name.split(' ')[0]} — your booking request is in.`,
    '',
    "We got it and our team is on it. You'll hear back within a day with availability, a final price, and (if requested) a secure payment link.",
    '',
    'Here is a copy of your request:',
    `Service: ${serviceType}`,
    `Product: ${productLine}`,
    estimatedPrice ? `Estimated price: ${estimatedPrice}` : '',
    `Dates: ${datesLine}`,
    guests ? `Guests: ${guests}` : '',
    transferTier ? `Transfer tier: ${transferTier}` : '',
    pickupLocation ? `Pickup: ${pickupLocation}` : '',
    dropoffLocation ? `Drop-off: ${dropoffLocation}` : '',
    flightNumber ? `Flight / ferry: ${flightNumber}` : '',
    transferTime ? `Pickup time: ${transferTime}` : '',
    budget ? `Budget: ${budget}` : '',
    accommodationLevel ? `Comfort: ${accommodationLevel}` : '',
    paymentPreference ? `Payment: ${paymentPreference}` : '',
    '',
    message ? `Your note:\n${message}` : '',
    '',
    'Need us sooner? Just reply to this email, or:',
    'WhatsApp: +255 768 779 517',
    'Email: info@yournexttriptoparadise.com',
  ].filter(Boolean).join('\n');

  const sendEmail = (payload) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'authorization': `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  try {
    const teamRes = await sendEmail({
      from: FROM_ADDRESS,
      to: [TEAM_TO],
      reply_to: email,
      subject,
      html: teamHtml,
      text: teamText,
    });

    if (!teamRes.ok) {
      const errText = await teamRes.text().catch(() => '');
      console.error('Resend team error', teamRes.status, errText);
      return errorResponse('We could not send your booking request just now. Please try again in a moment, or message us on WhatsApp.', 502);
    }

    try {
      const guestRes = await sendEmail({
        from: FROM_ADDRESS,
        to: [email],
        reply_to: TEAM_REPLY_TO,
        subject: guestSubject,
        html: guestHtml,
        text: guestText,
      });
      if (!guestRes.ok) {
        const errText = await guestRes.text().catch(() => '');
        console.error('Resend guest copy failed', guestRes.status, errText);
      }
    } catch (err) {
      console.error('Guest copy send failure', err);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('booking-send failure', err);
    return errorResponse('We could not send your booking request just now. Please try again.', 502);
  }
};

export const config = { path: '/api/booking-send' };
