// POST /api/store/checkout — the commercial write path.
// Validates contact + items, then delegates to the atomic SQL transaction
// (store_api_checkout): lock departures, re-check, re-price, create the
// pending order + immutable items + capacity holds together, all-or-nothing.
// Payment is NOT taken here: Phase 3 attaches DPO after the order exists.

import {
  createRateLimiter,
  rateLimitKey,
  trimField,
  validateEmailAddress,
} from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import {
  callStoreRpc,
  devFakePaymentEnabled,
  parseIdempotencyKey,
  parseStoreItems,
  storeApiEnabled,
  storeDisabledResponse,
  storeJson,
  storeSourceAllowed,
} from './_store_shared.mjs';

const FUNCTION_NAME = 'store-checkout';
const MAX_REQUEST_BYTES = 30_000;
const HOLD_MINUTES = 15;
const checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 8 });

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

  const parsed = parseStoreItems(payload?.items);
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
    const result = await callStoreRpc('store_api_checkout', {
      p_items: parsed.items,
      p_contact: { name, email: emailCheck.email, phone },
      p_language: language,
      p_hold_minutes: HOLD_MINUTES,
      p_idempotency_key: parseIdempotencyKey(payload?.idempotencyKey),
    });

    if (!result?.ok) {
      const status = result?.error === 'availability_conflict' ? 409 : 400;
      return storeJson({ ok: false, error: result?.error || 'checkout_failed', conflicts: result?.conflicts || [] }, status);
    }

    return storeJson({
      ...result,
      // Tells the preview client it may finalize via the dev-only endpoint.
      // Phase 3 replaces this with the DPO hosted-checkout redirect URL.
      payment: { mode: devFakePaymentEnabled() ? 'dev_simulated' : 'unavailable' },
    });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req, extra: { stage: 'checkout-rpc' } });
    return storeJson({ ok: false, error: 'checkout_unavailable' }, 502);
  }
};

export const config = { path: '/api/store/checkout' };
