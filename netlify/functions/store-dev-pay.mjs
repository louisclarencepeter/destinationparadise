// POST /api/store/dev-pay — DEVELOPMENT-ONLY simulated payment.
//
// Exists so Phase 2 previews can exercise the real finalize transaction
// (consume holds, mint one booking per item) against real inventory before
// DPO lands in Phase 3. Hard-disabled unless STORE_DEV_FAKE_PAYMENT=true;
// never enable that variable in the production context.

import { createRateLimiter, rateLimitKey } from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import {
  callStoreRpc,
  devFakePaymentEnabled,
  parseOrderReference,
  parseOrderToken,
  storeApiEnabled,
  storeDisabledResponse,
  storeJson,
  storeSourceAllowed,
} from './_store_shared.mjs';

const FUNCTION_NAME = 'store-dev-pay';
const checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 10 });

export default async (req) => {
  if (!storeApiEnabled() || !devFakePaymentEnabled()) return storeDisabledResponse();
  if (req.method !== 'POST') return storeJson({ ok: false, error: 'method_not_allowed' }, 405);
  if (!storeSourceAllowed(req).ok) return storeJson({ ok: false, error: 'forbidden' }, 403);

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) return storeJson({ ok: false, error: 'rate_limited' }, 429);

  let payload;
  try {
    payload = JSON.parse(await req.text());
  } catch {
    return storeJson({ ok: false, error: 'invalid_json' }, 400);
  }

  const reference = parseOrderReference(payload?.reference);
  const token = parseOrderToken(payload?.token);
  if (!reference || !token) return storeJson({ ok: false, error: 'not_found' }, 404);

  try {
    // The order token authorizes finalization — a bare reference is not enough.
    const order = await callStoreRpc('store_api_order', { p_reference: reference, p_token: token });
    if (!order?.ok) return storeJson({ ok: false, error: 'not_found' }, 404);

    const result = await callStoreRpc('store_finalize_paid_order', { p_reference: reference });
    if (!result?.ok) return storeJson({ ok: false, error: result?.error || 'finalize_failed' }, 409);

    const finalOrder = await callStoreRpc('store_api_order', { p_reference: reference, p_token: token });
    return storeJson({ ok: true, simulated: true, order: finalOrder });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req });
    return storeJson({ ok: false, error: 'finalize_unavailable' }, 502);
  }
};

export const config = { path: '/api/store/dev-pay' };
