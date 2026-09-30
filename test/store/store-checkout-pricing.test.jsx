import { Children, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StoreCheckout from '../../src/pages/StoreCheckout.jsx';
import en from '../../src/locales/en/store.json';

// Exercise StoreCheckout's real hooks, async quote effect and event handlers.
// All API, navigation and analytics transport is mocked; no order or payment
// is created. Browser layout and interactions are covered by the main agent.
const harness = vi.hoisted(() => ({
  active: false, values: [], cursor: 0, effects: [], effectDeps: [], cart: { items: [] },
  navigate: vi.fn(), dispatch: vi.fn(), quote: vi.fn(), checkout: vi.fn(), request: vi.fn(),
  save: vi.fn(), track: vi.fn(), suspend: vi.fn(), assign: vi.fn(),
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
vi.mock('react-router', () => ({
  useNavigate: () => harness.navigate,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));
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
  Trans: ({ t, i18nKey }) => t(i18nKey),
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
vi.mock('../../src/hooks/usePageMeta.js', () => ({ default: () => {} }));
vi.mock('../../src/utils/analytics.js', () => ({
  trackEvent: (...args) => harness.track(...args), suspendGoogleAnalytics: () => harness.suspend(),
}));
vi.mock('../../src/lib/storeApi.js', () => ({
  isRequestItem: (item) => item.mode === 'request',
  isLiveStoreApi: () => true,
  quoteCartItems: (...args) => harness.quote(...args),
  submitCheckout: (...args) => harness.checkout(...args),
  submitRequestCheckout: (...args) => harness.request(...args),
  saveLastOrder: (...args) => harness.save(...args),
}));

const selection = (overrides = {}) => ({
  id: 'qa-spice', experienceId: 'spice-tour', mode: 'shared', guests: 2,
  date: '2026-10-05', time: '09:00', pickupZone: 'north', accommodation: 'QA Example Hotel',
  ...overrides,
});
const requestSelection = (overrides = {}) => ({
  id: 'qa-request', experienceId: 'prison-island', mode: 'request', guests: 4,
  requestedDates: '6–8 October, flexible', ...overrides,
});
const serverQuote = (items, overrides = {}) => ({
  quotes: items.map((item) => ({
    id: item.id, status: item.mode === 'request' ? 'request_pending' : 'available',
    totalUsd: item.mode === 'request' ? null : 250.01,
    priceLines: item.mode === 'request' ? [] : [
      { type: 'group_price', guests: item.guests, amountUsd: 215.01 },
      { type: 'pickup_supplement', zoneCode: item.pickupZone, amountUsd: 35 },
    ],
  })),
  subtotalUsd: items.filter((item) => item.mode !== 'request').length * 250.01,
  chargeUsd: Math.ceil(items.filter((item) => item.mode !== 'request').length * 25001 / 5) / 100,
  balanceUsd: (items.filter((item) => item.mode !== 'request').length * 25001 -
    Math.ceil(items.filter((item) => item.mode !== 'request').length * 25001 / 5)) / 100,
  paymentPlan: 'deposit_20',
  ...overrides,
});

function findElement(element, predicate) {
  if (!isValidElement(element)) return undefined;
  if (predicate(element)) return element;
  for (const child of Children.toArray(element.props.children)) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return undefined;
}
function renderCheckout() {
  harness.active = true;
  harness.cursor = 0;
  harness.effects = [];
  return StoreCheckout();
}
function markup(tree) {
  harness.active = false;
  return renderToStaticMarkup(tree);
}
async function mountCheckout() {
  renderCheckout();
  const cleanups = harness.effects.map((effect) => effect());
  await Promise.resolve();
  await Promise.resolve();
  return { tree: renderCheckout(), cleanups };
}
function payButton(tree) {
  return findElement(tree, (element) => element.type === 'button' && element.props.className === 'checkout-pay');
}
function contact(tree, values = { name: 'QA Guest', email: 'preview@example.com', phone: '+255123' }) {
  for (const [key, value] of Object.entries(values)) {
    findElement(tree, (element) => element.type === 'input' && element.props.id === `checkout-${key}`)
      .props.onChange({ target: { value } });
  }
  return renderCheckout();
}
function expectNoSubmission() {
  expect(harness.checkout).not.toHaveBeenCalled();
  expect(harness.request).not.toHaveBeenCalled();
  expect(harness.save).not.toHaveBeenCalled();
  expect(harness.dispatch).not.toHaveBeenCalled();
  expect(harness.assign).not.toHaveBeenCalled();
}

beforeEach(() => {
  harness.active = false;
  harness.values = [];
  harness.cursor = 0;
  harness.effects = [];
  harness.effectDeps = [];
  harness.cart = { items: [selection()] };
  for (const mock of [harness.navigate, harness.dispatch, harness.quote, harness.checkout, harness.request,
    harness.save, harness.track, harness.suspend, harness.assign]) mock.mockReset();
  harness.quote.mockImplementation(async (items) => serverQuote(items));
  harness.checkout.mockResolvedValue({ ok: true, provider: 'pesapal', paymentUrl: 'https://cybqa.pesapal.com/synthetic-qa-only', reference: 'DP-2026-654321' });
  harness.request.mockResolvedValue({ ok: true, order: { reference: 'DP-2026-654322', status: 'awaiting_availability', items: [] } });
  vi.stubGlobal('window', { location: { assign: harness.assign } });
});
afterEach(() => {
  harness.active = false;
  vi.unstubAllGlobals();
});

describe('checkout group and pickup payment guards', () => {
  it('blocks a legacy cart without pickup fields even if its quote says available', async () => {
    const legacy = selection();
    delete legacy.pickupZone;
    delete legacy.accommodation;
    harness.cart = { items: [legacy] };
    let { tree } = await mountCheckout();
    tree = contact(tree);
    expect(payButton(tree).props.disabled).toBe(true);
    const html = markup(tree);
    expect(html).toContain(en.checkout.pickup_review);
    expect(html).toContain(en.cart.price_unavailable);
    expect(html).not.toContain('Pay $50.01 deposit');
    // A handler guard also protects against an event dispatched on a disabled
    // control; this assertion tests behavior beyond the DOM disabled attribute.
    await payButton(tree).props.onClick();
    expectNoSubmission();
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('shows only approved server prices and starts the exact deposit inside the order page', async () => {
    harness.cart = { items: [selection({ priceUsd: 1, priceLines: [{ type: 'group_price', amountUsd: 1 }] })] };
    let { tree } = await mountCheckout();
    tree = contact(tree);
    expect(payButton(tree).props.disabled).toBe(false);
    const html = markup(tree);
    expect(html).toContain('$250.01');
    expect(html).toContain('$215.01');
    expect(html).toContain('$35.00');
    expect(html).toContain('$50.01');
    expect(html).toContain('$200.00');
    expect(html).toContain('Pay $50.01 deposit');
    expect(html).not.toContain('$1.00');
    await payButton(tree).props.onClick();
    expect(harness.checkout).toHaveBeenCalledExactlyOnceWith({
      items: harness.cart.items, contact: { name: 'QA Guest', email: 'preview@example.com', phone: '+255123' },
      expectedTotalUsd: 250.01, expectedChargeUsd: 50.01,
    });
    expect(harness.navigate).toHaveBeenCalledExactlyOnceWith('/store/order/DP-2026-654321', {
      state: { payment: { reference: 'DP-2026-654321', provider: 'pesapal', paymentUrl: 'https://cybqa.pesapal.com/synthetic-qa-only' } },
    });
    expect(harness.track).toHaveBeenCalledExactlyOnceWith('payment_started', { items: 1 });
    expect(harness.suspend).toHaveBeenCalledOnce();
    expect(harness.request).not.toHaveBeenCalled();
    expect(harness.assign).not.toHaveBeenCalled();
    expect(harness.save).not.toHaveBeenCalled();
    expect(harness.dispatch).not.toHaveBeenCalled();
  });

  it.each(['sold_out', 'insufficient_seats', 'departed'])('blocks %s without displaying a zero payable deposit', async (status) => {
    harness.quote.mockImplementation(async (items) => serverQuote(items, {
      quotes: [{ id: items[0].id, status, totalUsd: 0, priceLines: [] }],
      subtotalUsd: 0, chargeUsd: 0, balanceUsd: 0,
    }));
    let { tree } = await mountCheckout();
    tree = contact(tree);
    expect(payButton(tree).props.disabled).toBe(true);
    const html = markup(tree);
    expect(html).toContain(en.cart.price_unavailable);
    expect(html).toContain(en.checkout.conflict);
    expect(html).not.toContain('$0.00');
    expect(html).not.toContain('Pay $');
    await payButton(tree).props.onClick();
    expectNoSubmission();
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it.each([null, 0, Number.NaN])('blocks an available row with an invalid payable amount %s', async (totalUsd) => {
    harness.quote.mockImplementation(async (items) => serverQuote(items, {
      quotes: [{ id: items[0].id, status: 'available', totalUsd, priceLines: [] }],
    }));
    let { tree } = await mountCheckout();
    tree = contact(tree);
    expect(payButton(tree).props.disabled).toBe(true);
    await payButton(tree).props.onClick();
    expectNoSubmission();
  });

  it('disables payment after quote transport failure and retries the actual quote effect', async () => {
    harness.quote.mockRejectedValueOnce(new Error('synthetic quote outage'));
    let { tree } = await mountCheckout();
    tree = contact(tree);
    expect(payButton(tree).props.disabled).toBe(true);
    expect(markup(tree)).toContain(renderToStaticMarkup(<>{en.checkout.quote_failed}</>));
    await payButton(tree).props.onClick();
    expectNoSubmission();
    findElement(tree, (element) => element.type === 'button' && element.props.className === 'cart-item__link').props.onClick();
    ({ tree } = await mountCheckout());
    expect(harness.quote).toHaveBeenCalledTimes(2);
    expect(payButton(tree).props.disabled).toBe(false);
    expect(markup(tree)).toContain('Pay $50.01 deposit');
  });

  it('invalidates the former quote immediately when pickup changes and ignores a cleaned-up response', async () => {
    let { tree } = await mountCheckout();
    tree = contact(tree);
    expect(payButton(tree).props.disabled).toBe(false);
    expect(markup(tree)).toContain('Pay $50.01 deposit');
    let resolveQuote;
    harness.quote.mockImplementationOnce(() => new Promise((resolve) => { resolveQuote = resolve; }));
    harness.cart = { items: [selection({ pickupZone: 'east' })] };
    tree = renderCheckout();
    expect(payButton(tree).props.disabled).toBe(true);
    expect(markup(tree)).not.toContain('Pay $50.01 deposit');
    const cleanups = harness.effects.map((effect) => effect());
    cleanups.forEach((cleanup) => cleanup?.());
    resolveQuote(serverQuote(harness.cart.items));
    await Promise.resolve();
    tree = renderCheckout();
    expect(payButton(tree).props.disabled).toBe(true);
    await payButton(tree).props.onClick();
    expectNoSubmission();
  });
});

describe('checkout quote handoff and preserved request flow', () => {
  it('changes an available selection to general enquiry after a server quote-required conflict', async () => {
    harness.checkout.mockResolvedValue({ ok: false, error: 'availability_conflict', conflicts: [{ id: 'qa-spice', status: 'quote_required' }] });
    let { tree } = await mountCheckout();
    tree = contact(tree);
    await payButton(tree).props.onClick();
    expect(harness.checkout).toHaveBeenCalledOnce();
    tree = renderCheckout();
    expect(payButton(tree).props.disabled).toBe(false);
    expect(markup(tree)).toContain(en.panel.contact_quote);
    expect(markup(tree)).toContain(en.cart.price_on_request);
    expect(markup(tree)).not.toContain('Pay $50.01 deposit');
    tree = contact(tree, { email: 'guest@' });
    await payButton(tree).props.onClick();
    expect(harness.navigate).toHaveBeenCalledExactlyOnceWith('/book-now', {
      state: { storeEnquiry: {
        items: [{ experienceId: 'spice-tour', mode: 'shared', guests: 2, pickupZone: 'north', accommodation: 'QA Example Hotel', preferredDate: '2026-10-05', preferredTime: '09:00' }],
        contact: { name: 'QA Guest', email: 'guest@', phone: '+255123' },
      } },
    });
    expect(harness.checkout).toHaveBeenCalledOnce();
    expect(harness.request).not.toHaveBeenCalled();
    expect(harness.dispatch).not.toHaveBeenCalled();
    expect(harness.save).not.toHaveBeenCalled();
    expect(harness.assign).not.toHaveBeenCalled();
    expect(harness.track).toHaveBeenCalledExactlyOnceWith('availability_conflict', { items: 1 });
  });

  it('blocks payment if the server reports pickup-required during submission', async () => {
    harness.checkout.mockResolvedValue({ ok: false, error: 'availability_conflict', conflicts: [{ id: 'qa-spice', status: 'pickup_required' }] });
    let { tree } = await mountCheckout();
    tree = contact(tree);
    await payButton(tree).props.onClick();
    tree = renderCheckout();
    expect(payButton(tree).props.disabled).toBe(true);
    expect(markup(tree)).toContain(en.checkout.pickup_review);
    await payButton(tree).props.onClick();
    expect(harness.checkout).toHaveBeenCalledOnce();
    expect(harness.request).not.toHaveBeenCalled();
    expect(harness.navigate).not.toHaveBeenCalled();
    expect(harness.dispatch).not.toHaveBeenCalled();
  });

  it.each([7, 24])('routes exactly %s passengers with partial contact to enquiry instead of either checkout API', async (guests) => {
    harness.cart = { items: [selection({ guests })] };
    let { tree } = await mountCheckout();
    tree = contact(tree, { name: 'QA Guest', email: 'guest@', phone: '' });
    expect(payButton(tree).props.disabled).toBe(false);
    expect(markup(tree)).toContain(en.panel.contact_quote);
    await payButton(tree).props.onClick();
    expect(harness.navigate).toHaveBeenCalledWith('/book-now', {
      state: { storeEnquiry: {
        items: [expect.objectContaining({ guests, accommodation: 'QA Example Hotel', pickupZone: 'north' })],
        contact: { name: 'QA Guest', email: 'guest@', phone: '' },
      } },
    });
    expectNoSubmission();
    expect(harness.track).not.toHaveBeenCalled();
  });

  it('preserves a mixed request-only order without starting payment or requiring pickup on the request item', async () => {
    harness.cart = { items: [selection(), requestSelection()] };
    let { tree } = await mountCheckout();
    tree = contact(tree);
    expect(payButton(tree).props.disabled).toBe(false);
    const html = markup(tree);
    expect(html).toContain(en.checkout.request_cta);
    expect(html).toContain(en.checkout.request_note);
    expect(html).not.toContain('Pay $50.01 deposit');
    await payButton(tree).props.onClick();
    expect(harness.request).toHaveBeenCalledExactlyOnceWith({
      items: harness.cart.items, contact: { name: 'QA Guest', email: 'preview@example.com', phone: '+255123' },
    });
    expect(harness.checkout).not.toHaveBeenCalled();
    expect(harness.save).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ status: 'awaiting_availability' }));
    expect(harness.dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'clear' });
    expect(harness.navigate).toHaveBeenCalledExactlyOnceWith('/store/order/DP-2026-654322');
    expect(harness.assign).not.toHaveBeenCalled();
    expect(harness.track).toHaveBeenCalledExactlyOnceWith('request_availability', { items: 2 });
  });

  it('keeps the cart and displays errors for an incomplete request contact', async () => {
    harness.cart = { items: [requestSelection()] };
    let { tree } = await mountCheckout();
    tree = contact(tree, { name: 'QA Guest', email: 'guest@' });
    await payButton(tree).props.onClick();
    tree = renderCheckout();
    expect(markup(tree)).toContain(renderToStaticMarkup(<>{en.checkout.errors.email_invalid}</>));
    expectNoSubmission();
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('preserves the historical DPO hosted redirect without clearing the cart', async () => {
    harness.checkout.mockResolvedValue({ ok: true, provider: 'dpo', redirect: 'https://secure.3gdirectpay.com/synthetic-qa-only' });
    let { tree } = await mountCheckout();
    tree = contact(tree);
    await payButton(tree).props.onClick();
    expect(harness.assign).toHaveBeenCalledExactlyOnceWith('https://secure.3gdirectpay.com/synthetic-qa-only');
    expect(harness.navigate).not.toHaveBeenCalled();
    expect(harness.dispatch).not.toHaveBeenCalled();
    expect(harness.save).not.toHaveBeenCalled();
    expect(harness.request).not.toHaveBeenCalled();
  });
});
