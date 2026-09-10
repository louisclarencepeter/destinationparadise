// Shared payment-settlement pipeline (HANDOFF.md "Payment finalization").
// Underscore-prefixed: library only, not a deployed function.
//
// Every trigger — browser return, provider callback, reconciliation — funnels
// through verifyAndSettle(), so the rules hold no matter who calls first:
//   1. incoming params are notification triggers only, never proof
//   2. server-side verifyToken(0) decides, with exact ref/amount/currency
//      comparison (mismatch → requires_review, never silent acceptance)
//   3. finalization is the idempotent SQL transaction from Phase 2
//   4. verifyToken(1) acknowledgement runs AFTER commercial state is safe;
//      its failure only flags paid_acknowledgement_pending for retry.

import { acknowledgePayment, verifyPayment } from './_dpo.mjs';
import { callStoreRpc } from './_store_shared.mjs';

/**
 * Verifies the order's payment with DPO and settles internal state.
 * Returns { ok, state } where state ∈
 *   'paid' | 'pending' | 'failed' | 'expired' | 'requires_review' | 'unknown'.
 */
export async function verifyAndSettle(reference, { fetchFn } = {}) {
  const context = await callStoreRpc('store_payment_context', { p_reference: reference });
  if (!context?.ok) return { ok: false, state: 'unknown', error: 'unknown_order' };

  // Already finalized (an earlier trigger won the race) — nothing to do.
  if (context.orderStatus === 'paid') return { ok: true, state: 'paid' };
  if (!['pending_payment'].includes(context.orderStatus)) {
    return { ok: true, state: context.orderStatus };
  }
  if (!context.providerToken) return { ok: false, state: 'unknown', error: 'no_provider_transaction' };

  let verdict;
  try {
    verdict = await verifyPayment({
      transToken: context.providerToken,
      expected: {
        reference: context.reference,
        currency: context.currency,
        totalMinor: Number(context.totalMinor),
      },
    }, { fetchFn });
  } catch {
    // Provider unreachable / ambiguous: keep the attempt as 'unknown' and let
    // reconciliation retry — never guess an outcome (HANDOFF checkout rules).
    await callStoreRpc('store_mark_payment', { p_reference: reference, p_status: 'unknown', p_provider_amounts: null });
    return { ok: false, state: 'unknown', error: 'verify_unreachable' };
  }

  const amounts = verdict.reported ? { ...verdict.reported, mismatch: verdict.mismatch || null } : null;

  if (verdict.status === 'paid') {
    const finalized = await callStoreRpc('store_finalize_paid_order', { p_reference: reference });
    if (!finalized?.ok) {
      // capacity_lost already routed the order to requires_review in SQL.
      return { ok: false, state: 'requires_review', error: finalized?.error || 'finalize_failed' };
    }
    const ack = await acknowledgePayment({ transToken: context.providerToken }, { fetchFn });
    await callStoreRpc('store_mark_payment_ack', { p_reference: reference, p_acknowledged: ack.ok });
    return { ok: true, state: 'paid' };
  }

  if (verdict.status === 'pending') {
    await callStoreRpc('store_mark_payment', { p_reference: reference, p_status: 'pending', p_provider_amounts: amounts });
    return { ok: true, state: 'pending' };
  }

  if (verdict.status === 'failed' || verdict.status === 'expired') {
    await callStoreRpc('store_mark_payment', { p_reference: reference, p_status: verdict.status, p_provider_amounts: amounts });
    return { ok: true, state: verdict.status };
  }

  if (verdict.status === 'verification_failed' || verdict.status === 'requires_review') {
    await callStoreRpc('store_mark_payment', { p_reference: reference, p_status: 'requires_review', p_provider_amounts: amounts });
    return { ok: true, state: 'requires_review' };
  }

  await callStoreRpc('store_mark_payment', { p_reference: reference, p_status: 'unknown', p_provider_amounts: amounts });
  return { ok: true, state: 'unknown' };
}

// Retry the provider acknowledgement for an order whose commercial state is
// already safely paid (reconciliation path).
export async function retryAcknowledgement(reference, providerToken, { fetchFn } = {}) {
  const ack = await acknowledgePayment({ transToken: providerToken }, { fetchFn });
  await callStoreRpc('store_mark_payment_ack', { p_reference: reference, p_acknowledged: ack.ok });
  return ack.ok;
}
