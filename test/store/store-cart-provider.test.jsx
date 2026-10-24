import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingCartProvider } from '../../src/context/BookingCartContext.jsx';
import { CART_STORAGE_KEY, CART_VERSION } from '../../src/lib/storeCart.js';

// Keep the provider mounted while route children change. Only React's hook
// lifecycle is simulated; the provider, cart reducer and serialization are real.
const harness = vi.hoisted(() => ({
  values: [], cursor: 0, effects: [], effectDeps: [], dirty: false,
}));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useState: (initial) => {
      const index = harness.cursor++;
      if (!(index in harness.values)) harness.values[index] = typeof initial === 'function' ? initial() : initial;
      return [harness.values[index], (next) => {
        const value = typeof next === 'function' ? next(harness.values[index]) : next;
        if (!Object.is(value, harness.values[index])) harness.dirty = true;
        harness.values[index] = value;
      }];
    },
    useReducer: (reducer, initial, initialize) => {
      const index = harness.cursor++;
      if (!(index in harness.values)) {
        const slot = { value: initialize ? initialize(initial) : initial };
        slot.dispatch = (action) => {
          const value = reducer(slot.value, action);
          if (!Object.is(value, slot.value)) harness.dirty = true;
          slot.value = value;
        };
        harness.values[index] = slot;
      }
      return [harness.values[index].value, harness.values[index].dispatch];
    },
    useEffect: (callback, deps) => {
      const index = harness.cursor++;
      const previous = harness.effectDeps[index];
      if (!previous || !deps || deps.some((value, position) => !Object.is(value, previous[position]))) {
        harness.effects.push(callback);
      }
      harness.effectDeps[index] = deps;
    },
    useMemo: (callback) => callback(),
  };
});

const selection = (overrides = {}) => ({
  id: 'qa-first', experienceId: 'spice-tour', mode: 'shared', guests: 2,
  date: '2026-10-05', time: '09:00', pickupZone: 'north', accommodation: 'QA Hotel', ...overrides,
});
const draft = { name: 'QA Guest', email: 'preview@example.com', phone: '+255123' };
const emptyDraft = { name: '', email: '', phone: '' };
let storage;

function renderProvider(children = 'checkout') {
  let tree;
  for (let pass = 0; pass < 5; pass += 1) {
    harness.cursor = 0;
    harness.effects = [];
    harness.dirty = false;
    tree = BookingCartProvider({ children });
    harness.effects.forEach((effect) => effect());
    if (!harness.dirty) return tree.props.value;
  }
  throw new Error('Provider did not settle after its effects');
}

beforeEach(() => {
  harness.values = [];
  harness.cursor = 0;
  harness.effects = [];
  harness.effectDeps = [];
  harness.dirty = false;
  storage = {
    getItem: vi.fn().mockReturnValue(JSON.stringify({ v: CART_VERSION, items: [selection()] })),
    setItem: vi.fn(),
  };
  vi.stubGlobal('window', { localStorage: storage });
});

afterEach(() => vi.unstubAllGlobals());

describe('store cart provider contact draft', () => {
  it('retains contact through shopping, editing and checkout navigation without changing trips', () => {
    let context = renderProvider();
    const items = context.state.items;
    context.setCheckoutContact((current) => ({ ...current, ...draft }));
    context = renderProvider('store');
    expect(context.checkoutContact).toEqual(draft);
    expect(context.state.items).toBe(items);
    context.dispatch({ type: 'open_drawer' });
    context = renderProvider('experience edit');
    expect(context.checkoutContact).toEqual(draft);
    expect(context.state.items).toBe(items);
    context.dispatch({ type: 'close_drawer' });
    context = renderProvider('checkout');
    expect(context.checkoutContact).toEqual(draft);
    expect(context.state.items).toBe(items);
    expect(context.state.drawerOpen).toBe(false);
  });

  it('keeps contact while other trips remain and clears it after the last removal', () => {
    let context = renderProvider();
    context.setCheckoutContact(draft);
    context.dispatch({ type: 'add', item: selection({ id: 'qa-second', date: '2026-10-06' }) });
    context = renderProvider();
    expect(context.checkoutContact).toEqual(draft);
    context.dispatch({ type: 'remove', id: 'qa-first' });
    context = renderProvider();
    expect(context.checkoutContact).toEqual(draft);
    context.dispatch({ type: 'remove', id: 'qa-second' });
    context = renderProvider('store');
    expect(context.state.items).toEqual([]);
    expect(context.checkoutContact).toEqual(emptyDraft);
  });

  it('clears contact when a verified-payment cart clear is dispatched', () => {
    let context = renderProvider();
    context.setCheckoutContact(draft);
    context = renderProvider('payment');
    expect(context.checkoutContact).toEqual(draft);
    context.dispatch({ type: 'clear' });
    context = renderProvider('confirmation');
    expect(context.state.items).toEqual([]);
    expect(context.checkoutContact).toEqual(emptyDraft);
  });

  it('persists only cart selections and never writes the contact draft', () => {
    let context = renderProvider();
    expect(storage.getItem).toHaveBeenCalledExactlyOnceWith(CART_STORAGE_KEY);
    const writesBeforeContact = storage.setItem.mock.calls.length;
    context.setCheckoutContact(draft);
    context = renderProvider();
    expect(storage.setItem).toHaveBeenCalledTimes(writesBeforeContact);
    context.dispatch({ type: 'update', id: 'qa-first', patch: { guests: 3 } });
    context = renderProvider('checkout');
    expect(context.checkoutContact).toEqual(draft);
    for (const [key, serialized] of storage.setItem.mock.calls) {
      expect(key).toBe(CART_STORAGE_KEY);
      const persisted = JSON.parse(serialized);
      expect(Object.keys(persisted).sort()).toEqual(['items', 'v']);
      expect(serialized).not.toContain('checkoutContact');
      for (const value of Object.values(draft)) expect(serialized).not.toContain(value);
      for (const item of persisted.items) {
        expect(item).not.toHaveProperty('name');
        expect(item).not.toHaveProperty('email');
        expect(item).not.toHaveProperty('phone');
      }
    }
    expect(JSON.parse(storage.setItem.mock.calls.at(-1)[1]).items).toEqual([selection({ guests: 3 })]);
  });

  it('still supports shopping and contact retention when browser storage is unavailable', () => {
    storage.getItem.mockImplementation(() => { throw new Error('Storage unavailable'); });
    storage.setItem.mockImplementation(() => { throw new Error('Storage unavailable'); });
    let context = renderProvider('store');
    expect(context.state.items).toEqual([]);
    context.dispatch({ type: 'add', item: selection() });
    context = renderProvider('checkout');
    context.setCheckoutContact(draft);
    context = renderProvider('experience');
    expect(context.state.items).toEqual([selection()]);
    expect(context.checkoutContact).toEqual(draft);
    context.dispatch({ type: 'clear' });
    context = renderProvider('store');
    expect(context.checkoutContact).toEqual(emptyDraft);
  });
});
