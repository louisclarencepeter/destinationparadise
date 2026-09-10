import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import storeHealthCheck, { alertsFrom } from '../../netlify/functions/store-health-check.mjs';

function enableStoreEnv() {
  vi.stubEnv('STORE_API_ENABLED', 'true');
  vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('store health check', () => {
  it('flags only the alert-worthy keys, ignoring context metrics', () => {
    expect(alertsFrom({
      requiresReviewOrders: 2,
      stuckPendingAttempts: 0,
      stuckAcknowledgements: 1,
      failedOutbox: 0,
      overdueOutbox: 0,
      activeHolds: 7,
      paidOrdersLast24h: 12,
    })).toEqual(['requiresReviewOrders=2', 'stuckAcknowledgements=1']);
    expect(alertsFrom({ activeHolds: 99, paidOrdersLast24h: 5 })).toEqual([]);
    expect(alertsFrom(null)).toEqual([]);
  });

  it('no-ops while the store is disabled', async () => {
    const res = await storeHealthCheck();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('store disabled');
  });

  it('returns the snapshot and alert list', async () => {
    enableStoreEnv();
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify({ requiresReviewOrders: 1, failedOutbox: 0, activeHolds: 3 }), { status: 200 })));
    const res = await storeHealthCheck();
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.alerts).toEqual(['requiresReviewOrders=1']);
    expect(data.snapshot.activeHolds).toBe(3);
  });
});
