import { describe, expect, it } from 'vitest';
import {
  CART_VERSION,
  MAX_CART_ITEMS,
  cartItemCount,
  cartReducer,
  deserializeCart,
  initialCartState,
  isValidCartItem,
  serializeCart,
} from '../../src/lib/storeCart.js';

const item = (overrides = {}) => ({
  id: 'ci_test1',
  experienceId: 'safari-blue',
  mode: 'shared',
  guests: 2,
  date: '2026-08-18',
  time: '08:30',
  ...overrides,
});

describe('cartReducer', () => {
  it('adds a valid item', () => {
    const state = cartReducer(initialCartState, { type: 'add', item: item() });
    expect(state.items).toHaveLength(1);
    expect(cartItemCount(state)).toBe(1);
  });

  it('rejects malformed items', () => {
    for (const bad of [
      item({ guests: 0 }),
      item({ guests: 2.5 }),
      item({ mode: 'group' }),
      item({ date: '18-08-2026' }),
      item({ time: '8:30am' }),
      item({ experienceId: '' }),
    ]) {
      expect(isValidCartItem(bad)).toBe(false);
      expect(cartReducer(initialCartState, { type: 'add', item: bad })).toBe(initialCartState);
    }
  });

  it('keeps every trip independent: updating one leaves the others alone', () => {
    let state = cartReducer(initialCartState, { type: 'add', item: item() });
    state = cartReducer(state, { type: 'add', item: item({ id: 'ci_test2', experienceId: 'stone-town', date: '2026-08-20', time: '09:30', guests: 3 }) });
    state = cartReducer(state, { type: 'update', id: 'ci_test2', patch: { guests: 4, time: '14:30' } });
    expect(state.items[0]).toMatchObject({ id: 'ci_test1', guests: 2, time: '08:30' });
    expect(state.items[1]).toMatchObject({ id: 'ci_test2', guests: 4, time: '14:30', date: '2026-08-20' });
  });

  it('ignores updates that would corrupt an item', () => {
    const state = cartReducer(initialCartState, { type: 'add', item: item() });
    expect(cartReducer(state, { type: 'update', id: 'ci_test1', patch: { guests: 0 } })).toBe(state);
    expect(cartReducer(state, { type: 'update', id: 'missing', patch: { guests: 3 } })).toBe(state);
  });

  it('removes only the targeted item and clears fully', () => {
    let state = cartReducer(initialCartState, { type: 'add', item: item() });
    state = cartReducer(state, { type: 'add', item: item({ id: 'ci_test2' }) });
    state = cartReducer(state, { type: 'remove', id: 'ci_test1' });
    expect(state.items.map((entry) => entry.id)).toEqual(['ci_test2']);
    state = cartReducer(state, { type: 'clear' });
    expect(state.items).toEqual([]);
  });

  it('caps the cart size', () => {
    let state = initialCartState;
    for (let i = 0; i < MAX_CART_ITEMS + 5; i += 1) {
      state = cartReducer(state, { type: 'add', item: item({ id: `ci_${i}` }) });
    }
    expect(state.items).toHaveLength(MAX_CART_ITEMS);
  });

  it('toggles the drawer without touching items', () => {
    let state = cartReducer(initialCartState, { type: 'add', item: item() });
    state = cartReducer(state, { type: 'open_drawer' });
    expect(state.drawerOpen).toBe(true);
    state = cartReducer(state, { type: 'close_drawer' });
    expect(state.drawerOpen).toBe(false);
    expect(state.items).toHaveLength(1);
  });
});

describe('cart persistence', () => {
  it('round-trips through serialize/deserialize', () => {
    let state = cartReducer(initialCartState, { type: 'add', item: item() });
    state = cartReducer(state, { type: 'add', item: item({ id: 'ci_test2', mode: 'private' }) });
    const revived = deserializeCart(serializeCart(state));
    expect(revived).toEqual(state.items);
  });

  it('drops corrupt, foreign or wrong-version payloads', () => {
    expect(deserializeCart(null)).toEqual([]);
    expect(deserializeCart('not json {')).toEqual([]);
    expect(deserializeCart(JSON.stringify({ v: CART_VERSION + 1, items: [item()] }))).toEqual([]);
    expect(deserializeCart(JSON.stringify({ v: CART_VERSION, items: [item({ guests: 99 })] }))).toEqual([]);
    expect(deserializeCart(JSON.stringify({ v: CART_VERSION, items: 'nope' }))).toEqual([]);
  });

  it('never persists prices', () => {
    const state = cartReducer(initialCartState, {
      type: 'add',
      item: { ...item(), totalUsd: 190, priceUsd: 95 },
    });
    expect(serializeCart(state)).not.toContain('190');
    expect(state.items[0].totalUsd).toBeUndefined();
  });
});

describe('request cart items (Phase 5)', () => {
  const requestItem = (overrides = {}) => ({
    id: 'ci_req1',
    experienceId: 'prison-island',
    mode: 'request',
    guests: 4,
    requestedDates: 'Any morning in August',
    ...overrides,
  });

  it('accepts request items without date/time', () => {
    expect(isValidCartItem(requestItem())).toBe(true);
    expect(isValidCartItem(requestItem({ requestedDates: undefined }))).toBe(true);
  });

  it('rejects oversized preferred-dates text', () => {
    expect(isValidCartItem(requestItem({ requestedDates: 'x'.repeat(301) }))).toBe(false);
  });

  it('still requires date/time for instant modes', () => {
    expect(isValidCartItem({ id: 'x', experienceId: 'safari-blue', mode: 'shared', guests: 2 })).toBe(false);
  });

  it('round-trips request items through persistence', () => {
    const state = cartReducer(initialCartState, { type: 'add', item: requestItem() });
    const revived = deserializeCart(serializeCart(state));
    expect(revived[0]).toEqual({
      id: 'ci_req1', experienceId: 'prison-island', mode: 'request',
      guests: 4, requestedDates: 'Any morning in August',
    });
  });
});
