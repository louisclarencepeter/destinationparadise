import { describe, expect, it } from 'vitest';
import {
  getInstantExperience,
  getStoreCards,
  INSTANT_EXPERIENCE_IDS,
  isInstantBookable,
} from '../../src/data/commerceCatalog.js';
import {
  addDaysIso,
  fetchMonthAvailability,
  isDateInBookingWindow,
  priceSelection,
  quoteCartItems,
  seatsLeft,
  submitCheckout,
  todayInStoreTz,
} from '../../src/lib/storeApi.js';

const NO_LATENCY = { latencyMs: 0 };

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

  it('only offers dates strictly after today and inside the window', () => {
    const today = todayInStoreTz();
    expect(isDateInBookingWindow(today)).toBe(false);
    expect(isDateInBookingWindow(addDaysIso(today, 1))).toBe(true);
    expect(isDateInBookingWindow(addDaysIso(today, 61))).toBe(false);
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
