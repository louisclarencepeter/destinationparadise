import { WEBSITE_URL } from '../data/content';
import { ApiError, requestJson, utf8Bytes, type RequestOptions } from './client';

export interface PlannerMessage { role: 'user' | 'assistant'; content: string }
export interface PlannerContact { name: string; email: string; phone?: string }
export type PlannerLanguage = 'en' | 'de' | 'pl';
export interface PlannerOptions extends RequestOptions { lang?: PlannerLanguage }
export interface PlannerReply { reply: string; handoffReady: boolean }
export const PLANNER_MESSAGE_LIMIT = 1_200;
// Web preview uses Metro's fixed same-origin proxy. Native requests use HTTPS.
const PLANNER_BASE_URL = process.env.EXPO_OS === 'web' ? '' : WEBSITE_URL;

/** Mirrors the existing backend's newest-first history bounds. */
export function preparePlannerHistory(history: PlannerMessage[]): PlannerMessage[] {
  const messages: PlannerMessage[] = [];
  let totalChars = 0;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];
    if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') continue;
    const content = item.content.trim();
    if (!content) continue;
    if (content.length > PLANNER_MESSAGE_LIMIT) {
      if (index === history.length - 1) throw new ApiError('Please keep your message under 1,200 characters.', 400, 'VALIDATION_ERROR');
      continue;
    }
    if (messages.length >= 16 || totalChars + content.length > 6_000) break;
    messages.unshift({ role: item.role, content });
    totalChars += content.length;
  }
  if (!messages.length) throw new ApiError('Write a message to start your plan.', 400, 'VALIDATION_ERROR');
  return messages;
}

/** Website AI text assumes automatic mail delivery; mobile requires an explicit reviewed submission. */
export function sanitizePlannerReply(raw: string): PlannerReply {
  const handoffReady = /\[\[PLANNER_HANDOFF_READY\]\]/i.test(raw);
  let reply = raw.replace(/\[\[PLANNER_[A-Z_]+\]\]/gi, '').trim();
  // Drop the website's entire handoff sign-off without touching its contact/itinerary sections.
  reply = reply.replace(/(?:^|\n)Asante,[^\n]*?(?:sent|inbox|reply within)[^\n]*/gi, '');
  const unconfirmedDelivery = /(?:\b(?:I(?:['’]ve| have)?|we(?:['’]ve| have)?)\s+(?:have\s+)?(?:(?:already|just|now|successfully)\s+)*(?:sent|emailed|forwarded|submitted|passed|booked|confirmed)|\b(?:draft|plan|trip|update|request|copy|booking)\b[^.!?\n]{0,45}\b(?:has been|was|is being|is now)\s+(?:sent|emailed|forwarded|submitted|booked|confirmed)|\b(?:on (?:its|the) way|sent|delivered)\s+to your inbox|\b(?:team is|team are|team's)\s+(?:now\s+)?reviewing|\bteam\s+(?:has|have)\s+(?:already\s+)?received|\b(?:they|the team)(?:['’]ll| will) reply within)/i;
  reply = reply.split('\n').map((line) => line.split(/(?<=[.!?])\s+/)
    .filter((part) => !unconfirmedDelivery.test(part)).join(' ')).join('\n').trim();
  if (handoffReady) reply = `${reply}\n\nYour draft is ready to review. Use Send to the team to submit it.`.trim();
  return { reply: reply || 'Your draft is ready to review. Nothing has been sent yet.', handoffReady };
}

function jsonBody(payload: unknown, maxBytes: number): string {
  const body = JSON.stringify(payload);
  if (utf8Bytes(body) > maxBytes) throw new ApiError('This conversation is too large to send. Start a shorter draft and try again.', 400, 'VALIDATION_ERROR');
  return body;
}

export async function sendPlannerMessage(history: PlannerMessage[], options: PlannerOptions = {}): Promise<PlannerReply> {
  const body = jsonBody({ history: preparePlannerHistory(history), lang: options.lang ?? 'en' }, 20_000);
  const data = await requestJson<{ reply?: unknown }>(`${PLANNER_BASE_URL}/api/planner`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
  }, { ...options, timeoutMs: options.timeoutMs ?? 45_000 });
  if (typeof data.reply !== 'string' || !data.reply.trim()) throw new ApiError('The planner returned an empty reply. Please try again.', 502, 'INVALID_RESPONSE');
  return sanitizePlannerReply(data.reply);
}

export interface PlannerDraft {
  contact: PlannerContact;
  history: PlannerMessage[];
  lang?: PlannerLanguage;
  updateCount?: number;
}

/** Sends only when called by the reviewed contact form's explicit submit action. Never auto-retried. */
export async function sendPlannerDraft(draft: PlannerDraft, options: RequestOptions = {}): Promise<{ ok: true }> {
  const name = draft.contact.name.trim();
  const email = draft.contact.email.trim();
  const phone = draft.contact.phone?.trim() || '';
  if (!name || name.length > 120 || /[\r\n]/.test(name)) throw new ApiError('Enter your name (up to 120 characters).', 400, 'VALIDATION_ERROR');
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError('Enter a valid email address.', 400, 'VALIDATION_ERROR');
  if (phone.length > 60 || /[\r\n]/.test(phone)) throw new ApiError('Keep the phone number under 60 characters.', 400, 'VALIDATION_ERROR');
  // Keep all transcript messages in the reviewed submission. Never silently discard content.
  const history = draft.history.map(({ role, content }) => ({ role, content: content.trim() })).filter(({ content }) => content);
  if (!history.length || history.length > 40 || history.some(({ role, content }) => !['user', 'assistant'].includes(role) || content.length > 4_000)) {
    throw new ApiError('The team can receive up to 40 messages of 4,000 characters each. Start a shorter draft before sending.', 400, 'VALIDATION_ERROR');
  }
  const body = jsonBody({ contact: { name, email, phone }, history, lang: draft.lang ?? 'en', updateCount: Math.max(0, Math.min(20, Math.trunc(draft.updateCount || 0))) }, 60_000);
  let data: { ok?: unknown; error?: unknown };
  try {
    data = await requestJson<{ ok?: unknown; error?: unknown }>(`${PLANNER_BASE_URL}/api/planner-send`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    }, options);
  } catch (error) {
    // The mailer has no idempotency key: loss of its HTTP response does not prove
    // that delivery failed. An immediate retry could send the same draft twice.
    if (error instanceof ApiError && (error.status === 0 || error.status >= 500 || error.code === 'INVALID_RESPONSE')) {
      throw new ApiError('We could not confirm whether the team received your draft. Check your inbox or contact the team before sending it again.', error.status, 'DELIVERY_UNCONFIRMED');
    }
    throw error;
  }
  if (data.ok !== true) throw new ApiError('We could not confirm whether the team received your draft. Check your inbox or contact the team before sending it again.', 502, 'DELIVERY_UNCONFIRMED');
  // The backend only guarantees team mail acceptance, not guest-copy delivery or a confirmed booking.
  return { ok: true };
}
