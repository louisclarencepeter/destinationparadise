import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getInstantExperience,
  getStoreCards,
  INSTANT_EXPERIENCE_IDS,
  isInstantBookable,
} from '../../src/data/commerceCatalog.js';
import {
  addDaysIso,
  BOOKING_END_DATE,
  fetchMonthAvailability,
  isDateInBookingWindow,
  priceSelection,
  quoteCartItems,
  seatsLeft,
  submitCheckout,
  todayInStoreTz,
} from '../../src/lib/storeApi.js';

const NO_LATENCY = { latencyMs: 0 };

beforeEach(() => {
  // Freeze only the calendar clock: async fixture timers remain real.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-01T09:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

// A guaranteed-bookable fixture departure: first date after tomorrow where the
// deterministic generator leaves enough seats.
function findOpenDeparture(experienceId, minSeats = 1) {
  const experience = getInstantExperience(experienceId);
  const today = todayInStoreTz();
  for (let offset = 1; offset <= 30; offset += 1) {
    const date = addDaysIso(today, offset);
    for (const time of experience.departureTimes) {
      if (seatsLeft(experienceId, date, time) >= minSeats) return { date, time };
    }
  }
  throw new Error('fixture generator produced no bookable departure in 30 days');
}

describe('commerce catalog', () => {
  it('exposes exactly the pilot allowlist as instant-bookable', () => {
    expect(INSTANT_EXPERIENCE_IDS.sort()).toEqual(['safari-blue', 'spice-tour', 'stone-town']);
    // A numeric editorial price must not imply instant booking (prison-island has one).
    expect(isInstantBookable('prison-island')).toBe(false);
  });

  it('derives editorial fields and keeps commercial rules', () => {
    const exp = getInstantExperience('safari-blue');
    expect(exp).toMatchObject({
      title: 'Safari Blue',
      priceUsd: 95,
      privateSupplementUsd: 180,
      bookingMode: 'instant',
      timezone: 'Africa/Dar_es_Salaam',
    });
    expect(exp.departureTimes.length).toBeGreaterThan(0);
    expect(exp.image).toMatch(/\.webp$/);
  });

  it('builds grid cards with instant pilots and request-only products', () => {
    const cards = getStoreCards();
    const kinds = Object.fromEntries(cards.map((card) => [card.id, card.kind]));
    expect(kinds['safari-blue']).toBe('instant');
    expect(kinds['prison-island']).toBe('request');
    expect(kinds['custom-journey']).toBe('request');
    for (const card of cards) {
      expect(card.image, card.id).toBeTruthy();
      expect(card.to, card.id).toBeTruthy();
    }
  });
});

describe('availability fixtures', () => {
  it('is deterministic per departure', () => {
    expect(seatsLeft('safari-blue', '2026-08-18', '08:30')).toBe(seatsLeft('safari-blue', '2026-08-18', '08:30'));
  });

  it('stays within 0..8 seats', () => {
    const today = todayInStoreTz();
    for (let offset = 1; offset <= 40; offset += 1) {
      const seats = seatsLeft('spice-tour', addDaysIso(today, offset), '09:00');
      expect(seats).toBeGreaterThanOrEqual(0);
      expect(seats).toBeLessThanOrEqual(8);
    }
  });

  it('offers future dates across the year through 28 February, with an inclusive fixed cutoff', () => {
    const today = todayInStoreTz();
    expect(today).toBe('2026-10-01');
    expect(BOOKING_END_DATE).toBe('2027-02-28');
    expect(isDateInBookingWindow('2026-09-30')).toBe(false);
    expect(isDateInBookingWindow(today)).toBe(false);
    expect(isDateInBookingWindow(addDaysIso(today, 1))).toBe(true);
    expect(isDateInBookingWindow('2026-12-31')).toBe(true);
    expect(isDateInBookingWindow('2027-01-01')).toBe(true);
    expect(isDateInBookingWindow('2027-02-28')).toBe(true);
    expect(isDateInBookingWindow('2027-03-01')).toBe(false);
  });

  it('does not roll the cutoff into March as the current day advances', () => {
    vi.setSystemTime(new Date('2027-02-27T09:00:00Z'));
    expect(isDateInBookingWindow('2027-02-28')).toBe(true);
    expect(isDateInBookingWindow('2027-03-01')).toBe(false);
    vi.setSystemTime(new Date('2027-02-28T09:00:00Z'));
    expect(isDateInBookingWindow('2027-02-28')).toBe(false);
    expect(isDateInBookingWindow('2027-03-01')).toBe(false);
  });

  it('returns a month keyed by ISO date with per-time seats', async () => {
    const today = todayInStoreTz();
    const [year, month] = today.split('-').map(Number);
    const result = await fetchMonthAvailability('stone-town', year, month, NO_LATENCY);
    expect(result.days[today]).toMatchObject({ bookable: false });
    const anyDay = Object.values(result.days).find((day) => day.bookable);
    if (anyDay) {
      expect(anyDay.times.length).toBe(getInstantExperience('stone-town').departureTimes.length);
    }
  });

  it('returns December, January and February availability but no March departures', async () => {
    const experience = getInstantExperience('stone-town');
    for (const [year, month, finalDay] of [[2026, 12, 31], [2027, 1, 31], [2027, 2, 28]]) {
      const result = await fetchMonthAvailability('stone-town', year, month, NO_LATENCY);
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      expect(Object.keys(result.days)).toHaveLength(finalDay);
      expect(result.days[`${prefix}-${finalDay}`].times).toHaveLength(experience.departureTimes.length);
      expect(Object.values(result.days).some((day) => day.bookable)).toBe(true);
    }
    const march = await fetchMonthAvailability('stone-town', 2027, 3, NO_LATENCY);
    expect(Object.keys(march.days)).toHaveLength(31);
    expect(Object.values(march.days).every((day) => !day.bookable && day.times.length === 0)).toBe(true);
  });

  it('rejects unknown experiences', async () => {
    await expect(fetchMonthAvailability('jetski-safari', 2026, 8, NO_LATENCY)).rejects.toThrow(/Unknown store experience/);
  });
});

describe('pricing', () => {
  it('prices shared per person and private with supplement', () => {
    const exp = getInstantExperience('safari-blue');
    expect(priceSelection(exp, 'shared', 2).totalUsd).toBe(190);
    expect(priceSelection(exp, 'private', 2).totalUsd).toBe(190 + 180);
    expect(priceSelection(exp, 'private', 1).lines).toHaveLength(2);
  });
});

describe('quote and checkout', () => {
  it('allows a final-day departure but rejects the whole checkout when March is also requested', async () => {
    const date = '2027-02-28';
    const time = getInstantExperience('stone-town').departureTimes
      .find((departureTime) => seatsLeft('stone-town', date, departureTime) >= 1);
    expect(time).toBeTruthy();
    const lastDay = { id: 'last-day', experienceId: 'stone-town', mode: 'shared', guests: 1, date, time };
    const march = { ...lastDay, id: 'after-cutoff', date: '2027-03-01' };
    const quote = await quoteCartItems([lastDay, march], NO_LATENCY);
    expect(quote.quotes).toEqual([
      expect.objectContaining({ id: 'last-day', status: 'available', totalUsd: 55 }),
      expect.objectContaining({ id: 'after-cutoff', status: 'departed', totalUsd: 0 }),
    ]);
    expect(quote.subtotalUsd).toBe(55);
    const contact = { name: 'Fixture Guest', email: 'fixture@example.com' };
    const rejected = await submitCheckout({ items: [lastDay, march], contact }, NO_LATENCY);
    expect(rejected).toMatchObject({ ok: false, conflicts: [{ id: 'after-cutoff', status: 'departed' }] });
    expect(rejected.order).toBeUndefined();
    const accepted = await submitCheckout({ items: [lastDay], contact }, NO_LATENCY);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.items[0]).toMatchObject({ date: '2027-02-28', time });
  });

  it('quotes items with seat-aware statuses and prices only available ones', async () => {
    const open = findOpenDeparture('safari-blue', 2);
    const items = [
      { id: 'a', experienceId: 'safari-blue', mode: 'shared', guests: 2, date: open.date, time: open.time },
      { id: 'b', experienceId: 'safari-blue', mode: 'shared', guests: 2, date: todayInStoreTz(), time: open.time },
      { id: 'c', experienceId: 'unknown', mode: 'shared', guests: 2, date: open.date, time: open.time },
    ];
    const { quotes, subtotalUsd } = await quoteCartItems(items, NO_LATENCY);
    expect(quotes.find((quote) => quote.id === 'a').status).toBe('available');
    expect(quotes.find((quote) => quote.id === 'b').status).toBe('departed');
    expect(quotes.find((quote) => quote.id === 'c').status).toBe('unknown_experience');
    expect(subtotalUsd).toBe(190);
  });

  it('checks out a valid cart into one order with one booking per trip', async () => {
    const first = findOpenDeparture('safari-blue', 2);
    const second = findOpenDeparture('stone-town', 3);
    const items = [
      { id: 'a', experienceId: 'safari-blue', mode: 'shared', guests: 2, date: first.date, time: first.time },
      { id: 'b', experienceId: 'stone-town', mode: 'private', guests: 3, date: second.date, time: second.time },
    ];
    const result = await submitCheckout({ items, contact: { name: 'Test Guest', email: 't@example.com' } }, NO_LATENCY);
    expect(result.ok).toBe(true);
    expect(result.order.reference).toMatch(/^DP-\d{4}-\d{4}$/);
    expect(result.order.items).toHaveLength(2);
    expect(result.order.totalUsd).toBe(190 + (55 * 3 + 70));
    expect(result.order).toMatchObject({ paymentPlan: 'deposit_20', paymentStatus: 'deposit_paid', chargeUsd: 85, balanceUsd: 340 });
    const codes = result.order.items.map((item) => item.bookingCode);
    expect(new Set(codes).size).toBe(2);
    expect(codes[0]).toMatch(/^SB-\d{4}$/);
    expect(codes[1]).toMatch(/^ST-\d{4}$/);
  });

  it('rejects the whole checkout on any conflict and names the offending item', async () => {
    const open = findOpenDeparture('spice-tour', 1);
    const items = [
      { id: 'ok', experienceId: 'spice-tour', mode: 'shared', guests: 1, date: open.date, time: open.time },
      { id: 'bad', experienceId: 'spice-tour', mode: 'shared', guests: 1, date: todayInStoreTz(), time: open.time },
    ];
    const result = await submitCheckout({ items, contact: { name: 'T', email: 't@example.com' } }, NO_LATENCY);
    expect(result.ok).toBe(false);
    expect(result.conflicts).toEqual([{ id: 'bad', status: 'departed' }]);
  });

  it('rejects an empty cart', async () => {
    const result = await submitCheckout({ items: [], contact: { name: 'T' } }, NO_LATENCY);
    expect(result.ok).toBe(false);
  });
});
