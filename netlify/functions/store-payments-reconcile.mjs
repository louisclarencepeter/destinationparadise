// Scheduled reconciliation (HANDOFF "Delayed or exceptional payments"):
// re-verifies stale in-flight payment attempts (a missed callback must never
// lose a paid order) and retries pending provider acknowledgements. All
// settlement goes through the same idempotent pipeline as returns/callbacks.

import { captureFunctionException } from './_sentry.mjs';
import { paymentAdapter } from './_store_provider.mjs';
import { retryAcknowledgement, verifyAndSettle } from './_store_payments.mjs';
import { callStoreRpc, storeApiEnabled } from './_store_shared.mjs';

const FUNCTION_NAME = 'store-payments-reconcile';

export default async () => {
  if (!storeApiEnabled()) return new Response('payments disabled', { status: 200 });

  try {
    const worklist = await callStoreRpc('store_payments_to_reconcile', {
      p_older_than_minutes: 5,
      p_limit: 25,
    });
    const results = [];
    for (const entry of Array.isArray(worklist) ? worklist : []) {
      try {
        const provider = entry.provider || 'dpo';
        const adapter = paymentAdapter(provider, entry.providerEnvironment);
        if (!adapter || !(adapter.verifyEnabled ?? adapter.enabled)) continue;
        if (entry.attemptStatus === 'paid_acknowledgement_pending') {
          const acked = await retryAcknowledgement(entry.reference, entry.providerToken, {
            provider, environment: entry.providerEnvironment,
          });
          results.push(`${entry.reference}:ack:${acked ? 'ok' : 'retry'}`);
        } else {
          const settled = await verifyAndSettle(entry.reference, {
            expectedProvider: provider, expectedToken: entry.providerToken,
          });
          results.push(`${entry.reference}:${settled.state}`);
        }
      } catch (error) {
        results.push(`${entry.reference}:error`);
        await captureFunctionException(error, {
          functionName: FUNCTION_NAME,
          extra: { stage: 'reconcile-entry' },
        });
      }
    }
    console.log(`${FUNCTION_NAME}: ${results.length ? results.join(', ') : 'nothing to reconcile'}`);
    return Response.json({ ok: true, processed: results.length });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME });
    return Response.json({ ok: false }, { status: 500 });
  }
};

export const config = { schedule: '*/10 * * * *' };
