// Contact send — homepage contact form, delivered via Resend.

import {
  createRateLimiter,
  createResendSender,
  errorResponse,
  escapeHtml,
  normalizeLanguage,
  rateLimitKey,
  sanitizeHeaderLine,
  validateEmailAddress,
} from './_shared.mjs';
import { captureFunctionException, captureFunctionMessage } from './_sentry.mjs';

const FUNCTION_NAME = 'contact-send';

const TEAM_TO = process.env.TEAM_EMAIL_CONTACT || 'info@yournexttriptoparadise.com';
const FROM_ADDRESS = process.env.RESEND_FROM_CONTACT || 'Destination Paradise <booking@yournexttriptoparadise.com>';
const TEAM_REPLY_TO = process.env.TEAM_REPLY_TO || 'info@yournexttriptoparadise.com';

const MAX_REQUEST_BYTES = 30_000;
const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 8_000;

const checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 4 });

const CONTACT_GUEST_COPY = {
  en: {
    subject: 'We got your message — Destination Paradise',
    heading: (firstName) => `Asante, ${firstName} — we got your message.`,
    intro: 'Our team will read it and reply within a day. Below is the copy of what you sent us, just for your records.',
    subjectLabel: 'Subject',
    needSooner: 'Need us sooner?',
  },
  de: {
    subject: 'Wir haben deine Nachricht erhalten — Destination Paradise',
    heading: (firstName) => `Asante, ${firstName} — wir haben deine Nachricht erhalten.`,
    intro: 'Unser Team liest sie und antwortet innerhalb eines Tages. Unten findest du eine Kopie deiner Nachricht für deine Unterlagen.',
    subjectLabel: 'Betreff',
    needSooner: 'Soll es schneller gehen?',
  },
  pl: {
    subject: 'Otrzymaliśmy Twoją wiadomość — Destination Paradise',
    heading: (firstName) => `Asante, ${firstName} — mamy Twoją wiadomość.`,
    intro: 'Nasz zespół ją przeczyta i odpowie w ciągu jednego dnia. Poniżej znajdziesz kopię swojej wiadomości.',
    subjectLabel: 'Temat',
    needSooner: 'Potrzebujesz nas szybciej?',
  },
};

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const requestBytes = Number(req.headers.get('content-length') || 0);
  if (requestBytes > MAX_REQUEST_BYTES) return errorResponse('That message is too long.');

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return errorResponse('Please send JSON.', 415);

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "You've sent a few messages already — give the team a moment, then try again." },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('contact-send: missing RESEND_API_KEY');
    await captureFunctionMessage('Missing RESEND_API_KEY', {
      functionName: FUNCTION_NAME,
      req,
      level: 'warning',
    });
    return errorResponse('The mailer is not configured yet. Please email us directly, or message us on WhatsApp.', 503);
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

  const name = sanitizeHeaderLine(body?.name, MAX_NAME);
  let email = String(body?.email || '').trim().slice(0, MAX_EMAIL);
  const subject = sanitizeHeaderLine(body?.subject, MAX_SUBJECT);
  const message = String(body?.message || '').trim().slice(0, MAX_MESSAGE);
  const lang = normalizeLanguage(body?.lang);
  const guestCopy = CONTACT_GUEST_COPY[lang];
  const firstName = name.split(' ')[0];

  if (!name) return errorResponse('Please share your name.');
  if (!message) return errorResponse('Please add a short message so the team knows what you need.');
  const emailValidation = await validateEmailAddress(email);
  if (!emailValidation.ok) return errorResponse(emailValidation.message, emailValidation.status);
  email = emailValidation.email;

  const teamSubject = subject ? `Contact form — ${subject}` : `Contact form — message from ${name}`;
  const guestSubject = guestCopy.subject;
  const messageBlockHtml = `<div style="padding:14px 16px;background:#fafbfd;border-left:3px solid #1A4D6E;border-radius:6px;font-size:14px;line-height:1.55;color:#1a1a1a;white-space:pre-wrap;">${escapeHtml(message)}</div>`;

  const teamHtml = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(26,77,110,0.08);">
      <div style="padding:22px 24px;background:linear-gradient(120deg,#1A4D6E 0%,#215A7C 100%);color:#fff;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.85;">Contact form</div>
        <h1 style="margin:6px 0 0 0;font-size:22px;font-weight:700;">${escapeHtml(name)} sent a message</h1>
      </div>
      <div style="padding:24px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 18px 0;border-collapse:collapse;">
          <tr><td style="padding:6px 10px;font-size:12px;color:#4a6c82;width:90px;">Name</td><td style="padding:6px 10px;font-size:14px;color:#1a1a1a;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:6px 10px;font-size:12px;color:#4a6c82;">Email</td><td style="padding:6px 10px;font-size:14px;color:#1a1a1a;">${escapeHtml(email)}</td></tr>
          ${subject ? `<tr><td style="padding:6px 10px;font-size:12px;color:#4a6c82;">Subject</td><td style="padding:6px 10px;font-size:14px;color:#1a1a1a;">${escapeHtml(subject)}</td></tr>` : ''}
        </table>
        <h2 style="margin:18px 0 10px 0;font-size:14px;color:#4a6c82;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">Message</h2>
        ${messageBlockHtml}
        <p style="margin:24px 0 0 0;font-size:13px;color:#4a6c82;line-height:1.55;">Reply directly to this email and your message will go straight to the guest. They received their own confirmation copy.</p>
      </div>
    </div>
  </body></html>`;

  const teamText = [
    `New message from ${name}`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    subject ? `Subject: ${subject}` : '',
    '',
    '--- Message ---',
    '',
    message,
    '',
    'Reply directly to this email to reach the guest.',
  ].filter(Boolean).join('\n');

  const guestHtml = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(26,77,110,0.08);">
      <div style="padding:22px 24px;background:linear-gradient(120deg,#1A4D6E 0%,#215A7C 100%);color:#fff;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.85;">Destination Paradise</div>
        <h1 style="margin:6px 0 0 0;font-size:22px;font-weight:700;">${escapeHtml(guestCopy.heading(firstName))}</h1>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 14px 0;font-size:15px;color:#1a1a1a;line-height:1.6;">${escapeHtml(guestCopy.intro)}</p>
        ${subject ? `<p style="margin:0 0 12px 0;font-size:13px;color:#4a6c82;"><strong style="color:#1A4D6E;">${escapeHtml(guestCopy.subjectLabel)}:</strong> ${escapeHtml(subject)}</p>` : ''}
        ${messageBlockHtml}
        <div style="margin:28px 0 0 0;padding:16px 18px;background:#fafbfd;border-radius:10px;font-size:13px;color:#4a6c82;line-height:1.6;">
          <strong style="color:#1A4D6E;">${escapeHtml(guestCopy.needSooner)}</strong><br>
          WhatsApp: <a href="https://wa.me/255768779517" style="color:#1A4D6E;">+255 768 779 517</a><br>
          Email: info@yournexttriptoparadise.com
        </div>
      </div>
    </div>
  </body></html>`;

  const guestText = [
    guestCopy.heading(firstName),
    '',
    guestCopy.intro,
    '',
    subject ? `${guestCopy.subjectLabel}: ${subject}` : '',
    '',
    message,
    '',
    guestCopy.needSooner,
    'WhatsApp: +255 768 779 517',
    'Email: info@yournexttriptoparadise.com',
  ].filter(Boolean).join('\n');

  const sendEmail = createResendSender(apiKey);

  try {
    const teamRes = await sendEmail({
      from: FROM_ADDRESS,
      to: [TEAM_TO],
      reply_to: email,
      subject: teamSubject,
      html: teamHtml,
      text: teamText,
    });

    if (!teamRes.ok) {
      const errText = await teamRes.text().catch(() => '');
      console.error('Resend team error', teamRes.status, errText);
      await captureFunctionMessage('Resend team email failed', {
        functionName: FUNCTION_NAME,
        req,
        extra: { stage: 'team-email', status: teamRes.status, errorBody: errText },
      });
      return errorResponse('We could not send your message just now. Please try again in a moment, or message us on WhatsApp.', 502);
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
        await captureFunctionMessage('Resend guest copy failed', {
          functionName: FUNCTION_NAME,
          req,
          extra: { stage: 'guest-copy', status: guestRes.status, errorBody: errText },
        });
      }
    } catch (err) {
      console.error('Guest copy send failure', err);
      await captureFunctionException(err, {
        functionName: FUNCTION_NAME,
        req,
        extra: { stage: 'guest-copy' },
      });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('contact-send failure', err);
    await captureFunctionException(err, {
      functionName: FUNCTION_NAME,
      req,
      extra: { stage: 'send-email' },
    });
    return errorResponse('We could not send your message just now. Please try again.', 502);
  }
};

export const config = { path: '/api/contact-send' };
