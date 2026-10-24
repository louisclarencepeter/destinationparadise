import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { filterSentryBreadcrumb, filterSentryEvent } from '../../src/utils/sentry.js';

beforeEach(() => { vi.stubGlobal('window', { location: { pathname: '/store' } }); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('private order monitoring boundary', () => {
  it('drops errors, transactions and breadcrumbs while the private order page is active', () => {
    window.location.pathname = '/store/order/DP-2026-123456';
    expect(filterSentryEvent({ message: 'Payment page failed' })).toBeNull();
    expect(filterSentryEvent({ type: 'transaction', transaction: '/store/order/DP-2026-123456?t=secret' })).toBeNull();
    expect(filterSentryBreadcrumb({ category: 'navigation', data: { to: '/store/order/DP-2026-123456?t=secret' } })).toBeNull();
  });

  it('drops a private request or delayed private transaction even after navigating back to a public page', () => {
    expect(filterSentryEvent({ request: { url: 'https://example.com/store/order/DP-2026-123456?t=secret' } })).toBeNull();
    expect(filterSentryEvent({ transaction: '/store/order/DP-2026-123456' })).toBeNull();
  });

  it('preserves public error monitoring while scrubbing order references and tokens from old spans, URLs and breadcrumbs', () => {
    const token = 'a'.repeat(48);
    const event = {
      message: 'Public catalog failed', transaction: '/store',
      request: { url: 'https://example.com/store', headers: { authorization: `Bearer ${token}` } },
      spans: [{ description: 'GET /api/store/orders/DP-2026-123456' }],
      breadcrumbs: [
        { category: 'navigation', data: { from: `https://example.com/store/order/DP-2026-123456?t=${token}`, to: '/store' } },
        { category: 'fetch', data: { url: `https://example.com/api/payment?t=${token}`, reference: 'DP-2026-123456', accessToken: token } },
      ],
    };
    const filtered = filterSentryEvent(event);
    expect(filtered.message).toBe('Public catalog failed');
    expect(filtered.transaction).toBe('/store');
    expect(filtered.request.url).toBe('https://example.com/store');
    expect(JSON.stringify(filtered)).not.toContain(token);
    expect(JSON.stringify(filtered)).not.toContain('DP-2026-123456');
    expect(event.breadcrumbs[0].data.from).toContain(token); // Filtering leaves the original SDK event intact.
    expect(filterSentryBreadcrumb(event.breadcrumbs[0]).data.from).toBe('[private order]');
  });
});
