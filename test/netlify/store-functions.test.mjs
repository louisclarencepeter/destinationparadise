import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callStoreRpc,
  parseIdempotencyKey,
  parseOrderReference,
  parseOrderToken,
  parseStoreItems,
  storeApiEnabled,
  StoreRpcError,
} from '../../netlify/functions/_store_shared.mjs';
import storeQuote from '../../netlify/functions/store-quote.mjs';
import storeAvailability from '../../netlify/functions/store-availability.mjs';
import storeOrder from '../../netlify/functions/store-order.mjs';
import storeDevPay from '../../netlify/functions/store-dev-pay.mjs';

const ORIGIN = 'https://yournexttriptoparadise.com';

const validItem = (overrides = {}) => ({
  id: 'ci_1',
  experienceId: 'safari-blue',
  mode: 'shared',
  guests: 2,
  date: '2026-08-18',
  time: '08:30',
  ...overrides,
});

function jsonRequest(path, body, headers = {}) {
  return new Request(`${ORIGIN}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, ...headers },
    body: JSON.stringify(body),
  });
}

function enableStoreEnv() {
  vi.stubEnv('STORE_API_ENABLED', 'true');
  vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
}

function stubRpcFetch(handler) {
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    const fnName = String(url).split('/rpc/')[1];
    const args = JSON.parse(options.body);
    const result = await handler(fnName, args);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }));
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('store input validation', () => {
  it('maps the browser cart shape onto the SQL contract', () => {
    const parsed = parseStoreItems([validItem()]);
    expect(parsed.ok).toBe(true);
    expect(parsed.items[0]).toEqual({
      id: 'ci_1',
      sourceKey: 'safari-blue',
      optionCode: 'shared',
      guests: 2,
      date: '2026-08-18',
      time: '08:30',
    });
  });

  it('rejects malformed items wholesale', () => {
    for (const bad of [
      [],
      [validItem({ guests: 0 })],
      [validItem({ guests: 2.5 })],
      [validItem({ mode: 'vip' })],
      [validItem({ date: '18-08-2026' })],
      [validItem({ time: '8:30' })],
      [validItem({ experienceId: 'DROP TABLE;' })],
      Array.from({ length: 21 }, (_, i) => validItem({ id: `ci_${i}` })),
    ]) {
      expect(parseStoreItems(bad).ok, JSON.stringify(bad[0])).toBe(false);
    }
  });

  it('validates references, tokens and idempotency keys strictly', () => {
    expect(parseOrderReference('DP-2026-123456')).toBe('DP-2026-123456');
    expect(parseOrderReference('DP-2026-1234')).toBeNull();
    expect(parseOrderToken('a'.repeat(48))).toBe('a'.repeat(48));
    expect(parseOrderToken('Z'.repeat(48))).toBeNull();
    expect(parseIdempotencyKey('web-abc123-xyz')).toBe('web-abc123-xyz');
    expect(parseIdempotencyKey('short')).toBeNull();
  });

  it('is disabled without explicit enablement AND credentials', () => {
    expect(storeApiEnabled()).toBe(false);
    vi.stubEnv('STORE_API_ENABLED', 'true');
    expect(storeApiEnabled()).toBe(false);
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'key');
    expect(storeApiEnabled()).toBe(true);
  });
});

describe('callStoreRpc', () => {
  it('posts to PostgREST with the service key and returns parsed JSON', async () => {
    enableStoreEnv();
    const fetchFn = vi.fn(async (url, options) => {
      expect(url).toBe('https://example.supabase.co/rest/v1/rpc/store_api_quote');
      expect(options.headers.apikey).toBe('service-key');
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    const result = await callStoreRpc('store_api_quote', { p_items: [] }, { fetchFn });
    expect(result).toEqual({ ok: true });
  });

  it('throws a typed error on non-2xx with the body attached', async () => {
    enableStoreEnv();
    const fetchFn = async () => new Response(JSON.stringify({ message: 'boom' }), { status: 500 });
    await expect(callStoreRpc('store_api_quote', {}, { fetchFn })).rejects.toThrowError(StoreRpcError);
  });
});

describe('store endpoints ship dark', () => {
  it('every endpoint 404s when the store API is not enabled', async () => {
    const responses = await Promise.all([
      storeQuote(jsonRequest('/api/store/quote', { items: [validItem()] })),
      storeAvailability(new Request(`${ORIGIN}/api/store/availability?experience=safari-blue&from=2026-08-01&to=2026-08-31`)),
      storeOrder(new Request(`${ORIGIN}/api/store/orders/DP-2026-123456`), { params: { reference: 'DP-2026-123456' } }),
      storeDevPay(jsonRequest('/api/store/dev-pay', { reference: 'DP-2026-123456', token: 'a'.repeat(48) })),
    ]);
    for (const res of responses) expect(res.status).toBe(404);
  });
});

describe('store-quote endpoint', () => {
  it('rejects untrusted origins', async () => {
    enableStoreEnv();
    const res = await storeQuote(jsonRequest('/api/store/quote', { items: [validItem()] }, { origin: 'https://evil.example' }));
    expect(res.status).toBe(403);
  });

  it('rejects invalid payloads before touching the database', async () => {
    enableStoreEnv();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await storeQuote(jsonRequest('/api/store/quote', { items: [validItem({ guests: 99 })] }));
    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns the database quote for a valid cart', async () => {
    enableStoreEnv();
    stubRpcFetch((fnName, args) => {
      expect(fnName).toBe('store_api_quote');
      expect(args.p_items[0].sourceKey).toBe('safari-blue');
      return { quotes: [{ id: 'ci_1', status: 'available' }], subtotalMinor: 19000, currency: 'USD' };
    });
    const res = await storeQuote(jsonRequest('/api/store/quote', { items: [validItem()] }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.subtotalMinor).toBe(19000);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});

describe('store-order endpoint', () => {
  it('404s without a well-formed reference and bearer token', async () => {
    enableStoreEnv();
    const res = await storeOrder(
      new Request(`${ORIGIN}/api/store/orders/DP-2026-123456`),
      { params: { reference: 'DP-2026-123456' } },
    );
    expect(res.status).toBe(404);
  });

  it('returns the order with a valid token and never caches it', async () => {
    enableStoreEnv();
    stubRpcFetch(() => ({ ok: true, reference: 'DP-2026-123456', items: [] }));
    const res = await storeOrder(
      new Request(`${ORIGIN}/api/store/orders/DP-2026-123456`, {
        headers: { authorization: `Bearer ${'a'.repeat(48)}` },
      }),
      { params: { reference: 'DP-2026-123456' } },
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.reference).toBe('DP-2026-123456');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
  });
});

describe('store-dev-pay endpoint', () => {
  it('is hard-disabled unless STORE_DEV_FAKE_PAYMENT is set', async () => {
    enableStoreEnv();
    const res = await storeDevPay(jsonRequest('/api/store/dev-pay', { reference: 'DP-2026-123456', token: 'a'.repeat(48) }));
    expect(res.status).toBe(404);
  });

  it('requires the order token before finalizing', async () => {
    enableStoreEnv();
    vi.stubEnv('STORE_DEV_FAKE_PAYMENT', 'true');
    const calls = [];
    stubRpcFetch((fnName) => {
      calls.push(fnName);
      if (fnName === 'store_api_order') return { ok: false, error: 'not_found' };
      throw new Error('finalize must not be reached without a valid token');
    });
    const res = await storeDevPay(jsonRequest('/api/store/dev-pay', { reference: 'DP-2026-123456', token: 'b'.repeat(48) }));
    expect(res.status).toBe(404);
    expect(calls).toEqual(['store_api_order']);
  });

  it('finalizes and returns the refreshed order when authorized', async () => {
    enableStoreEnv();
    vi.stubEnv('STORE_DEV_FAKE_PAYMENT', 'true');
    let orderReads = 0;
    stubRpcFetch((fnName) => {
      if (fnName === 'store_api_order') {
        orderReads += 1;
        return { ok: true, reference: 'DP-2026-123456', items: [{ bookingCode: orderReads > 1 ? 'SB-1234' : null }] };
      }
      if (fnName === 'store_finalize_paid_order') {
        return { ok: true, reference: 'DP-2026-123456', bookings: [{ bookingCode: 'SB-1234' }] };
      }
      throw new Error(`unexpected rpc ${fnName}`);
    });
    const res = await storeDevPay(jsonRequest('/api/store/dev-pay', { reference: 'DP-2026-123456', token: 'a'.repeat(48) }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.simulated).toBe(true);
    expect(data.order.items[0].bookingCode).toBe('SB-1234');
  });
});

describe('parseRequestItems (Phase 5)', () => {
  it('accepts mixed carts and normalizes request items', async () => {
    const { parseRequestItems } = await import('../../netlify/functions/_store_shared.mjs');
    const parsed = parseRequestItems([
      { id: 'r1', experienceId: 'prison-island', mode: 'request', guests: 4, requestedDates: 'late August' },
      { id: 'i1', experienceId: 'spice-tour', mode: 'shared', guests: 2, date: '2026-08-18', time: '09:00' },
    ]);
    expect(parsed.ok).toBe(true);
    expect(parsed.items[0]).toEqual({
      id: 'r1', sourceKey: 'prison-island', optionCode: 'request', guests: 4, requestedDates: 'late August',
    });
    expect(parsed.items[1].date).toBe('2026-08-18');
  });

  it('rejects carts without any request item and malformed entries', async () => {
    const { parseRequestItems } = await import('../../netlify/functions/_store_shared.mjs');
    expect(parseRequestItems([
      { id: 'i1', experienceId: 'spice-tour', mode: 'shared', guests: 2, date: '2026-08-18', time: '09:00' },
    ]).error).toBe('no_request_items');
    expect(parseRequestItems([
      { id: 'r1', experienceId: 'prison-island', mode: 'request', guests: 0 },
    ]).ok).toBe(false);
    expect(parseRequestItems([
      { id: 'x', experienceId: 'spice-tour', mode: 'shared', guests: 2 },
    ]).ok).toBe(false);
  });
});
