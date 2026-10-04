// POST /api/store/pay — create the DPO hosted-checkout transaction for a
// pending order and hand the browser its payment URL. The order must already
// exist with active holds (Phase 2 checkout); authorization is the per-order
// bearer token. One DPO transaction carries one Service per trip.

import { createRateLimiter, rateLimitKey } from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import { createCheckout, dpoEnabled } from './_dpo.mjs';
import {
  callStoreRpc,
  parseOrderReference,
  parseOrderToken,
  storeApiEnabled,
  storeDisabledResponse,
  storeJson,
  storeSourceAllowed,
} from './_store_shared.mjs';

const FUNCTION_NAME = 'store-pay';
const checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 10 });

export default async (req) => {
  if (!storeApiEnabled() || !dpoEnabled()) return storeDisabledResponse();
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
    // The order token authorizes payment creation — a bare reference is not enough.
    const order = await callStoreRpc('store_api_order', { p_reference: reference, p_token: token });
    if (!order?.ok) return storeJson({ ok: false, error: 'not_found' }, 404);
    if (order.status !== 'pending_payment') {
      return storeJson({ ok: false, error: 'order_not_payable', status: order.status }, 409);
    }

    const context = await callStoreRpc('store_payment_context', { p_reference: reference });
    if (!context?.ok) return storeJson({ ok: false, error: 'not_found' }, 404);

    // Align the DPO payment window with the remaining inventory hold.
    const holdMsLeft = new Date(context.holdExpiresAt).getTime() - Date.now();
    const ptlMinutes = Math.max(5, Math.floor(holdMsLeft / 60_000));

    const checkout = await createCheckout({
      reference: context.reference,
      currency: context.currency,
      totalMinor: Number(context.totalMinor),
      contactName: context.contactName,
      contactEmail: context.contactEmail,
      contactPhone: context.contactPhone,
      items: context.items,
    }, { ptlMinutes });

    if (!checkout.ok) {
      // Definitive creation rejection: release the capacity, fail the attempt
      // (HANDOFF "Availability rules" / DPO integration notes).
      await callStoreRpc('store_mark_payment', {
        p_reference: reference,
        p_status: 'failed',
        p_provider_amounts: { stage: 'create_token', code: checkout.code, explanation: checkout.explanation },
      });
      return storeJson({ ok: false, error: 'payment_create_failed' }, 502);
    }

    const attached = await callStoreRpc('store_attach_payment', {
      p_reference: reference,
      p_provider_token: checkout.transToken,
      p_company_ref: reference,
    });
    if (!attached?.ok) return storeJson({ ok: false, error: attached?.error || 'attach_failed' }, 409);

    return storeJson({ ok: true, reference, paymentUrl: checkout.paymentUrl });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req, extra: { stage: 'create-payment' } });
    return storeJson({ ok: false, error: 'payment_unavailable' }, 502);
  }
};

export const config = { path: '/api/store/pay' };
