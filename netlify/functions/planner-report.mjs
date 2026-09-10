// An explicitly submitted AI-content report reaches the existing planner team's
// review mailbox through the configured Resend provider. Never accepts a chat history.
import { createRateLimiter, createResendSender, errorResponse, escapeHtml, rateLimitKey } from './_shared.mjs';

const MAX_REQUEST_BYTES = 60_000;
const MAX_REPLY_CHARS = 16_000;
const MAX_NOTES_CHARS = 1_000;
const ALLOWED_ORIGINS = new Set([
  'https://yournexttriptoparadise.com',
  'https://www.yournexttriptoparadise.com',
  'https://destination-paradise-mobile.netlify.app',
]);
const REASONS = {
  offensive: 'Harmful or offensive content',
  inaccurate: 'Inaccurate or misleading content',
  privacy: 'Privacy concern',
  other: 'Other concern',
};

export function validateReport(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'Invalid report.' };
  if (Object.keys(body).some((key) => !['reason', 'reply', 'notes', 'consent'].includes(key))) {
    return { ok: false, error: 'Send only the selected reply, reason and notes.' };
  }
  if (body.consent !== true) return { ok: false, error: 'Confirm that you want to share this report with the team.' };
  if (typeof body.reason !== 'string' || !Object.hasOwn(REASONS, body.reason)) return { ok: false, error: 'Choose a reason for your report.' };
  if (typeof body.reply !== 'string' || !body.reply.trim() || body.reply.length > MAX_REPLY_CHARS) return { ok: false, error: 'The reported reply must contain between 1 and 16,000 characters.' };
  if (body.notes !== undefined && (typeof body.notes !== 'string' || body.notes.length > MAX_NOTES_CHARS)) return { ok: false, error: 'Keep your notes under 1,000 characters.' };
  // Preserve the reply exactly as reviewed. Do not silently trim, summarize, or
  // add the user's other messages to a moderation report.
  return { ok: true, report: { reason: body.reason, reply: body.reply, notes: body.notes || '' } };
}

async function readReportBody(req) {
  if (Number(req.headers.get('content-length') || 0) > MAX_REQUEST_BYTES) return { error: 'This report is too large.', status: 413 };
  if (!req.body) return { error: 'Missing report.', status: 400 };
  const reader = req.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return { error: 'This report is too large.', status: 413 };
      }
      chunks.push(Buffer.from(value));
    }
    return { body: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
  } catch {
    return { error: 'Could not read the report. Please try again.', status: 400 };
  } finally {
    reader.releaseLock();
  }
}

export function createPlannerReportHandler({
  env = process.env,
  checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 4 }),
  sendEmail,
} = {}) {
  return async (req) => {
    const origin = req.headers.get('origin');
    const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin);
    const respond = (response) => {
      response.headers.set('cache-control', 'no-store');
      response.headers.set('vary', 'Origin');
      if (allowedOrigin) response.headers.set('access-control-allow-origin', origin);
      return response;
    };
    // Native apps have no Origin header; browser requests are limited to our
    // website. Local web preview uses its fixed server-side API proxy.
    if (origin && !allowedOrigin) return respond(errorResponse('This origin is not allowed.', 403));
    if (req.method === 'OPTIONS') {
      if (!allowedOrigin) return respond(errorResponse('This origin is not allowed.', 403));
      return respond(new Response(null, { status: 204, headers: { 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'Content-Type' } }));
    }
    if (req.method !== 'POST') return respond(new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST, OPTIONS' } }));
    if (!(req.headers.get('content-type') || '').toLowerCase().includes('application/json')) return respond(errorResponse('Please send JSON.', 415));
    const limit = checkRateLimit(rateLimitKey(req));
    if (!limit.ok) return respond(Response.json({ ok: false, error: 'You have sent several reports. Please wait a few minutes before trying again.' }, { status: 429, headers: { 'retry-after': String(limit.retryAfter) } }));
    const input = await readReportBody(req);
    if (input.error) return respond(errorResponse(input.error, input.status));
    const validation = validateReport(input.body);
    if (!validation.ok) return respond(errorResponse(validation.error));
    if (!env.RESEND_API_KEY) return respond(errorResponse('Reporting is temporarily unavailable. Please try again later.', 503));
    const { report } = validation;
    const reason = REASONS[report.reason];
    const teamTo = env.TEAM_EMAIL_PLANNER || 'info@yournexttriptoparadise.com';
    const from = env.RESEND_FROM_PLANNER || 'Destination Paradise Planner <booking@yournexttriptoparadise.com>';
    const payload = {
      from,
      to: [teamTo],
      subject: `AI planner content report: ${reason}`,
      text: `AI planner content report\n\nReason: ${reason}\n\nFlagged assistant reply\n${report.reply}\n\nGuest notes\n${report.notes || '(No additional notes)'}\n\nThe guest explicitly submitted this selected reply for review. No other chat messages or contact fields were included. Review the reported content and use findings to improve planner safety, filtering and guidance. This is a content report, not a booking request.`,
      html: `<h1>AI planner content report</h1><p><strong>Reason:</strong> ${escapeHtml(reason)}</p><h2>Flagged assistant reply</h2><div style="white-space:pre-wrap">${escapeHtml(report.reply)}</div><h2>Guest notes</h2><div style="white-space:pre-wrap">${escapeHtml(report.notes || '(No additional notes)')}</div><p>The guest explicitly submitted this selected reply for review. No other chat messages or contact fields were included. Review the reported content and use findings to improve planner safety, filtering and guidance. This is a content report, not a booking request.</p>`,
    };
    try {
      const response = await (sendEmail || createResendSender(env.RESEND_API_KEY))(payload);
      if (!response.ok) {
        console.error('planner-report: report provider rejected submission', response.status);
        return respond(errorResponse('We could not confirm that your report was received. Please try again later.', 502));
      }
      return respond(Response.json({ ok: true }));
    } catch {
      // Never log potentially sensitive flagged text, notes, or provider bodies.
      console.error('planner-report: report delivery could not be confirmed');
      return respond(errorResponse('We could not confirm that your report was received. Please try again later.', 502));
    }
  };
}

export default createPlannerReportHandler();
export const config = { path: '/api/planner-report' };
