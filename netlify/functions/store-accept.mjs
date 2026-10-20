// POST /api/store/accept — the guest accepts a staff quote (HANDOFF Phase 5).
// This is the atomic moment server-side: capacity is re-checked under locks
// and fresh holds are created (store_api_accept_quote). The response tells the
// client how payment continues: DPO hosted checkout via /api/store/pay, the
// dev simulation, or "we'll send the payment link" while neither is live.

import { createRateLimiter, rateLimitKey } from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import { configuredPaymentMode } from './_store_provider.mjs';
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

const FUNCTION_NAME = 'store-accept';
const ACCEPT_HOLD_MINUTES = 24 * 60;
const checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 12 });

export default async (req) => {
  if (!storeApiEnabled()) return storeDisabledResponse();
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
    // Keep the payment agreement shown on the existing quote. New requests
    // carry deposit_20; historical quotes retain their original full plan.
    const quotedOrder = await callStoreRpc('store_api_order', { p_reference: reference, p_token: token });
    if (!quotedOrder?.ok) return storeJson({ ok: false, error: 'not_found' }, 404);
    const result = await callStoreRpc('store_api_accept_quote', {
      p_reference: reference,
      p_token: token,
      p_hold_minutes: ACCEPT_HOLD_MINUTES,
      p_payment_plan: quotedOrder.paymentPlan === 'deposit_20' ? 'deposit_20' : 'full',
    });
    if (!result?.ok) {
      const status = result?.error === 'availability_conflict' ? 409
        : result?.error === 'not_found' ? 404 : 400;
      return storeJson({ ok: false, error: result?.error || 'accept_failed', conflicts: result?.conflicts || [] }, status);
    }

    const paymentMode = configuredPaymentMode() || (devFakePaymentEnabled() ? 'dev_simulated' : 'unavailable');
    return storeJson({ ...result, payment: { mode: paymentMode } });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req, extra: { stage: 'accept-rpc' } });
    return storeJson({ ok: false, error: 'accept_unavailable' }, 502);
  }
};

export const config = { path: '/api/store/accept' };
