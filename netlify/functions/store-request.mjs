// POST /api/store/request — submit a request/mixed cart (HANDOFF Phase 5).
// Creates an awaiting_availability order with NO payment and NO holds:
// nothing is promised until staff confirm and the guest accepts the quote.

import {
  createRateLimiter,
  rateLimitKey,
  trimField,
  validateEmailAddress,
} from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import {
  callStoreRpc,
  parseIdempotencyKey,
  parseRequestItems,
  storeApiEnabled,
  storeDisabledResponse,
  storeJson,
  storeSourceAllowed,
} from './_store_shared.mjs';

const FUNCTION_NAME = 'store-request';
const MAX_REQUEST_BYTES = 30_000;
const checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 6 });

export default async (req) => {
  if (!storeApiEnabled()) return storeDisabledResponse();
  if (req.method !== 'POST') return storeJson({ ok: false, error: 'method_not_allowed' }, 405);
  if (!storeSourceAllowed(req).ok) return storeJson({ ok: false, error: 'forbidden' }, 403);

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) return storeJson({ ok: false, error: 'rate_limited', retryAfter: limit.retryAfter }, 429);

  let payload;
  try {
    const raw = await req.text();
    if (raw.length > MAX_REQUEST_BYTES) return storeJson({ ok: false, error: 'payload_too_large' }, 413);
    payload = JSON.parse(raw);
  } catch {
    return storeJson({ ok: false, error: 'invalid_json' }, 400);
  }

  const parsed = parseRequestItems(payload?.items);
  if (!parsed.ok) return storeJson({ ok: false, error: parsed.error }, 400);

  const name = trimField(payload?.contact?.name, 200);
  const phone = trimField(payload?.contact?.phone, 60);
  const language = trimField(payload?.language, 2) || 'en';
  if (!name) return storeJson({ ok: false, error: 'name_required' }, 400);

  const emailCheck = await validateEmailAddress(trimField(payload?.contact?.email, 254));
  if (!emailCheck.ok) {
    return storeJson({ ok: false, error: 'email_invalid', message: emailCheck.message }, emailCheck.status || 400);
  }

  try {
    const result = await callStoreRpc('store_api_request_checkout', {
      p_items: parsed.items,
      p_contact: { name, email: emailCheck.email, phone },
      p_language: language,
      p_idempotency_key: parseIdempotencyKey(payload?.idempotencyKey),
    });
    if (!result?.ok) return storeJson({ ok: false, error: result?.error || 'request_failed' }, 400);
    return storeJson(result);
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req, extra: { stage: 'request-rpc' } });
    return storeJson({ ok: false, error: 'request_unavailable' }, 502);
  }
};

export const config = { path: '/api/store/request' };
