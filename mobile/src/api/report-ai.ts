import { MOBILE_BACKEND_URL } from '../config/endpoints';
import { ApiError, requestJson, utf8Bytes, type RequestOptions } from './client';

export const AI_REPORT_REASONS = [
  { id: 'offensive', label: 'Harmful or offensive content' },
  { id: 'inaccurate', label: 'Inaccurate or misleading content' },
  { id: 'privacy', label: 'Privacy concern' },
  { id: 'other', label: 'Other concern' },
] as const;
export type AiReportReason = typeof AI_REPORT_REASONS[number]['id'];
export interface AiContentReport {
  reason: AiReportReason;
  reply: string;
  notes?: string;
  consent: true;
}
export const AI_REPORT_REPLY_LIMIT = 16_000;
export const AI_REPORT_NOTES_LIMIT = 1_000;

/** An explicit one-reply moderation report. Never receives or sends a chat history. */
export async function reportAiReply(report: AiContentReport, options: RequestOptions = {}): Promise<{ ok: true }> {
  if (report.consent !== true) throw new ApiError('Confirm that you want to share this report.', 400, 'VALIDATION_ERROR');
  if (!AI_REPORT_REASONS.some(({ id }) => id === report.reason)) throw new ApiError('Choose a reason for your report.', 400, 'VALIDATION_ERROR');
  if (!report.reply?.trim() || report.reply.length > AI_REPORT_REPLY_LIMIT) throw new ApiError('The selected reply must contain between 1 and 16,000 characters.', 400, 'VALIDATION_ERROR');
  if ((report.notes?.length || 0) > AI_REPORT_NOTES_LIMIT) throw new ApiError('Keep your notes under 1,000 characters.', 400, 'VALIDATION_ERROR');
  // Explicit fields prevent an accidental future caller from forwarding an
  // entire conversation, contact object, or hidden metadata through this API.
  const body = JSON.stringify({ reason: report.reason, reply: report.reply, notes: report.notes || '', consent: true });
  if (utf8Bytes(body) > 60_000) throw new ApiError('This report is too large to send.', 400, 'VALIDATION_ERROR');
  const base = process.env.EXPO_OS === 'web' ? '' : MOBILE_BACKEND_URL;
  const response = await requestJson<{ ok?: unknown }>(`${base}/api/planner-report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }, options);
  if (response.ok !== true) throw new ApiError('We could not confirm that your report was received. Please try again later.', 502, 'INVALID_RESPONSE');
  return { ok: true };
}
