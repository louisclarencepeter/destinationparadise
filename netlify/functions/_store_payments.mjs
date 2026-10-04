// Shared payment-settlement pipeline (HANDOFF.md "Payment finalization").
// Underscore-prefixed: library only, not a deployed function.
//
// Every trigger — browser return, provider callback, reconciliation — funnels
// through verifyAndSettle(), so the rules hold no matter who calls first:
//   1. incoming params are notification triggers only, never proof
//   2. the stored provider's server-side verification decides, with exact ref/amount/currency
//      comparison (mismatch → requires_review, never silent acceptance)
//   3. finalization is the idempotent SQL transaction from Phase 2
//   4. DPO acknowledgement runs AFTER commercial state is safe;
//      Pesapal acknowledges notification receipt in its IPN HTTP response.

import { callStoreRpc } from './_store_shared.mjs';
import { paymentAdapter } from './_store_provider.mjs';

/**
 * Verifies the order's stored payment provider and settles internal state.
 * Returns { ok, state } where state ∈
 *   'paid' | 'pending' | 'failed' | 'expired' | 'requires_review' | 'unknown'.
 */
export async function verifyAndSettle(reference, { fetchFn, expectedProvider, expectedToken, reverifyPaid = false } = {}) {
  const context = await callStoreRpc('store_payment_context', { p_reference: reference });
  if (!context?.ok) return { ok: false, state: 'unknown', error: 'unknown_order' };

  const provider = context.provider || 'dpo';
  const tokenMatches = provider === 'pesapal'
    ? context.providerToken?.toLowerCase() === expectedToken?.toLowerCase()
    : context.providerToken === expectedToken;
  // Validate notification identity before even returning an already-paid state.
  // A bare merchant reference must never verify a different provider's order.
  if ((expectedProvider && provider !== expectedProvider) ||
      (expectedToken && !tokenMatches)) {
    return { ok: false, state: 'unknown', error: 'payment_identity_mismatch' };
  }
  const adapter = paymentAdapter(provider, context.providerEnvironment);
  if (!adapter || !(adapter.verifyEnabled ?? adapter.enabled)) {
    return { ok: false, state: 'unknown', error: 'provider_unavailable' };
  }

  // Already finalized (an earlier trigger won the race) — nothing to do.
  const checkingPaidPesapal = context.orderStatus === 'paid' && provider === 'pesapal' && reverifyPaid && Boolean(expectedToken);
  const checkingClosedPesapal = ['payment_failed', 'expired'].includes(context.orderStatus) &&
    provider === 'pesapal' && reverifyPaid && Boolean(expectedToken);
  if (context.orderStatus === 'paid' && !checkingPaidPesapal) return { ok: true, state: 'paid' };
  if (context.orderStatus !== 'pending_payment' && !checkingPaidPesapal && !checkingClosedPesapal) {
    return { ok: true, state: context.orderStatus };
  }
  if (!context.providerToken) return { ok: false, state: 'unknown', error: 'no_provider_transaction' };

  const matchingPesapalNotification = provider === 'pesapal' && expectedProvider === 'pesapal' &&
    Boolean(expectedToken) && reverifyPaid;
  const persistVerdict = async (status, amounts) => {
    const marked = await callStoreRpc('store_mark_payment', {
      p_reference: reference, p_status: status, p_provider_amounts: amounts,
    });
    if (!marked?.ok) return { ok: false, state: 'unknown', error: marked?.error || 'payment_record_failed' };
    if (marked.skipped === 'order_finalized') {
      // Our initial snapshot may have been pending while another trigger won
      // finalization. A reversal/failed verdict must still flag that payment;
      // acknowledging a skipped update would hide received/reversed funds.
      if (matchingPesapalNotification && ['failed', 'expired', 'requires_review', 'verification_failed'].includes(status)) {
        const flagged = await callStoreRpc('store_flag_payment_review', { p_reference: reference, p_provider_amounts: amounts });
        return flagged?.ok ? { ok: true, state: 'requires_review' } : { ok: false, state: 'unknown', error: 'review_failed' };
      }
      if (matchingPesapalNotification && status === 'unknown') {
        // Local payment remains finalized, but this notification still needs
        // retrying: it may represent a reversal we could not query yet.
        return { ok: false, state: 'unknown', error: 'verify_ambiguous' };
      }
      const current = await callStoreRpc('store_payment_context', { p_reference: reference });
      return current?.ok ? { ok: true, state: current.orderStatus } : { ok: false, state: 'unknown', error: 'unknown_order' };
    }
    return { recorded: true };
  };

  let verdict;
  try {
    verdict = await adapter.verifyPayment({
      transToken: context.providerToken,
      expected: {
        reference: context.reference,
        currency: context.currency,
        totalMinor: Number(context.chargeMinor ?? context.totalMinor),
      },
    }, { fetchFn });
  } catch {
    // Provider unreachable / ambiguous: keep the attempt as 'unknown' and let
    // reconciliation retry — never guess an outcome (HANDOFF checkout rules).
    const recorded = await persistVerdict('unknown', null);
    if (!recorded.recorded && !recorded.ok) return recorded;
    return { ok: false, state: 'unknown', error: 'verify_unreachable' };
  }

  const amounts = verdict.reported ? { ...verdict.reported, mismatch: verdict.mismatch || null } : null;

  if (checkingClosedPesapal) {
    // A payment can arrive after a failed/expired attempt released its seats.
    // Keep those seats released and let staff resolve the received funds.
    if (['paid', 'requires_review', 'verification_failed'].includes(verdict.status)) {
      const flagged = await callStoreRpc('store_flag_payment_review', { p_reference: reference, p_provider_amounts: amounts });
      return flagged?.ok ? { ok: true, state: 'requires_review' } : { ok: false, state: 'unknown', error: 'review_failed' };
    }
    if (verdict.status === 'unknown') return { ok: false, state: 'unknown', error: 'closed_payment_status_ambiguous' };
    return { ok: true, state: context.orderStatus };
  }

  if (checkingPaidPesapal) {
    if (verdict.status === 'paid') return { ok: true, state: 'paid' };
    if (['requires_review', 'failed', 'expired', 'verification_failed'].includes(verdict.status)) {
      const flagged = await callStoreRpc('store_flag_payment_review', { p_reference: reference, p_provider_amounts: amounts });
      if (!flagged?.ok) return { ok: false, state: 'unknown', error: 'review_failed' };
      return { ok: true, state: 'requires_review' };
    }
    return { ok: false, state: 'unknown', error: 'paid_payment_status_ambiguous' };
  }

  if (verdict.status === 'paid') {
    const recorded = await persistVerdict('pending', amounts);
    if (!recorded.recorded) return recorded;
    const finalized = await callStoreRpc('store_finalize_paid_order', { p_reference: reference });
    if (!finalized?.ok) {
      // capacity_lost already routed the order to requires_review in SQL.
      return { ok: false, state: 'requires_review', error: finalized?.error || 'finalize_failed' };
    }
    if (adapter.acknowledgePayment) {
      const ack = await adapter.acknowledgePayment({ transToken: context.providerToken }, { fetchFn });
      await callStoreRpc('store_mark_payment_ack', { p_reference: reference, p_acknowledged: ack.ok });
    }
    return { ok: true, state: 'paid' };
  }

  if (verdict.status === 'pending') {
    const recorded = await persistVerdict('pending', amounts);
    if (!recorded.recorded) return recorded;
    return { ok: true, state: 'pending' };
  }

  if (verdict.status === 'failed' || verdict.status === 'expired') {
    const recorded = await persistVerdict(verdict.status, amounts);
    if (!recorded.recorded) return recorded;
    return { ok: true, state: verdict.status };
  }

  if (verdict.status === 'verification_failed' || verdict.status === 'requires_review') {
    const recorded = await persistVerdict('requires_review', amounts);
    if (!recorded.recorded) return recorded;
    return { ok: true, state: 'requires_review' };
  }

  const recorded = await persistVerdict('unknown', amounts);
  if (!recorded.recorded) return recorded;
  return { ok: true, state: 'unknown' };
}

// Retry the provider acknowledgement for an order whose commercial state is
// already safely paid (reconciliation path).
export async function retryAcknowledgement(reference, providerToken, { fetchFn, provider = 'dpo', environment } = {}) {
  const adapter = paymentAdapter(provider, environment);
  if (!adapter?.enabled || !adapter.acknowledgePayment) return false;
  const ack = await adapter.acknowledgePayment({ transToken: providerToken }, { fetchFn });
  await callStoreRpc('store_mark_payment_ack', { p_reference: reference, p_acknowledged: ack.ok });
  return ack.ok;
}
