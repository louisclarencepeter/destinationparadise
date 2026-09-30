import { Children, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookingPanel from '../../src/components/store/BookingPanel.jsx';
import PickupFields from '../../src/components/store/PickupFields.jsx';
import GuestPicker from '../../src/components/store/GuestPicker.jsx';
import AvailabilityCalendar from '../../src/components/store/AvailabilityCalendar.jsx';
import TimeSlotPicker from '../../src/components/store/TimeSlotPicker.jsx';
import en from '../../src/locales/en/store.json';
import de from '../../src/locales/de/store.json';
import pl from '../../src/locales/pl/store.json';

// Exercise the actual event props and async rate effects without a new DOM
// dependency. The main-agent browser QA covers real layout and interactions.
const harness = vi.hoisted(() => ({
  values: [], cursor: 0, effects: [], effectDeps: [], cart: { items: [] }, editId: null,
  navigate: vi.fn(), dispatch: vi.fn(), fetchPricing: vi.fn(),
  lang: 'en', currency: 'USD', storedGuests: 2,
}));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useState: (initial) => {
      const index = harness.cursor++;
      if (!(index in harness.values)) harness.values[index] = typeof initial === 'function' ? initial() : initial;
      return [harness.values[index], (next) => {
        harness.values[index] = typeof next === 'function' ? next(harness.values[index]) : next;
      }];
    },
    useRef: (initial) => {
      const index = harness.cursor++;
      if (!(index in harness.values)) harness.values[index] = { current: initial };
      return harness.values[index];
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
vi.mock('react-router', () => ({
  useNavigate: () => harness.navigate,
  useLocation: () => ({ pathname: '/excursions/spice-tour', hash: '#book' }),
  useSearchParams: () => [{ get: () => harness.editId }],
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: harness.lang },
    t: (key, options = {}) => {
      const dictionary = { en, de, pl }[harness.lang];
      const read = (path) => path.split('.').reduce((value, part) => value?.[part], dictionary);
      const value = read(key) || read(`${key}_${options.count === 1 ? 'one' : 'other'}`) || key;
      return value.replace(/\{\{(\w+)\}\}/g, (_, name) => options[name] ?? '');
    },
  }),
}));
vi.mock('../../src/context/useCurrency.js', () => ({
  useCurrency: () => ({ currency: harness.currency, rates: { USD: 1, EUR: 0.92, PLN: 4 } }),
}));
vi.mock('../../src/context/useBookingCart.js', () => ({
  useBookingCart: () => ({ state: harness.cart, dispatch: harness.dispatch }),
}));
vi.mock('../../src/hooks/useAvailability.js', () => ({
  useAvailability: () => ({ loading: false, days: null }),
}));
vi.mock('../../src/utils/analytics.js', () => ({ trackEvent: vi.fn() }));
vi.mock('../../src/lib/storeApi.js', async (importOriginal) => ({
  ...await importOriginal(), fetchBookingPricing: (...args) => harness.fetchPricing(...args),
}));

const experience = {
  id: 'spice-tour', minGuests: 1, maxGuests: 10,
  priceUsd: 45, privateSupplementUsd: 90,
};
const approvedPricing = {
  required: true, instantMaxGuests: 6,
  options: {
    shared: { groupPrices: { 1: 5000, 2: 6001, 3: 7000, 6: 12000 }, pickupPrices: { 'stone-town': 0, north: 3500, east: 2500, south: 2000 } },
    private: { groupPrices: { 2: 12000 }, pickupPrices: { 'stone-town': 0, north: 4000 } },
  },
};

function findElement(element, predicate) {
  if (!isValidElement(element)) return undefined;
  if (predicate(element)) return element;
  for (const child of Children.toArray(element.props.children)) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return undefined;
}
function renderPanel() {
  harness.cursor = 0;
  harness.effects = [];
  return BookingPanel({ experience });
}
async function mountPanel() {
  renderPanel();
  const cleanups = harness.effects.map((effect) => effect());
  await Promise.resolve();
  await Promise.resolve();
  return { tree: renderPanel(), cleanups };
}
function pickup(tree, zone = 'north', accommodation = ' Example Hotel ') {
  const fields = findElement(tree, (element) => element.type === PickupFields);
  fields.props.onPickupZoneChange(zone);
  fields.props.onAccommodationChange(accommodation);
  return renderPanel();
}
function submit(tree) {
  return findElement(tree, (element) => element.type === 'button' && element.props.className === 'booking-panel__submit');
}
function selectDeparture(tree) {
  const calendar = findElement(tree, (element) => element.type === AvailabilityCalendar);
  const date = `${calendar.props.monthIso}-28`;
  calendar.props.onSelectDate(date, { times: [{ time: '09:00', seats: 10 }] });
  tree = renderPanel();
  findElement(tree, (element) => element.type === TimeSlotPicker).props.onSelect('09:00');
  return { tree: renderPanel(), date };
}

beforeEach(() => {
  harness.values = [];
  harness.cursor = 0;
  harness.effects = [];
  harness.effectDeps = [];
  harness.cart = { items: [] };
  harness.editId = null;
  harness.lang = 'en';
  harness.currency = 'USD';
  harness.storedGuests = 2;
  harness.navigate.mockReset();
  harness.dispatch.mockReset();
  harness.fetchPricing.mockReset().mockResolvedValue(approvedPricing);
  vi.stubGlobal('window', { sessionStorage: { getItem: () => String(harness.storedGuests) } });
});

describe('group and pickup booking panel', () => {
  it('requires explicit pickup details and a departure before adding an approved quote', async () => {
    let { tree } = await mountPanel();
    expect(submit(tree).props.disabled).toBe(true);
    const fields = findElement(tree, (element) => element.type === PickupFields);
    fields.props.onPickupZoneChange('north');
    tree = renderPanel();
    expect(submit(tree).props.disabled).toBe(true);
    fields.props.onPickupZoneChange('');
    fields.props.onAccommodationChange('Example Hotel');
    tree = renderPanel();
    expect(submit(tree).props.disabled).toBe(true);
    tree = pickup(tree);
    expect(submit(tree).props.disabled).toBe(true);
    expect(renderToStaticMarkup(tree)).toContain('$95.01');
    expect(renderToStaticMarkup(tree)).toContain('$19.01');
    expect(renderToStaticMarkup(tree)).toContain('$76.00');
    const departure = selectDeparture(tree);
    tree = departure.tree;
    expect(submit(tree).props.disabled).toBe(false);
    submit(tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({
      type: 'add', item: expect.objectContaining({
        experienceId: 'spice-tour', mode: 'shared', guests: 2,
        pickupZone: 'north', accommodation: 'Example Hotel', date: departure.date, time: '09:00',
      }),
    });
    expect(harness.dispatch).toHaveBeenCalledWith({ type: 'open_drawer' });
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('preserves mode selection and reprices the selected group and pickup together', async () => {
    let { tree } = await mountPanel();
    tree = pickup(tree);
    const privateButton = findElement(tree, (element) => element.type === 'button' && element.props.children === en.panel.private);
    privateButton.props.onClick();
    tree = renderPanel();
    expect(renderToStaticMarkup(tree)).toContain('$160.00');
    expect(findElement(tree, (element) => element.type === 'button' && element.props.children === en.panel.private).props['aria-pressed']).toBe(true);
  });

  it.each([7, 24])('sends %s guests to a quote with optional dates and preserves their exact group size', async (guests) => {
    harness.storedGuests = guests;
    let { tree } = await mountPanel();
    tree = pickup(tree);
    expect(findElement(tree, (element) => element.type === GuestPicker).props.value).toBe(guests);
    expect(submit(tree).props.disabled).toBe(false);
    submit(tree).props.onClick();
    expect(harness.navigate).toHaveBeenCalledWith('/book-now#booking-contact', {
      state: { storeEnquiry: {
        experienceId: 'spice-tour', mode: 'shared', guests, pickupZone: 'north', accommodation: 'Example Hotel',
        preferredDate: '', preferredTime: '',
      } },
    });
    expect(harness.dispatch).not.toHaveBeenCalled();
  });

  it.each(['other', 'south'])('routes pickup %s to staff when its rate is unavailable', async (zone) => {
    harness.fetchPricing.mockResolvedValue({ options: { shared: { groupPrices: { 2: 6000 }, pickupPrices: { north: 3000 } } } });
    let { tree } = await mountPanel();
    tree = pickup(tree, zone);
    expect(renderToStaticMarkup(tree)).not.toContain('$90.00');
    submit(tree).props.onClick();
    expect(harness.navigate).toHaveBeenCalledWith('/book-now#booking-contact', expect.objectContaining({
      state: { storeEnquiry: expect.objectContaining({ pickupZone: zone }) },
    }));
    expect(harness.dispatch).not.toHaveBeenCalled();
  });

  it('settles a rejected pricing request into a quote without using the editorial fallback price', async () => {
    harness.fetchPricing.mockRejectedValue(new Error('network unavailable'));
    let { tree } = await mountPanel();
    tree = pickup(tree);
    const markup = renderToStaticMarkup(tree);
    expect(markup).toContain(en.panel.pricing_failed);
    expect(markup).not.toContain('$90.00');
    expect(markup).not.toContain('$45.00');
    expect(submit(tree).props.disabled).toBe(false);
    submit(tree).props.onClick();
    expect(harness.navigate).toHaveBeenCalledOnce();
    expect(harness.dispatch).not.toHaveBeenCalled();
  });

  it('ignores a pricing response after the effect is cleaned up', async () => {
    let resolvePricing;
    harness.fetchPricing.mockReturnValue(new Promise((resolve) => { resolvePricing = resolve; }));
    const { cleanups } = await mountPanel();
    cleanups.forEach((cleanup) => cleanup?.());
    resolvePricing(approvedPricing);
    await Promise.resolve();
    const tree = pickup(renderPanel());
    expect(renderToStaticMarkup(tree)).toContain(en.panel.loading_prices);
    expect(renderToStaticMarkup(tree)).not.toContain('$95.01');
  });

  it('loads existing cart fields and updates the same line without losing its departure', async () => {
    harness.editId = 'existing';
    harness.cart.items = [{ id: 'existing', experienceId: 'spice-tour', mode: 'shared', guests: 3, date: '2026-10-20', time: '09:00', pickupZone: 'east', accommodation: 'Beach Hotel' }];
    const { tree } = await mountPanel();
    expect(findElement(tree, (element) => element.type === PickupFields).props).toMatchObject({ pickupZone: 'east', accommodation: 'Beach Hotel' });
    submit(tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({ type: 'update', id: 'existing', patch: expect.objectContaining({
      guests: 3, date: '2026-10-20', time: '09:00', pickupZone: 'east', accommodation: 'Beach Hotel',
    }) });
    expect(harness.navigate).toHaveBeenCalledWith('/excursions/spice-tour#book', { replace: true });
  });

  it('prompts a historical cart line with missing pickup fields instead of assuming Stone Town', async () => {
    harness.editId = 'historical';
    harness.cart.items = [{ id: 'historical', experienceId: 'spice-tour', mode: 'shared', guests: 2, date: '2026-10-20', time: '09:00' }];
    const { tree } = await mountPanel();
    expect(findElement(tree, (element) => element.type === PickupFields).props).toMatchObject({ pickupZone: '', accommodation: '' });
    expect(submit(tree).props.disabled).toBe(true);
    submit(tree).props.onClick();
    expect(harness.dispatch).not.toHaveBeenCalled();
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('drops a selected departure when the increased group no longer fits its available seats', async () => {
    let { tree } = await mountPanel();
    tree = pickup(tree);
    const calendar = findElement(tree, (element) => element.type === AvailabilityCalendar);
    calendar.props.onSelectDate(`${calendar.props.monthIso}-28`, { times: [{ time: '09:00', seats: 3 }] });
    tree = renderPanel();
    findElement(tree, (element) => element.type === TimeSlotPicker).props.onSelect('09:00');
    tree = renderPanel();
    findElement(tree, (element) => element.type === GuestPicker).props.onChange(6);
    renderPanel();
    harness.effects.forEach((effect) => effect());
    tree = renderPanel();
    expect(findElement(tree, (element) => element.type === TimeSlotPicker).props.selectedTime).toBeNull();
    expect(submit(tree).props.disabled).toBe(true);
    submit(tree).props.onClick();
    expect(harness.dispatch).not.toHaveBeenCalled();
  });

  it.each([['de', 'EUR', '87,41'], ['pl', 'PLN', '380,04']])('keeps exact %s currency estimates and the USD checkout note', async (lang, currency, total) => {
    harness.lang = lang;
    harness.currency = currency;
    const { tree } = await mountPanel();
    const markup = renderToStaticMarkup(pickup(tree));
    expect(markup).toContain(total);
    expect(markup).toContain({ de, pl }[lang].panel.currency_estimate);
  });
});

describe('pickup fields', () => {
  it('starts with no default zone, labels both required inputs and limits accommodation text', () => {
    const element = <PickupFields pickupZone="" accommodation="" onPickupZoneChange={vi.fn()} onAccommodationChange={vi.fn()} />;
    const markup = renderToStaticMarkup(element);
    expect(markup).toMatch(/<option value="" selected="">/);
    expect(markup).toMatch(/maxlength="200"/i);
    expect(markup.match(/\brequired=""/g)).toHaveLength(2);
    expect(markup).toContain('pickupZone');
    expect(markup).toContain('accommodation');
  });

  it('removes control characters and caps a pasted accommodation name before passing it to the booking panel', () => {
    const onAccommodationChange = vi.fn();
    let fields;
    function CaptureFields() {
      fields = PickupFields({ pickupZone: 'north', accommodation: '', onPickupZoneChange: vi.fn(), onAccommodationChange });
      return fields;
    }
    renderToStaticMarkup(<CaptureFields />);
    const input = findElement(fields, (element) => element.type === 'input');
    input.props.onChange({ target: { value: `Hotel\u0000${'x'.repeat(220)}` } });
    expect(onAccommodationChange).toHaveBeenCalledWith(`Hotel${'x'.repeat(195)}`);
  });
});
