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

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

// Parses the bot's final structured handoff message into discrete blocks.
// Returns { contact, tripDetails: [{label, value}], itineraryDays: [string], pricing, signoff }
// Falls back to a single "raw" block if the message doesn't match the expected layout.
function parseHandoff(text) {
  const cleaned = stripMarkdown(text || '');
  const lines = cleaned.split(/\r?\n/).map((line) => line.trim());

  const sections = {
    contact: { name: '', email: '', phone: '' },
    tripDetails: [],
    itineraryDays: [],
    pricing: '',
    signoff: '',
    raw: cleaned,
  };
  let mode = 'preamble';

  for (const line of lines) {
    if (!line) continue;

    if (/^contact\s*$/i.test(line)) { mode = 'contact'; continue; }
    if (/^trip details/i.test(line)) { mode = 'details'; continue; }
    if (/^draft itinerary|^itinerary$/i.test(line)) { mode = 'itinerary'; continue; }
    if (/^estimated\s+(range|budget|price)/i.test(line)) {
      sections.pricing = line;
      mode = 'pricing-done';
      continue;
    }

    if (mode === 'contact' && /^[-•]\s+/.test(line)) {
      const body = line.replace(/^[-•]\s+/, '');
      const idx = body.indexOf(':');
      if (idx > 0) {
        const label = body.slice(0, idx).trim().toLowerCase();
        const value = body.slice(idx + 1).trim();
        if (/name/.test(label)) sections.contact.name = value;
        else if (/email/.test(label)) sections.contact.email = value;
        else if (/phone|whatsapp|mobile/.test(label)) {
          sections.contact.phone = /^(not provided|n\/a|none|—|-)$/i.test(value) ? '' : value;
        }
      }
      continue;
    }

    if (mode === 'details' && /^[-•]\s+/.test(line)) {
      const body = line.replace(/^[-•]\s+/, '');
      const [label, ...rest] = body.split(':');
      if (rest.length > 0) {
        sections.tripDetails.push({ label: label.trim(), value: rest.join(':').trim() });
      } else {
        sections.tripDetails.push({ label: '', value: body.trim() });
      }
      continue;
    }

    if (mode === 'itinerary' && /^day\s+\d+/i.test(line)) {
      sections.itineraryDays.push(line);
      continue;
    }

    if ((mode === 'pricing-done' || mode === 'itinerary') && /^(asante|thank|great)/i.test(line)) {
      sections.signoff = line;
      mode = 'signoff';
      continue;
    }
  }

  return sections;
}

function renderHandoffHtml(handoff) {
  const blocks = [];

  if (handoff.tripDetails.length > 0) {
    const rows = handoff.tripDetails.map((item) => `
      <tr>
        <td style="padding:8px 12px;font-size:12px;color:#4a6c82;width:160px;vertical-align:top;text-transform:uppercase;letter-spacing:.04em;font-weight:700;">${escapeHtml(item.label || 'Detail')}</td>
        <td style="padding:8px 12px;font-size:14px;color:#1a1a1a;line-height:1.5;">${escapeHtml(item.value)}</td>
      </tr>`).join('');
    blocks.push(`
      <h2 style="margin:24px 0 10px 0;font-size:13px;color:#4a6c82;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Trip details</h2>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#fafbfd;border-radius:8px;overflow:hidden;">${rows}</table>`);
  }

  if (handoff.itineraryDays.length > 0) {
    const days = handoff.itineraryDays.map((day) => {
      const match = day.match(/^(day\s+\d+)\s*[:\-–]\s*(.+)$/i);
      const label = match ? match[1] : '';
      const body = match ? match[2] : day;
      return `<li style="margin:0 0 10px 0;padding:10px 14px;background:#fafbfd;border-left:3px solid #FF6F61;border-radius:0 6px 6px 0;list-style:none;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#FF6F61;margin-bottom:3px;">${escapeHtml(label)}</div>
        <div style="font-size:14px;line-height:1.55;color:#1a1a1a;">${escapeHtml(body)}</div>
      </li>`;
    }).join('');
    blocks.push(`
      <h2 style="margin:24px 0 10px 0;font-size:13px;color:#4a6c82;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Draft itinerary</h2>
      <ol style="margin:0;padding:0;">${days}</ol>`);
  }

  if (handoff.pricing) {
    blocks.push(`
      <p style="margin:18px 0 0 0;padding:12px 14px;background:#FFF6F4;border-radius:8px;font-size:14px;color:#1a1a1a;line-height:1.55;"><strong style="color:#1A4D6E;">${escapeHtml(handoff.pricing.split(':')[0] || 'Estimated range')}:</strong>${escapeHtml(handoff.pricing.includes(':') ? handoff.pricing.split(':').slice(1).join(':') : '')}</p>`);
  }

  if (blocks.length === 0) {
    // Fallback: render raw cleaned text as paragraphs.
    const paragraphs = handoff.raw.split(/\n{2,}/).map((p) => `<p style="margin:0 0 12px 0;font-size:14px;color:#1a1a1a;line-height:1.55;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
    blocks.push(paragraphs);
  }

  return blocks.join('');
}

function renderHandoffPlain(handoff) {
  const lines = [];
  if (handoff.tripDetails.length > 0) {
    lines.push('Trip details');
    handoff.tripDetails.forEach((item) => {
      lines.push(`- ${item.label}: ${item.value}`.trim().replace(/^- :\s*/, '- '));
    });
    lines.push('');
  }
  if (handoff.itineraryDays.length > 0) {
    lines.push('Draft itinerary');
    handoff.itineraryDays.forEach((day) => lines.push(day));
    lines.push('');
  }
  if (handoff.pricing) {
    lines.push(handoff.pricing);
    lines.push('');
  }
  if (lines.length === 0) return handoff.raw;
  return lines.join('\n').trim();
}

function validateBody(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request body.' };

  const rawContact = (body.contact && typeof body.contact === 'object') ? body.contact : {};
  let name = (rawContact.name || '').toString().trim().slice(0, 120);
  let email = (rawContact.email || '').toString().trim().slice(0, 200);
  let phone = (rawContact.phone || '').toString().trim().slice(0, 60);

  if (!Array.isArray(body.history)) return { ok: false, error: 'Missing chat history.' };

  const messages = [];
  for (const item of body.history) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant') || typeof item.content !== 'string') continue;
    const content = item.content.trim();
    if (!content) continue;
    if (content.length > MAX_MESSAGE_CHARS) continue;
    messages.push({ role: item.role, content });
    if (messages.length >= MAX_HISTORY_MESSAGES) break;
  }

  if (messages.length === 0) return { ok: false, error: 'The chat is empty — share a few messages with the planner first.' };

  // Fall back to the bot's final structured handoff for any missing contact fields.
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const handoff = parseHandoff(lastAssistant ? lastAssistant.content : '');
  if (!name && handoff.contact.name) name = handoff.contact.name.slice(0, 120);
  if (!email && handoff.contact.email) email = handoff.contact.email.slice(0, 200);
  if (!phone && handoff.contact.phone) phone = handoff.contact.phone.slice(0, 60);

  if (!name) return { ok: false, error: 'Please share your name so the team knows who they are replying to.' };
  if (!EMAIL_REGEX.test(email)) return { ok: false, error: 'That email does not look right. Could you double-check it?' };

  return { ok: true, contact: { name, email, phone }, messages, handoff };
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

  const { contact, messages, handoff } = validated;
  const subject = `New planner draft from ${contact.name}`;

  const contactRows = `<table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 6px 0;border-collapse:collapse;">
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
        ${contactRows}
        ${renderHandoffHtml(handoff)}
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
    renderHandoffPlain(handoff),
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
