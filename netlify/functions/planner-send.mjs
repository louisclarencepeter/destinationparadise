// Planner send — emails the chat transcript and contact info to the team
// via Resend. Triggered after the planner collects the guest's contact info.

const TEAM_TO = process.env.TEAM_EMAIL_PLANNER || 'info@yournexttriptoparadise.com';
const FROM_ADDRESS = process.env.RESEND_FROM_PLANNER || 'Destination Paradise Planner <booking@yournexttriptoparadise.com>';

const MAX_REQUEST_BYTES = 60_000;
const MAX_HISTORY_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4_000;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

function formatTranscriptHtml(messages) {
  return messages.map((message) => {
    const who = message.role === 'user' ? 'Guest' : 'Planner';
    const accent = message.role === 'user' ? '#1A4D6E' : '#FF6F61';
    const body = escapeHtml(message.content).replace(/\n/g, '<br>');
    return `<div style="margin:0 0 14px 0;padding:10px 14px;border-left:3px solid ${accent};background:#fafbfd;">
      <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${accent};margin-bottom:4px;">${who}</div>
      <div style="font-size:14px;line-height:1.55;color:#1a1a1a;">${body}</div>
    </div>`;
  }).join('');
}

function formatTranscriptPlain(messages) {
  return messages.map((m) => `${m.role === 'user' ? 'Guest' : 'Planner'}: ${m.content}`).join('\n\n');
}

function validateBody(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request body.' };

  const { contact, history } = body;

  if (!contact || typeof contact !== 'object') return { ok: false, error: 'Missing contact info.' };
  const name = (contact.name || '').toString().trim().slice(0, 120);
  const email = (contact.email || '').toString().trim().slice(0, 200);
  const phone = (contact.phone || '').toString().trim().slice(0, 60);

  if (!name) return { ok: false, error: 'Please share your name so the team knows who they are replying to.' };
  if (!EMAIL_REGEX.test(email)) return { ok: false, error: 'That email does not look right. Could you double-check it?' };

  if (!Array.isArray(history)) return { ok: false, error: 'Missing chat history.' };

  const messages = [];
  for (const item of history) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant') || typeof item.content !== 'string') continue;
    const content = item.content.trim();
    if (!content) continue;
    if (content.length > MAX_MESSAGE_CHARS) continue;
    messages.push({ role: item.role, content });
    if (messages.length >= MAX_HISTORY_MESSAGES) break;
  }

  if (messages.length === 0) return { ok: false, error: 'The chat is empty — share a few messages with the planner first.' };

  return { ok: true, contact: { name, email, phone }, messages };
}

const errorResponse = (message, status = 400) =>
  Response.json({ ok: false, error: message }, { status });

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const requestBytes = Number(req.headers.get('content-length') || 0);
  if (requestBytes > MAX_REQUEST_BYTES) return errorResponse('That request is too large.');

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return errorResponse('Please send JSON.', 415);

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "You've sent a few drafts already — give the team a moment to reply, then try again." },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('planner-send: missing RESEND_API_KEY');
    return errorResponse('The team mailer is not configured yet. Please try the contact form, or message us on WhatsApp.', 503);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Could not read request body.');
  }

  const validated = validateBody(body);
  if (!validated.ok) return errorResponse(validated.error);

  const { contact, messages } = validated;

  const subject = `New planner draft from ${contact.name}`;
  const summary = `<table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 18px 0;border-collapse:collapse;">
    <tr><td style="padding:6px 10px;font-size:12px;color:#4a6c82;width:90px;">Name</td><td style="padding:6px 10px;font-size:14px;color:#1a1a1a;">${escapeHtml(contact.name)}</td></tr>
    <tr><td style="padding:6px 10px;font-size:12px;color:#4a6c82;">Email</td><td style="padding:6px 10px;font-size:14px;color:#1a1a1a;">${escapeHtml(contact.email)}</td></tr>
    ${contact.phone ? `<tr><td style="padding:6px 10px;font-size:12px;color:#4a6c82;">Phone</td><td style="padding:6px 10px;font-size:14px;color:#1a1a1a;">${escapeHtml(contact.phone)}</td></tr>` : ''}
  </table>`;

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(26,77,110,0.08);">
      <div style="padding:22px 24px;background:linear-gradient(120deg,#1A4D6E 0%,#FF6F61 100%);color:#fff;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.85;">AI Planner Draft</div>
        <h1 style="margin:6px 0 0 0;font-size:22px;font-weight:700;">${escapeHtml(contact.name)} wants to plan a trip</h1>
      </div>
      <div style="padding:24px;">
        ${summary}
        <h2 style="margin:18px 0 10px 0;font-size:14px;color:#4a6c82;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">Conversation</h2>
        ${formatTranscriptHtml(messages)}
        <p style="margin:24px 0 0 0;font-size:13px;color:#4a6c82;line-height:1.55;">Reply directly to this email and the guest will receive your note. They have been CC'd on this message.</p>
      </div>
    </div>
  </body></html>`;

  const text = [
    `New planner draft from ${contact.name}`,
    '',
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    contact.phone ? `Phone: ${contact.phone}` : '',
    '',
    '--- Conversation ---',
    '',
    formatTranscriptPlain(messages),
    '',
    'Reply directly to this email and the guest will receive your note.',
  ].filter(Boolean).join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TEAM_TO],
        cc: [contact.email],
        reply_to: contact.email,
        subject,
        html,
        text,
      }),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      console.error('Resend error', r.status, errText);
      return errorResponse('We could not send the draft just now. Please try again in a moment, or message us on WhatsApp.', 502);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('planner-send failure', err);
    return errorResponse('We could not send the draft just now. Please try again in a moment.', 502);
  }
};

export const config = { path: '/api/planner-send' };
