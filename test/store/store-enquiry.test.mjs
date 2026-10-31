import { Children, createElement, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInstance } from 'i18next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Booking from '../../src/pages/Booking.jsx';
import BookingForm from '../../src/components/booking/BookingForm.jsx';
import { DEFAULT_BOOKING_FORM, PAYMENT_OPTIONS, SERVICE_TYPES } from '../../src/data/bookingPageData.js';
import { applyStoreEnquiry, bookingGuestOptions, isStoreEnquiryDate, parseStoreEnquiry, storeEnquiryNote } from '../../src/lib/storeEnquiry.js';
import enBooking from '../../src/locales/en/booking.json';
import deBooking from '../../src/locales/de/booking.json';
import plBooking from '../../src/locales/pl/booking.json';
import enStore from '../../src/locales/en/store.json';
import deStore from '../../src/locales/de/store.json';
import plStore from '../../src/locales/pl/store.json';

// Run the actual page effects with mocked challenge transport. SSR below uses
// real React hooks and exercises the actual guest select without a DOM package.
const harness = vi.hoisted(() => ({
  active: false, values: [], cursor: 0, effects: [], effectDeps: [],
  ready: true, products: [], t: null, lang: 'en',
  location: { key: 'enquiry-one', pathname: '/book-now', hash: '', search: '', state: null },
  query: null,
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
    useCallback: (callback, deps) => harness.active ? callback : actual.useCallback(callback, deps),
  };
});
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: harness.t, ready: harness.ready, i18n: { resolvedLanguage: harness.lang, language: harness.lang } }),
}));
vi.mock('react-router', () => ({
  useLocation: () => harness.location,
  useSearchParams: () => [harness.query],
  Link: ({ to, children, ...props }) => createElement('a', { href: to, ...props }, children),
}));
vi.mock('../../src/hooks/useBookingProducts.js', () => ({ useBookingProducts: () => ({ all: harness.products }) }));
vi.mock('../../src/hooks/useFloatingBookingSummary.js', () => ({ useFloatingBookingSummary: () => ({}) }));
vi.mock('../../src/hooks/useRevealOnScroll.js', () => ({ useRevealOnScroll: () => {} }));
vi.mock('../../src/hooks/usePageMeta.js', () => ({ default: () => {} }));
vi.mock('../../src/context/useCurrency.js', () => ({ useCurrency: () => ({ format: (value) => `$${value}` }) }));
vi.mock('../../src/utils/analytics.js', () => ({ trackEvent: vi.fn() }));

const translator = createInstance();
await translator.init({
  lng: 'en', fallbackLng: 'en', defaultNS: 'booking', ns: ['booking', 'store'],
  interpolation: { escapeValue: false },
  resources: {
    en: { booking: enBooking, store: enStore },
    de: { booking: deBooking, store: deStore },
    pl: { booking: plBooking, store: plStore },
  },
});
const products = [
  { type: 'excursion', value: 'excursion:spice-tour', label: 'Spice Tour', raw: { id: 'spice-tour' } },
  { type: 'excursion', value: 'excursion:prison-island', label: 'Prison Island', raw: { id: 'prison-island' } },
  { type: 'transfer', value: 'transfer:airport-stonetown', label: 'Airport transfer', raw: { slug: 'airport-stonetown' } },
  { type: 'retreat', value: 'retreat:coastal-reset', label: 'Coastal retreat', raw: { slug: 'coastal-reset', options: [{ slug: 'week', price: 100 }] } },
];
const item = (overrides = {}) => ({
  experienceId: 'spice-tour', mode: 'shared', guests: 7, pickupZone: 'north', accommodation: ' Example Hotel ',
  preferredDate: '2026-10-05', preferredTime: '09:00', ...overrides,
});
const tFor = (lang) => translator.getFixedT(lang, ['booking', 'store']);

function findElement(element, predicate) {
  if (!isValidElement(element)) return undefined;
  if (predicate(element)) return element;
  for (const child of Children.toArray(element.props.children)) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return undefined;
}
function renderBooking() {
  harness.active = true;
  harness.cursor = 0;
  harness.effects = [];
  return Booking();
}
async function applyPageEffects() {
  renderBooking();
  for (const effect of harness.effects) effect();
  await Promise.resolve();
  await Promise.resolve();
  return findElement(renderBooking(), (element) => element.type === BookingForm).props;
}
function formMarkup(guests) {
  harness.active = false;
  return renderToStaticMarkup(createElement(BookingForm, {
    form: { ...DEFAULT_BOOKING_FORM, guests },
    serviceTypes: SERVICE_TYPES, paymentOptions: PAYMENT_OPTIONS, transferTiers: [],
    retreatOptions: [], retreatDepartures: [], visibleProducts: [], budgetOptions: [], comfortOptions: [],
    humanChallenge: { loading: false, error: '', question: 'Mock question' }, humanChallengeAnswer: '',
    status: 'idle', botField: '', turnstileSiteKey: '',
    update: () => () => {}, onBotFieldChange: () => {}, onSubmit: () => {},
    onHumanChallengeAnswerChange: () => {}, onHumanChallengeRefresh: () => {},
  }));
}

beforeEach(() => {
  harness.active = false;
  harness.values = [];
  harness.cursor = 0;
  harness.effects = [];
  harness.effectDeps = [];
  harness.ready = true;
  harness.products = products;
  harness.lang = 'en';
  harness.t = tFor('en');
  harness.location = { key: 'enquiry-one', pathname: '/book-now', hash: '', search: '', state: null };
  harness.query = new URLSearchParams();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, question: 'Mock question', token: 'mock-challenge-only' }) }));
});
afterEach(() => {
  harness.active = false;
  vi.unstubAllGlobals();
});

describe('bounded store enquiry handoff', () => {
  it.each([1, 6, 7, 10, 24])('keeps exactly %s guests and accepts a known product only', (guests) => {
    const enquiry = parseStoreEnquiry(item({ guests, clientPrice: 1, title: 'Untrusted title' }), products);
    expect(enquiry.items[0]).toEqual({
      experienceId: 'spice-tour', mode: 'shared', guests, pickupZone: 'north', accommodation: 'Example Hotel',
      preferredDate: '2026-10-05', preferredTime: '09:00', product: products[0],
    });
    const form = applyStoreEnquiry(DEFAULT_BOOKING_FORM, enquiry, tFor('en'));
    expect(form).toMatchObject({ serviceType: 'excursion', product: 'excursion:spice-tour', guests: String(guests), startDate: '2026-10-05', paymentPreference: 'later' });
    expect(form.message).not.toContain('Untrusted title');
    expect(form.message).not.toContain('clientPrice');
  });

  it.each([0, -1, 25, 2.5, '7', Number.NaN])('rejects invalid guests %s without clamping', (guests) => {
    expect(parseStoreEnquiry(item({ guests }), products)).toBeNull();
  });

  it.each([
    null, [], {}, { items: [] }, { items: Array.from({ length: 21 }, () => item()) },
    item({ experienceId: 'unknown-product' }), item({ mode: 'unknown' }), item({ mode: { toString: () => 'shared' } }),
    item({ pickupZone: 'unpriced-zone' }), item({ pickupZone: 4 }), item({ accommodation: 'x'.repeat(201) }),
    item({ accommodation: 'Hotel\nInjected note' }), item({ preferredDate: 'x'.repeat(301) }),
    item({ preferredDate: '2026-02-30' }), item({ preferredTime: '24:00' }), item({ preferredTime: '09:99' }),
    { items: [item(), item({ experienceId: 'unknown-product' })] },
  ])('rejects malformed or unknown state %#', (state) => {
    expect(parseStoreEnquiry(state, products)).toBeNull();
  });

  it.each([
    { name: ' QA Guest ', email: 'guest@', phone: '+255123' },
    { name: ' QA Guest ', email: 'x'.repeat(255), phone: '+255123' },
    { name: ' QA Guest ', email: 'Injected\nemail@example.com', phone: '+255123' },
  ])('retains the trip and valid contact fields when email is incomplete or malformed', (contact) => {
    const enquiry = parseStoreEnquiry({ items: [item()], contact }, products);
    expect(enquiry.items).toHaveLength(1);
    expect(enquiry.contact).toEqual({ name: 'QA Guest', phone: '+255123' });
    const form = applyStoreEnquiry({ ...DEFAULT_BOOKING_FORM, email: 'existing@example.com' }, enquiry, tFor('en'));
    expect(form).toMatchObject({ product: 'excursion:spice-tour', guests: '7', email: 'existing@example.com' });
  });

  it.each([null, [], 'untrusted', { name: 'x'.repeat(201), phone: 'x'.repeat(61), email: 3 }])('ignores invalid optional contact without losing valid selections', (contact) => {
    const enquiry = parseStoreEnquiry({ items: [item()], contact }, products);
    expect(enquiry.items[0].guests).toBe(7);
    expect(enquiry.contact).toEqual({});
  });

  it('supports an older selection with absent pickup details and flexible requested dates', () => {
    const enquiry = parseStoreEnquiry({ experienceId: 'prison-island', mode: 'request', guests: 4, preferredDate: '22–24 August, flexible' }, products);
    expect(enquiry.items[0]).toMatchObject({ pickupZone: '', accommodation: '', preferredTime: '' });
    const form = applyStoreEnquiry({ ...DEFAULT_BOOKING_FORM, message: 'My existing note', whatsapp: '+123' }, enquiry, tFor('en'));
    expect(form.startDate).toBe('');
    expect(form.message).toContain('22–24 August, flexible');
    expect(form.message).toContain('My existing note\n\nPrison Island');
    expect(form.whatsapp).toBe('+123');
  });

  it.each(['en', 'de', 'pl'])('keeps bundle titles, per-item counts and localized details in %s', (lang) => {
    const enquiry = parseStoreEnquiry({ items: [item(), item({ experienceId: 'prison-island', mode: 'private', guests: 24, pickupZone: 'other', preferredDate: '', preferredTime: '' })], contact: { name: ' QA Guest ', email: ' preview@example.com ', phone: ' +255123 ', price: 1 } }, products);
    const t = tFor(lang);
    const form = applyStoreEnquiry({ ...DEFAULT_BOOKING_FORM, message: 'Existing note', budget: 'saved budget' }, enquiry, t);
    expect(form).toMatchObject({ name: 'QA Guest', email: 'preview@example.com', phone: '+255123', guests: '7', budget: 'saved budget', paymentPreference: 'later' });
    expect(form.message).toMatch(/^Existing note\n\nSpice Tour\n/);
    expect(form.message).toContain('\n\nPrison Island\n');
    expect(form.message).toContain(t('store:pickup.zones.north'));
    expect(form.message).toContain(t('store:pickup.zones.other'));
    expect(form.message).toContain(t('store:cart.mode_private'));
    expect(form.message).toContain(t('common.flexible'));
    expect(form.message).toContain('24');
    expect(form.message).not.toContain('{{');
    expect(form.message).not.toContain('store:');
    expect(storeEnquiryNote(enquiry, t)).not.toContain('preview@example.com');
  });

  it.each([['2028-02-29', true], ['2026-02-29', false], ['2026-10-05', true], ['5 October', false]])('validates ISO date %s', (value, valid) => {
    expect(isStoreEnquiryDate(value)).toBe(valid);
  });
});

describe('booking page handoff and preserved prefills', () => {
  it('waits for translated products, applies once per location key and retains guest edits on language changes', async () => {
    harness.ready = false;
    harness.products = [];
    harness.location.state = { storeEnquiry: item() };
    let props = await applyPageEffects();
    expect(props.form).toEqual(DEFAULT_BOOKING_FORM);
    harness.products = [{ ...products[0], label: 'Gewürztour' }];
    harness.ready = true;
    harness.lang = 'de';
    harness.t = tFor('de');
    props = await applyPageEffects();
    expect(props.form).toMatchObject({ product: 'excursion:spice-tour', guests: '7', paymentPreference: 'later' });
    expect(props.form.message).toMatch(/^Gewürztour\n/);
    props.update('message')({ target: { value: `${props.form.message}\nGuest edit` } });
    const editedMessage = findElement(renderBooking(), (element) => element.type === BookingForm).props.form.message;
    harness.lang = 'pl';
    harness.t = tFor('pl');
    harness.products = [{ ...products[0], label: 'Wycieczka przyprawowa' }];
    props = await applyPageEffects();
    expect(props.form.message).toBe(editedMessage);
    harness.location = { ...harness.location, key: 'enquiry-two', state: { storeEnquiry: item({ guests: 24 }) } };
    props = await applyPageEffects();
    expect(props.form.guests).toBe('24');
    const secondMessage = props.form.message;
    harness.location = { ...harness.location, key: 'enquiry-one', state: { storeEnquiry: item() } };
    props = await applyPageEffects();
    expect(props.form.message).toBe(secondMessage);
    expect(props.form.guests).toBe('24');
    expect(fetch.mock.calls.every(([url]) => url === '/api/booking-challenge')).toBe(true);
  });

  it('does not apply an unknown product or mutate the URL to carry personal details', async () => {
    harness.location.state = { storeEnquiry: item({ experienceId: 'unknown-product' }) };
    const props = await applyPageEffects();
    expect(props.form).toEqual(DEFAULT_BOOKING_FORM);
    expect(harness.location.search).toBe('');
    expect(harness.query.toString()).toBe('');
  });

  it('keeps a checkout bundle with a partial email and lets the guest complete the form', async () => {
    harness.location.state = { storeEnquiry: { items: [item(), item({ experienceId: 'prison-island', guests: 24 })], contact: { name: 'QA Guest', email: 'guest@' } } };
    const props = await applyPageEffects();
    expect(props.form).toMatchObject({ name: 'QA Guest', email: '', product: 'excursion:spice-tour', guests: '7', paymentPreference: 'later' });
    expect(props.form.message).toContain('Prison Island');
    expect(props.form.message).toContain('24');
  });

  it.each([
    ['transfer', 'airport-stonetown', 'transfer:airport-stonetown'],
    ['retreat', 'coastal-reset', 'retreat:coastal-reset'],
  ])('preserves existing %s deep-link selection without a store handoff', async (type, id, product) => {
    harness.query = new URLSearchParams({ type, item: id });
    const props = await applyPageEffects();
    expect(props.form).toMatchObject({ serviceType: type, product, paymentPreference: DEFAULT_BOOKING_FORM.paymentPreference });
    if (type === 'retreat') expect(props.form).toMatchObject({ retreatOption: 'week', startDate: '', endDate: '' });
  });

  it('preserves an unmatched general-enquiry prefill and does not duplicate it on language changes', async () => {
    harness.query = new URLSearchParams({ type: 'custom', item: 'unknown', title: 'Custom journey' });
    let props = await applyPageEffects();
    const message = props.form.message;
    expect(props.form.serviceType).toBe('custom');
    expect(message).toContain('Custom journey');
    harness.lang = 'de';
    harness.t = tFor('de');
    props = await applyPageEffects();
    expect(props.form.message).toBe(message);
  });
});

describe('exact guest options in the existing booking form', () => {
  it('provides a contact continuation anchor while retaining the full booking form', () => {
    const markup = formMarkup('7');
    expect(markup).toMatch(/<form[^>]*id="booking-details"/);
    expect(markup).toMatch(/<div class="booking-row" id="booking-contact">[\s\S]*?name="name"[\s\S]*?name="email"[\s\S]*?<\/div>/);
    expect(markup).toContain('name="serviceType"');
    expect(markup).toContain('name="guests"');
  });

  it.each(['6', '7', '10', '24'])('renders exact %s as the selected value and retains legacy open-ended choices', (guests) => {
    const markup = formMarkup(guests);
    const select = markup.match(/<select name="guests"[\s\S]*?<\/select>/)?.[0];
    expect(select).toContain(`<option value="${guests}" selected="">${guests}</option>`);
    expect(select).toContain('<option value="6+">6+</option>');
    expect(select).toContain('<option value="10+">10+</option>');
  });

  it.each(['6+', '10+'])('keeps the existing %s selection', (guests) => {
    expect(formMarkup(guests)).toContain(`<option value="${guests}" selected="">${guests}</option>`);
  });

  it('never inserts a clamped or malformed exact option', () => {
    expect(bookingGuestOptions('25')).toEqual(['1', '2', '3', '4', '5', '6', '6+', '10+']);
    expect(bookingGuestOptions('7+')).not.toContain('7+');
  });
});
