// Development store API (HANDOFF.md Phase 1).
//
// Fixture-backed stand-ins for the future Netlify function endpoints
// (`/api/store/availability`, `/api/store/quote`, `/api/store/checkout`).
// The call shapes mirror the planned server contract — async, re-priced on
// every call, availability re-checked at checkout — so swapping in real
// endpoints in Phase 2/3 changes this module only, not the components.
//
// Availability is deterministic (seeded by experience/date/time) so the UI is
// stable across reloads, relative to "today" in Zanzibar so the fixtures never
// go stale. No real inventory, no charges.
import { getInstantExperience } from '../data/commerceCatalog.js';

export const BOOKING_WINDOW_DAYS = 60;
export const ORDER_SESSION_KEY = 'dp_store_last_order_v1';

const DEFAULT_LATENCY_MS = 300;
const CHECKOUT_LATENCY_MS = 1400;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hashStr(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

// 'YYYY-MM-DD' for the current day in Zanzibar, regardless of browser zone.
export function todayInStoreTz(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Dar_es_Salaam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addDaysIso(dateIso, days) {
  const [year, month, day] = dateIso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

// Deterministic seats remaining for one departure. Distribution mirrors the
// design prototype: ~15% sold out, a few low-seat days, the rest comfortable.
export function seatsLeft(experienceId, dateIso, time) {
  const key = hashStr(`${experienceId}|${dateIso}|${time}`) % 13;
  if (key <= 1) return 0;
  if (key === 2) return 1;
  if (key === 3) return 2;
  return 3 + (key % 6);
}

// Fixture booking rule: departures are bookable from tomorrow (a coarse stand-in
// for the per-option booking cutoff) through the rolling booking window.
export function isDateInBookingWindow(dateIso, today = todayInStoreTz()) {
  return dateIso > today && dateIso <= addDaysIso(today, BOOKING_WINDOW_DAYS);
}

function dayAvailability(experience, dateIso, today) {
  if (!isDateInBookingWindow(dateIso, today)) {
    return { date: dateIso, bookable: false, times: [] };
  }
  const times = experience.departureTimes.map((time) => ({
    time,
    seats: seatsLeft(experience.id, dateIso, time),
  }));
  return { date: dateIso, bookable: times.some((slot) => slot.seats > 0), times };
}

// Availability for one calendar month. `month` is 1–12.
export async function fetchMonthAvailability(experienceId, year, month, { latencyMs = DEFAULT_LATENCY_MS } = {}) {
  const experience = getInstantExperience(experienceId);
  if (latencyMs > 0) await sleep(latencyMs);
  if (!experience) throw new Error(`Unknown store experience: ${experienceId}`);

  const today = todayInStoreTz();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = {};
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateIso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days[dateIso] = dayAvailability(experience, dateIso, today);
  }
  return { experienceId, year, month, timezone: experience.timezone, days };
}

// Server-owned pricing rule for one selection. Amounts are USD numbers here;
// the real implementation stores integer minor units per HANDOFF.md.
export function priceSelection(experience, mode, guests) {
  /** @type {{ type: string, amountUsd: number, unitUsd?: number, quantity?: number }[]} */
  const lines = [
    {
      type: 'per_person',
      unitUsd: experience.priceUsd,
      quantity: guests,
      amountUsd: experience.priceUsd * guests,
    },
  ];
  if (mode === 'private' && experience.privateSupplementUsd) {
    lines.push({ type: 'private_supplement', amountUsd: experience.privateSupplementUsd });
  }
  const totalUsd = lines.reduce((sum, line) => sum + line.amountUsd, 0);
  return { lines, totalUsd, currency: 'USD' };
}

function evaluateItem(item, today) {
  const experience = getInstantExperience(item.experienceId);
  if (!experience) return { id: item.id, status: 'unknown_experience', seats: 0, totalUsd: 0 };
  if (!experience.departureTimes.includes(item.time) || !isDateInBookingWindow(item.date, today)) {
    return { id: item.id, status: 'departed', seats: 0, totalUsd: 0 };
  }
  const seats = seatsLeft(item.experienceId, item.date, item.time);
  const { totalUsd } = priceSelection(experience, item.mode, item.guests);
  let status = 'available';
  if (seats === 0) status = 'sold_out';
  else if (seats < item.guests) status = 'insufficient_seats';
  return { id: item.id, status, seats, totalUsd };
}

// Re-price and re-check a set of cart items (drawer open, checkout render).
export async function quoteCartItems(items, { latencyMs = DEFAULT_LATENCY_MS } = {}) {
  if (latencyMs > 0) await sleep(latencyMs);
  const today = todayInStoreTz();
  const quotes = items.map((item) => evaluateItem(item, today));
  const subtotalUsd = quotes
    .filter((quote) => quote.status === 'available')
    .reduce((sum, quote) => sum + quote.totalUsd, 0);
  return { quotes, subtotalUsd, currency: 'USD' };
}

function bookingCodeFor(experience, item) {
  const seed = hashStr(`${item.experienceId}|${item.date}|${item.time}|${item.guests}|${item.mode}`);
  return `${experience.code}-${1000 + (seed % 9000)}`;
}

function orderReference(now = new Date()) {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `DP-${now.getFullYear()}-${digits}`;
}

// Simulated checkout: atomically re-checks every item (all-or-nothing, like the
// future single Postgres transaction), then "pays" and mints one booking per
// item. Conflicts identify the exact offending items — never silently dropped.
export async function submitCheckout({ items, contact }, { latencyMs = CHECKOUT_LATENCY_MS } = {}) {
  if (latencyMs > 0) await sleep(latencyMs);
  const today = todayInStoreTz();
  const evaluated = items.map((item) => evaluateItem(item, today));
  const conflicts = evaluated.filter((quote) => quote.status !== 'available');
  if (items.length === 0 || conflicts.length > 0) {
    return { ok: false, conflicts: conflicts.map((quote) => ({ id: quote.id, status: quote.status })) };
  }

  const orderItems = items.map((item) => {
    const experience = getInstantExperience(item.experienceId);
    const { totalUsd } = priceSelection(experience, item.mode, item.guests);
    return {
      bookingCode: bookingCodeFor(experience, item),
      experienceId: item.experienceId,
      title: experience.title,
      image: experience.image,
      date: item.date,
      time: item.time,
      mode: item.mode,
      guests: item.guests,
      pickup: experience.pickup,
      totalUsd,
    };
  });

  const order = {
    reference: orderReference(),
    createdAt: new Date().toISOString(),
    totalUsd: orderItems.reduce((sum, item) => sum + item.totalUsd, 0),
    currency: 'USD',
    contact: { name: contact?.name || '' },
    items: orderItems,
  };
  return { ok: true, order };
}

// The confirmation page reads the order back by reference. Session-scoped and
// browser-local for Phase 1; replaced by `GET /api/store/orders/:reference` later.
export function saveLastOrder(order) {
  try {
    window.sessionStorage.setItem(ORDER_SESSION_KEY, JSON.stringify(order));
  } catch {
    // best effort — the confirmation page has a fallback state
  }
}

export function readLastOrder(reference) {
  try {
    const raw = window.sessionStorage.getItem(ORDER_SESSION_KEY);
    if (!raw) return null;
    const order = JSON.parse(raw);
    if (!order || (reference && order.reference !== reference)) return null;
    return order;
  } catch {
    return null;
  }
}
