import { Children, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CartDrawer from '../../src/components/store/CartDrawer.jsx';
import en from '../../src/locales/en/store.json';

// Exercise the drawer's quote effect and shopping actions without transport or
// payment. Layout, focus trapping and animation are verified in the browser.
const harness = vi.hoisted(() => ({
  active: false, values: [], cursor: 0, effects: [], effectDeps: [], cart: { items: [], drawerOpen: true },
  quote: vi.fn(), navigate: vi.fn(), dispatch: vi.fn(), track: vi.fn(),
}));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useState: (initial) => {
      if (!harness.active) return actual.useState(initial);
      const index = harness.cursor++;
      if (!(index in harness.values)) harness.values[index] = typeof initial === 'function' ? initial() : initial;
      return [harness.values[index], (next) => {
        harness.values[index] = typeof next === 'function' ? next(harness.values[index]) : next;
      }];
    },
    useRef: (initial) => {
      if (!harness.active) return actual.useRef(initial);
      const index = harness.cursor++;
      if (!(index in harness.values)) harness.values[index] = { current: initial };
      return harness.values[index];
    },
    useEffect: (callback, deps) => {
      if (!harness.active) return actual.useEffect(callback, deps);
      const index = harness.cursor++;
      const previous = harness.effectDeps[index];
      if (!previous || !deps || deps.some((value, position) => !Object.is(value, previous[position]))) harness.effects.push(callback);
      harness.effectDeps[index] = deps;
    },
    useMemo: (callback, deps) => harness.active ? callback() : actual.useMemo(callback, deps),
  };
});
vi.mock('react-router', () => ({ useNavigate: () => harness.navigate }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    ready: true, i18n: { resolvedLanguage: 'en' },
    t: (rawKey, options = {}) => {
      const key = rawKey.replace(/^store:/, '');
      const read = (path) => path.split('.').reduce((value, part) => value?.[part], en);
      const value = read(key) ?? read(`${key}_${options.count === 1 ? 'one' : 'other'}`) ?? options.defaultValue ?? key;
      return typeof value === 'string' ? value.replace(/\{\{(\w+)\}\}/g, (_, name) => options[name] ?? '') : value;
    },
  }),
}));
vi.mock('../../src/context/useBookingCart.js', () => ({
  useBookingCart: () => ({ state: harness.cart, dispatch: harness.dispatch }),
}));
vi.mock('../../src/data/localizedCatalog.js', () => ({ buildLocalizedExcursions: () => [] }));
vi.mock('../../src/data/commerceCatalog.js', () => ({
  getCartExperience: (id) => ['spice-tour', 'prison-island'].includes(id)
    ? { sourceKey: id, title: id === 'spice-tour' ? 'Spice Tour' : 'Prison Island', image: '/synthetic-qa-image.jpg' } : null,
}));
vi.mock('../../src/components/ResponsiveImage.jsx', () => ({ default: ({ src, alt }) => <img src={src} alt={alt} /> }));
vi.mock('../../src/utils/analytics.js', () => ({ trackEvent: (...args) => harness.track(...args) }));
vi.mock('../../src/lib/storeApi.js', () => ({
  isRequestItem: (item) => item.mode === 'request',
  quoteCartItems: (...args) => harness.quote(...args),
}));

const selection = (overrides = {}) => ({
  id: 'qa-first', experienceId: 'spice-tour', mode: 'shared', guests: 2,
  date: '2026-10-05', time: '09:00', pickupZone: 'north', accommodation: 'QA Example Hotel', ...overrides,
});
const serverQuote = (items, overrides = {}) => {
  const priced = items.filter((item) => item.mode !== 'request');
  const totalMinor = priced.length * 25001;
  const chargeMinor = Math.ceil(totalMinor / 5);
  return {
    quotes: items.map((item) => ({ id: item.id, status: item.mode === 'request' ? 'request_pending' : 'available', totalUsd: item.mode === 'request' ? null : 250.01 })),
    subtotalUsd: totalMinor / 100, chargeUsd: chargeMinor / 100,
    balanceUsd: (totalMinor - chargeMinor) / 100, paymentPlan: 'deposit_20', ...overrides,
  };
};
const depositLabel = en.checkout.deposit_due.replace('{{percent}}', '20');
function renderDrawer() {
  harness.active = true;
  harness.cursor = 0;
  harness.effects = [];
  return CartDrawer();
}
function markup(tree) {
  harness.active = false;
  return renderToStaticMarkup(tree);
}
async function mountDrawer() {
  renderDrawer();
  harness.effects.forEach((effect) => effect());
  await Promise.resolve();
  await Promise.resolve();
  return renderDrawer();
}
function findElement(element, predicate) {
  if (!isValidElement(element)) return undefined;
  if (predicate(element)) return element;
  for (const child of Children.toArray(element.props.children)) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return undefined;
}

beforeEach(() => {
  harness.active = false;
  harness.values = [];
  harness.cursor = 0;
  harness.effects = [];
  harness.effectDeps = [];
  harness.cart = { items: [selection(), selection({ id: 'qa-second', date: '2026-10-06', guests: 6 })], drawerOpen: true };
  [harness.quote, harness.navigate, harness.dispatch, harness.track].forEach((mock) => mock.mockReset());
  harness.quote.mockImplementation(async (items) => serverQuote(items));
});

describe('cart drawer combined deposit', () => {
  it('shows the approved combined 20% deposit and preserves both trips when shopping or checking out', async () => {
    const tree = await mountDrawer();
    const html = markup(tree);
    expect(html).toContain(depositLabel);
    expect(html).toContain('$500.02');
    expect(html).toContain('$100.01');
    findElement(tree, (element) => element.type === 'button' && element.props.className === 'cart-drawer__browse').props.onClick();
    expect(harness.navigate).toHaveBeenCalledExactlyOnceWith('/store');
    expect(harness.dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'close_drawer' });
    expect(harness.cart.items).toHaveLength(2);
    harness.navigate.mockClear();
    harness.dispatch.mockClear();
    findElement(tree, (element) => element.type === 'button' && element.props.className === 'cart-drawer__checkout').props.onClick();
    expect(harness.navigate).toHaveBeenCalledExactlyOnceWith('/store/checkout');
    expect(harness.dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'close_drawer' });
    expect(harness.track).toHaveBeenCalledExactlyOnceWith('begin_checkout', { value: 500.02, currency: 'USD', items: 2 });
    expect(harness.cart.items).toHaveLength(2);
  });

  it.each([
    ['full-payment plan', { paymentPlan: 'full', chargeUsd: 500.02, balanceUsd: 0 }],
    ['missing plan', { paymentPlan: null }],
    ['inconsistent subtotal', { subtotalUsd: 499.02 }],
    ['incorrect deposit rounding', { chargeUsd: 100, balanceUsd: 400.02 }],
    ['non-finite charge', { chargeUsd: Number.NaN }],
    ['missing balance', { balanceUsd: null }],
    ['inconsistent balance', { balanceUsd: 400.02 }],
  ])('does not label a malformed quote as a 20% deposit: %s', async (_reason, overrides) => {
    harness.quote.mockImplementation(async (items) => serverQuote(items, overrides));
    expect(markup(await mountDrawer())).not.toContain(depositLabel);
    expect(harness.navigate).not.toHaveBeenCalled();
    expect(harness.dispatch).not.toHaveBeenCalled();
  });

  it('requires a positive approved price for every trip', async () => {
    harness.quote.mockImplementation(async (items) => serverQuote(items, {
      quotes: [{ id: items[0].id, status: 'available', totalUsd: 250.01 }, { id: items[1].id, status: 'available', totalUsd: null }],
    }));
    expect(markup(await mountDrawer())).not.toContain(depositLabel);
  });

  it('does not show a combined deposit for a partial quote', async () => {
    harness.quote.mockImplementation(async (items) => serverQuote(items, {
      quotes: [{ id: items[0].id, status: 'available', totalUsd: 250.01 }],
    }));
    expect(markup(await mountDrawer())).not.toContain(depositLabel);
  });

  it('hides the former deposit immediately when a trip changes before its replacement quote arrives', async () => {
    expect(markup(await mountDrawer())).toContain(depositLabel);
    harness.cart = { ...harness.cart, items: [selection({ pickupZone: 'east' })] };
    expect(markup(renderDrawer())).not.toContain(depositLabel);
  });

  it('keeps historical enquiry-only items visible without showing an online deposit', async () => {
    harness.cart.items.push(selection({ id: 'qa-enquiry', experienceId: 'prison-island', mode: 'request', requestedDates: 'October, flexible' }));
    const html = markup(await mountDrawer());
    expect(html).not.toContain(depositLabel);
    expect(html).toContain('Prison Island');
    expect(html).toContain(en.cart.online_only);
    expect(harness.navigate).not.toHaveBeenCalled();
    expect(harness.dispatch).not.toHaveBeenCalled();
  });
});
