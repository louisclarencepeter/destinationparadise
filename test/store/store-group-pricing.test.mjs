import { describe, expect, it } from 'vitest';
import { calculateGroupPickupPrice, hasPickupDetails, quoteOnlyDepartureItems, selectionReviewStatus } from '../../src/lib/storePricing.js';
import { cartReducer, deserializeCart, initialCartState, serializeCart } from '../../src/lib/storeCart.js';
import { depositBreakdown } from '../../src/lib/storeApi.js';

// Synthetic cents for verification only; no merchant rates are configured.
const pricing = { options: {
  shared: { groupPrices: { 1: 10000, 2: 16001, 6: 30000 }, pickupPrices: { 'stone-town': 0, north: 9000 } },
  private: { groupPrices: { 2: 21001 }, pickupPrices: { north: 9000 } },
} };
const item = (overrides = {}) => ({ id: 'ci_group', experienceId: 'spice-tour', mode: 'shared', guests: 2,
  date: '2026-10-10', time: '09:00', pickupZone: 'north', accommodation: '  Local QA hotel  ', ...overrides });

describe('approved group and per-car pickup pricing', () => {
  it('adds a single pickup charge to the group total and rounds the deposit only once', () => {
    const result = calculateGroupPickupPrice(pricing, 'shared', 2, 'north');
    expect(result).toMatchObject({ totalUsd: 250.01, effectivePerPersonUsd: 125.005, quoteRequired: false });
    expect(result.lines.map((line) => line.amountUsd)).toEqual([160.01, 90]);
    expect(depositBreakdown(result.totalUsd)).toMatchObject({ chargeUsd: 50.01, balanceUsd: 200 });
    expect(calculateGroupPickupPrice(pricing, 'private', 2, 'north').totalUsd).toBe(300.01);
  });
  it('uses the approved tier without a private surcharge or linear multiplication', () => {
    const single = calculateGroupPickupPrice(pricing, 'shared', 1, 'stone-town');
    const six = calculateGroupPickupPrice(pricing, 'shared', 6, 'stone-town');
    expect(single.totalUsd).toBe(100);
    expect(six.totalUsd).toBe(300);
    expect(six.effectivePerPersonUsd).toBeLessThan(single.effectivePerPersonUsd);
    expect(six.lines[1].amountUsd).toBe(0);
  });
  it.each([
    [null, 'shared', 2, 'north'], [pricing, 'shared', 7, 'north'], [pricing, 'shared', 24, 'north'],
    [pricing, 'shared', 2, 'other'], [pricing, 'shared', 2, ''], [pricing, 'shared', 3, 'north'],
    [pricing, 'private', 1, 'north'], [pricing, 'shared', 2, 'south'],
    [{ options: { shared: { groupPrices: { 2: -10 }, pickupPrices: { north: 1000 } } } }, 'shared', 2, 'north'],
    [{ options: { shared: { groupPrices: { 2: Number.MAX_SAFE_INTEGER }, pickupPrices: { north: 1 } } } }, 'shared', 2, 'north'],
  ])('requires a quote for missing or invalid configuration', (rates, mode, guests, zone) => {
    expect(calculateGroupPickupPrice(rates, mode, guests, zone)).toMatchObject({ totalUsd: null, quoteRequired: true, lines: [] });
  });
});

describe('saved-cart pickup and party review', () => {
  it('keeps existing version-one carts and requires missing details before a new checkout', () => {
    const old = item({ pickupZone: undefined, accommodation: undefined });
    const revived = deserializeCart(JSON.stringify({ v: 1, items: [old] }));
    expect(revived).toHaveLength(1);
    expect(selectionReviewStatus(revived[0])).toBe('pickup_required');
    expect(hasPickupDetails(item({ accommodation: ' ' }))).toBe(false);
  });
  it('persists pickup answers but never prices or guest-supplied calculation lines', () => {
    const state = cartReducer(initialCartState, { type: 'add', item: { ...item(), totalUsd: 999, priceLines: [{ amountUsd: 999 }] } });
    expect(deserializeCart(serializeCart(state))[0]).toEqual(item({ accommodation: 'Local QA hotel' }));
    expect(serializeCart(state)).not.toContain('999');
    expect(cartReducer(state, { type: 'update', id: 'ci_group', patch: { pickupZone: 'invalid' } })).toBe(state);
    expect(cartReducer(state, { type: 'update', id: 'ci_group', patch: { accommodation: 'x'.repeat(201) } })).toBe(state);
  });
  it('flags duplicate departures regardless of pickup area, mode or total party size', () => {
    const first = item({ guests: 3 });
    const second = item({ id: 'ci_second', guests: 4, mode: 'private', pickupZone: 'east', accommodation: 'Different QA hotel' });
    const independent = item({ id: 'ci_independent', date: '2026-10-11' });
    const set = quoteOnlyDepartureItems([first, second, independent]);
    expect([...set]).toEqual(['ci_group', 'ci_second']);
    expect(selectionReviewStatus(first, set)).toBe('quote_required');
    expect(selectionReviewStatus(independent, set)).toBe(null);
    expect([...quoteOnlyDepartureItems([item({ guests: 1 }), item({ id: 'ci_other', guests: 1 })])]).toHaveLength(2);
    expect(selectionReviewStatus(item({ guests: 7 }))).toBe('quote_required');
    expect(selectionReviewStatus(item({ mode: 'request', guests: 12 }))).toBe(null);
  });
});
