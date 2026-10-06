import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadGoogleAnalytics, suspendGoogleAnalytics, trackEvent, trackPageView } from '../../src/utils/analytics.js';

let gtag;
let appendChild;
let remove;
beforeEach(() => {
  gtag = vi.fn();
  appendChild = vi.fn();
  remove = vi.fn();
  vi.stubGlobal('window', {
    location: { pathname: '/store/order/DP-2026-123456', href: 'https://example.com/store/order/DP-2026-123456?t=secret' },
    localStorage: { getItem: () => JSON.stringify({ choices: { analytics: true } }) },
    gtag,
  });
  vi.stubGlobal('document', { title: 'Store', querySelector: () => null, querySelectorAll: () => [{ remove }], createElement: () => ({}), head: { appendChild } });
});
afterEach(() => { vi.unstubAllGlobals(); });

describe('private order analytics boundary', () => {
  it('blocks initial script loading, page views and events on a token-bearing order URL even with consent', () => {
    expect(loadGoogleAnalytics()).toBe(false);
    trackPageView('/store/order/DP-2026-123456?t=secret');
    trackEvent('purchase', { value: 50, currency: 'USD' });
    expect(appendChild).not.toHaveBeenCalled();
    expect(gtag).not.toHaveBeenCalled();
  });

  it('blocks a stale private-route page view after navigation to a public page', () => {
    window.location.pathname = '/store';
    trackPageView('/store/order/DP-2026-123456?t=secret');
    expect(gtag).not.toHaveBeenCalled();
    expect(appendChild).not.toHaveBeenCalled();
  });

  it('keeps public funnel analytics and strips accidental personal or order identifiers', () => {
    window.location.pathname = '/store';
    trackEvent('payment_redirect', { value: 50, currency: 'USD', transaction_id: 'DP-2026-123456', reference: 'DP-2026-123456', token: 'secret', email: 'guest@example.com' });
    expect(gtag).toHaveBeenLastCalledWith('event', 'payment_redirect', { send_to: 'G-44V46CDF6Y', value: 50, currency: 'USD' });
  });

  it('suspends existing analytics before order navigation and resumes on a public page without changing stored consent', () => {
    window.location.pathname = '/store';
    suspendGoogleAnalytics();
    expect(window['ga-disable-G-44V46CDF6Y']).toBe(true);
    expect(remove).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenLastCalledWith('consent', 'update', { analytics_storage: 'denied' });
    expect(loadGoogleAnalytics()).toBe(true);
    expect(window['ga-disable-G-44V46CDF6Y']).toBe(false);
    expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'granted' });
    expect(JSON.parse(window.localStorage.getItem()).choices.analytics).toBe(true);
  });
});
