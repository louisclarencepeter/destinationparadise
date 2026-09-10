// Scheduled store health check (HANDOFF.md Phase 4 production checks).
// Reads count-only metrics and raises a Sentry alert when anything needs a
// human: orders parked in requires_review, payment attempts stuck in flight,
// acknowledgements that keep failing, or dead/overdue notification emails.
// No names, emails, references or payment data — counts only.

import { captureFunctionException, captureFunctionMessage } from './_sentry.mjs';
import { callStoreRpc, storeApiEnabled } from './_store_shared.mjs';

const FUNCTION_NAME = 'store-health-check';
const STUCK_AFTER_MINUTES = 120;

// Metric keys that page a human when nonzero (the rest are context).
export const ALERT_KEYS = [
  'requiresReviewOrders',
  'stuckPendingAttempts',
  'stuckAcknowledgements',
  'failedOutbox',
  'overdueOutbox',
];

export function alertsFrom(snapshot) {
  return ALERT_KEYS
    .filter((key) => Number(snapshot?.[key] || 0) > 0)
    .map((key) => `${key}=${snapshot[key]}`);
}

export default async () => {
  if (!storeApiEnabled()) return new Response('store disabled', { status: 200 });

  try {
    const snapshot = await callStoreRpc('store_health_snapshot', {
      p_stuck_after_minutes: STUCK_AFTER_MINUTES,
    });
    const alerts = alertsFrom(snapshot);
    console.log(`${FUNCTION_NAME}:`, JSON.stringify(snapshot));

    if (alerts.length > 0) {
      await captureFunctionMessage(`store health: ${alerts.join(', ')}`, {
        functionName: FUNCTION_NAME,
        level: 'warning',
        extra: { snapshot },
      });
    }
    return Response.json({ ok: true, alerts, snapshot });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME });
    return Response.json({ ok: false }, { status: 500 });
  }
};

export const config = { schedule: '@hourly' };
