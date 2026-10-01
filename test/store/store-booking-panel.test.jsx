import { Children, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  lang: 'en', currency: 'USD', storedGuests: 2, availability: { loading: false, days: null },
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
  useAvailability: () => harness.availability,
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
  let tree = renderPanel();
  const cleanups = [];
  // Saved departures wait for their authoritative availability snapshot,
  // which causes a second effect pass after the initial cart/pricing effects.
  for (let pass = 0; pass < 4 && harness.effects.length; pass += 1) {
    const effects = harness.effects;
    cleanups.push(...effects.map((effect) => effect()));
    await Promise.resolve();
    tree = renderPanel();
  }
  return { tree, cleanups };
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
  calendar.props.onSelectDate(date, { bookable: true, times: [{ time: '09:00', seats: 10 }] });
  tree = renderPanel();
  findElement(tree, (element) => element.type === TimeSlotPicker).props.onSelect('09:00');
  return { tree: renderPanel(), date };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-01T09:00:00Z'));
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
  harness.availability = { loading: false, days: Object.fromEntries(
    ['2026-10-20', '2026-10-28', '2027-02-28'].map((date) => [date, {
      date, bookable: true, times: [{ time: '09:00', seats: 10 }],
    }]),
  ) };
  vi.stubGlobal('window', { sessionStorage: { getItem: () => String(harness.storedGuests) } });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('fixed booking calendar horizon', () => {
  it('navigates across the year and stops at February 2027', async () => {
    let { tree } = await mountPanel();
    let calendar = findElement(tree, (element) => element.type === AvailabilityCalendar);
    expect(calendar.props).toMatchObject({ monthIso: '2026-10', canPrev: false, canNext: true });
    for (const monthIso of ['2026-11', '2026-12', '2027-01', '2027-02']) {
      calendar.props.onShiftMonth(1);
      tree = renderPanel();
      calendar = findElement(tree, (element) => element.type === AvailabilityCalendar);
      expect(calendar.props.monthIso).toBe(monthIso);
      expect(calendar.props.canPrev).toBe(true);
    }
    expect(calendar.props.canNext).toBe(false);
    calendar.props.onShiftMonth(-1);
    calendar = findElement(renderPanel(), (element) => element.type === AvailabilityCalendar);
    expect(calendar.props).toMatchObject({ monthIso: '2027-01', canNext: true });
    expect(harness.dispatch).not.toHaveBeenCalled();
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('restores a saved 28 February departure and updates its original cart line', async () => {
    harness.editId = 'last-day';
    harness.cart.items = [{
      id: 'last-day', experienceId: 'spice-tour', mode: 'shared', guests: 3,
      date: '2027-02-28', time: '09:00', pickupZone: 'east', accommodation: 'Beach Hotel',
    }];
    const { tree } = await mountPanel();
    const calendar = findElement(tree, (element) => element.type === AvailabilityCalendar);
    expect(calendar.props).toMatchObject({ monthIso: '2027-02', selectedDate: '2027-02-28', canNext: false });
    expect(findElement(tree, (element) => element.type === PickupFields).props)
      .toMatchObject({ pickupZone: 'east', accommodation: 'Beach Hotel' });
    expect(submit(tree).props.disabled).toBe(false);
    submit(tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({
      type: 'update', id: 'last-day', patch: expect.objectContaining({
        guests: 3, date: '2027-02-28', time: '09:00', pickupZone: 'east', accommodation: 'Beach Hotel',
      }),
    });
    expect(harness.navigate).toHaveBeenCalledWith('/excursions/spice-tour#book', { replace: true });
  });
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

  it.each([7, 24])('preserves stored %s guests as invalid until the guest explicitly reduces the group', async (guests) => {
    harness.storedGuests = guests;
    let { tree } = await mountPanel();
    tree = pickup(tree);
    const picker = findElement(tree, (element) => element.type === GuestPicker);
    expect(picker.props).toMatchObject({ value: guests, max: 6 });
    expect(renderToStaticMarkup(tree)).toContain(en.panel.quote_large_group);
    expect(submit(tree).props.disabled).toBe(true);
    submit(tree).props.onClick();
    expect(harness.navigate).not.toHaveBeenCalled();
    expect(harness.dispatch).not.toHaveBeenCalled();
    picker.props.onChange(6);
    const departure = selectDeparture(renderPanel());
    expect(submit(departure.tree).props.disabled).toBe(false);
    submit(departure.tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({
      type: 'add', item: expect.objectContaining({ guests: 6, date: departure.date, time: '09:00' }),
    });
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('adds a known pickup area with an unconfigured rate to the cart without inventing a price', async () => {
    harness.fetchPricing.mockResolvedValue({ options: { shared: { groupPrices: { 2: 6000 }, pickupPrices: { north: 3000 } } } });
    let { tree } = await mountPanel();
    tree = pickup(tree, 'south');
    expect(submit(tree).props.disabled).toBe(true);
    const departure = selectDeparture(tree);
    tree = departure.tree;
    expect(renderToStaticMarkup(tree)).not.toContain('$90.00');
    expect(renderToStaticMarkup(tree)).toContain(en.panel.price_unavailable);
    expect(submit(tree).props.children).toContain(en.panel.add);
    expect(submit(tree).props.disabled).toBe(false);
    submit(tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({
      type: 'add', item: expect.objectContaining({ pickupZone: 'south', accommodation: 'Example Hotel', date: departure.date }),
    });
    const item = harness.dispatch.mock.calls.find(([action]) => action.type === 'add')[0].item;
    expect(item).not.toHaveProperty('price');
    expect(item).not.toHaveProperty('totalUsd');
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('blocks other pickup areas even with a departure and does not redirect to Book Now', async () => {
    let { tree } = await mountPanel();
    tree = selectDeparture(pickup(tree, 'other')).tree;
    expect(submit(tree).props.disabled).toBe(true);
    expect(renderToStaticMarkup(tree)).toContain(en.panel.quote_other_area);
    submit(tree).props.onClick();
    expect(harness.navigate).not.toHaveBeenCalled();
    expect(harness.dispatch).not.toHaveBeenCalled();
  });

  it('keeps a rejected pricing request in the cart flow and still requires a valid departure', async () => {
    harness.fetchPricing.mockRejectedValue(new Error('network unavailable'));
    let { tree } = await mountPanel();
    tree = pickup(tree);
    const markup = renderToStaticMarkup(tree);
    expect(markup).toContain(en.panel.pricing_failed);
    expect(markup).not.toContain('$90.00');
    expect(markup).not.toContain('$45.00');
    expect(submit(tree).props.disabled).toBe(true);
    submit(tree).props.onClick();
    expect(harness.dispatch).not.toHaveBeenCalled();
    const departure = selectDeparture(tree);
    expect(submit(departure.tree).props.disabled).toBe(false);
    submit(departure.tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({
      type: 'add', item: expect.objectContaining({ date: departure.date, guests: 2, pickupZone: 'north' }),
    });
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('allows a configured departure into the cart while prices are still loading', async () => {
    harness.fetchPricing.mockReturnValue(new Promise(() => {}));
    let { tree } = await mountPanel();
    tree = pickup(tree);
    expect(submit(tree).props.disabled).toBe(true);
    tree = selectDeparture(tree).tree;
    expect(renderToStaticMarkup(tree)).toContain(en.panel.loading_prices);
    expect(renderToStaticMarkup(tree)).not.toContain('$95.01');
    expect(submit(tree).props.disabled).toBe(false);
    submit(tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({ type: 'add', item: expect.objectContaining({ guests: 2 }) });
    expect(harness.navigate).not.toHaveBeenCalled();
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

  it('updates an unpriced existing departure in the cart without an enquiry handoff', async () => {
    harness.fetchPricing.mockResolvedValue(null);
    harness.editId = 'unpriced';
    harness.cart.items = [{ id: 'unpriced', experienceId: 'spice-tour', mode: 'shared', guests: 2, date: '2026-10-20', time: '09:00', pickupZone: 'north', accommodation: 'Hotel' }];
    const { tree } = await mountPanel();
    expect(renderToStaticMarkup(tree)).toContain(en.panel.price_unavailable);
    expect(renderToStaticMarkup(tree)).not.toContain('$95.01');
    expect(submit(tree).props.children).toContain(en.panel.update);
    expect(submit(tree).props.disabled).toBe(false);
    submit(tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({
      type: 'update', id: 'unpriced', patch: expect.objectContaining({
        date: '2026-10-20', time: '09:00', guests: 2, pickupZone: 'north', accommodation: 'Hotel',
      }),
    });
    expect(harness.navigate).toHaveBeenCalledExactlyOnceWith('/excursions/spice-tour#book', { replace: true });
  });

  it.each([
    ['2026-10-01', true], ['2026-09-30', false], ['2027-03-01', false],
  ])('uses server bookability for %s while enforcing the fixed date range', async (date, allowed) => {
    let { tree } = await mountPanel();
    tree = pickup(tree);
    findElement(tree, (element) => element.type === AvailabilityCalendar).props.onSelectDate(date, {
      bookable: true, times: [{ time: '09:00', seats: 10 }],
    });
    tree = renderPanel();
    findElement(tree, (element) => element.type === TimeSlotPicker).props.onSelect('09:00');
    tree = renderPanel();
    expect(submit(tree).props.disabled).toBe(!allowed);
    submit(tree).props.onClick();
    if (allowed) {
      expect(harness.dispatch).toHaveBeenCalledWith({ type: 'add', item: expect.objectContaining({ date }) });
    } else {
      expect(harness.dispatch).not.toHaveBeenCalled();
    }
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('preserves a verified selected departure while the guest browses another month', async () => {
    let { tree } = await mountPanel();
    const departure = selectDeparture(pickup(tree));
    tree = departure.tree;
    findElement(tree, (element) => element.type === AvailabilityCalendar).props.onShiftMonth(1);
    tree = renderPanel();
    expect(findElement(tree, (element) => element.type === AvailabilityCalendar).props.monthIso).toBe('2026-11');
    expect(submit(tree).props.disabled).toBe(false);
    submit(tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({ type: 'add', item: expect.objectContaining({ date: departure.date }) });
  });

  it('preserves an oversized saved cart line without saving or lowering it until explicitly corrected', async () => {
    harness.editId = 'oversized';
    harness.cart.items = [{ id: 'oversized', experienceId: 'spice-tour', mode: 'shared', guests: 7, date: '2026-10-20', time: '09:00', pickupZone: 'east', accommodation: 'Beach Hotel' }];
    let { tree } = await mountPanel();
    const picker = findElement(tree, (element) => element.type === GuestPicker);
    expect(picker.props).toMatchObject({ value: 7, max: 6 });
    expect(submit(tree).props.children).toContain(en.panel.update);
    expect(submit(tree).props.disabled).toBe(true);
    submit(tree).props.onClick();
    expect(harness.cart.items[0].guests).toBe(7);
    expect(harness.dispatch).not.toHaveBeenCalled();
    expect(harness.navigate).not.toHaveBeenCalled();
    picker.props.onChange(6);
    tree = renderPanel();
    expect(submit(tree).props.disabled).toBe(false);
    submit(tree).props.onClick();
    expect(harness.dispatch).toHaveBeenCalledWith({
      type: 'update', id: 'oversized', patch: expect.objectContaining({ guests: 6, date: '2026-10-20', time: '09:00' }),
    });
    expect(harness.navigate).toHaveBeenCalledWith('/excursions/spice-tour#book', { replace: true });
  });

  it.each([
    { bookable: false, times: [] },
    { bookable: true, times: [{ time: '14:00', seats: 10 }] },
    { bookable: true, times: [{ time: '09:00', seats: 1 }] },
  ])('requires fresh bookability and the saved time to fit before updating a saved departure', async (availability) => {
    harness.editId = 'stale';
    harness.cart.items = [{ id: 'stale', experienceId: 'spice-tour', mode: 'shared', guests: 2, date: '2026-10-20', time: '09:00', pickupZone: 'north', accommodation: 'Hotel' }];
    harness.availability.days['2026-10-20'] = { date: '2026-10-20', ...availability };
    const { tree } = await mountPanel();
    expect(submit(tree).props.disabled).toBe(true);
    submit(tree).props.onClick();
    expect(harness.dispatch).not.toHaveBeenCalled();
    expect(harness.navigate).not.toHaveBeenCalled();
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
    calendar.props.onSelectDate(`${calendar.props.monthIso}-28`, { bookable: true, times: [{ time: '09:00', seats: 3 }] });
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
