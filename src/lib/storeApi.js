// Store API client (HANDOFF.md Phase 1 + 2).
//
// Two modes behind ONE set of signatures, so components never know which is
// active:
//   - fixtures (default): deterministic in-browser stand-ins, no network.
//   - live (VITE_STORE_API=live): the Netlify functions backed by Supabase —
//     /api/store/availability, /quote, /checkout, /orders/:reference. Prices
//     come back as integer minor units and are converted to USD numbers at
//     this boundary only.
//
// In both modes the server-shaped rules hold: re-price on every call,
// re-check at checkout, never trust anything persisted in the browser.
import { getCartExperience, getInstantExperience } from '../data/commerceCatalog.js';
import { calculateGroupPickupPrice, pickupFields } from './storePricing.js';

export const BOOKING_END_DATE = '2027-02-28';
export const ORDER_SESSION_KEY = 'dp_store_last_order_v1';
export const ORDER_CREDENTIALS_KEY = 'dp_store_order_credentials_v1';
const IDEMPOTENCY_KEY = 'dp_store_checkout_idem_v1';

const DEFAULT_LATENCY_MS = 300;
const CHECKOUT_LATENCY_MS = 1400;

const LIVE = import.meta.env.VITE_STORE_API === 'live';

export function isLiveStoreApi() {
  return LIVE;
}

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

// ---------------------------------------------------------------------------
// Fixture engine (deterministic; also documents the expected data shapes)
// ---------------------------------------------------------------------------

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
// for the per-option booking cutoff) through the final published booking date.
export function isDateInBookingWindow(dateIso, today = todayInStoreTz()) {
  return dateIso > today && dateIso <= BOOKING_END_DATE;
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

// Server-owned pricing rule for one selection. Amounts are USD numbers here;
// the live backend stores integer minor units and converts at this boundary.
export function priceSelection(experience, mode, guests, pickupZone) {
  if (Object.hasOwn(experience, 'groupPickupPricing')) {
    return calculateGroupPickupPrice(experience.groupPickupPricing, mode, guests, pickupZone);
  }
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

function bookingCodeFor(experience, item) {
  const seed = hashStr(`${item.experienceId}|${item.date}|${item.time}|${item.guests}|${item.mode}`);
  return `${experience.code}-${1000 + (seed % 9000)}`;
}

function orderReference(now = new Date()) {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `DP-${now.getFullYear()}-${digits}`;
}

// ---------------------------------------------------------------------------
// Live-mode HTTP helpers
// ---------------------------------------------------------------------------

/**
 * @param {string} path
 * @param {{ method?: string, body?: object, headers?: Record<string, string> }} [options]
 */
async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(path, {
      method,
      headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    return { status: response.status, data };
  } catch {
    return { status: 0, data: { ok: false, error: 'network_unavailable' } };
  } finally {
    clearTimeout(timeout);
  }
}

const HOSTED_PAYMENT_HOSTS = {
  pesapal: ['pay.pesapal.com', 'cybqa.pesapal.com'],
  dpo: ['secure.3gdirectpay.com'],
};

// A provider response must never turn checkout into an arbitrary redirect.
export function isSafePaymentUrl(value, provider) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      Boolean(HOSTED_PAYMENT_HOSTS[provider]?.includes(url.hostname));
  } catch {
    return false;
  }
}

// Keep hosted payment details in the caller's transient navigation state.
// redirect remains available to existing callers and the historical DPO flow.
function hostedPaymentHandoff(payment, reference, fallbackProvider) {
  const provider = payment?.provider || fallbackProvider;
  if (!payment?.ok || !isSafePaymentUrl(payment.paymentUrl, provider) ||
      (payment.reference != null && payment.reference !== reference)) return null;
  return {
    ok: true, provider, paymentUrl: payment.paymentUrl,
    reference, redirect: payment.paymentUrl,
  };
}

const toLiveItem = (item) => (item.mode === 'request'
  ? {
      id: item.id,
      sourceKey: item.experienceId,
      optionCode: 'request',
      guests: item.guests,
      requestedDates: item.requestedDates || '',
      ...pickupFields(item),
    }
  : {
      id: item.id,
      sourceKey: item.experienceId,
      optionCode: item.mode,
      guests: item.guests,
      date: item.date,
      time: item.time,
      ...pickupFields(item),
    });

export const isRequestItem = (item) => item?.mode === 'request';

const minorToUsd = (minor) => Number(minor || 0) / 100;

export function depositBreakdown(totalUsd) {
  const totalMinor = Math.round(totalUsd * 100);
  const chargeMinor = Math.ceil(totalMinor / 5);
  return {
    paymentPlan: 'deposit_20',
    depositPercent: 20,
    chargeUsd: minorToUsd(chargeMinor),
    balanceUsd: minorToUsd(totalMinor - chargeMinor),
  };
}

function serverPaymentBreakdown(order) {
  const totalMinor = Number(order.totalMinor || 0);
  const chargeMinor = Number(order.chargeMinor ?? order.depositMinor ?? totalMinor);
  return {
    paymentPlan: order.paymentPlan || 'full',
    depositPercent: Number(order.depositPercent ?? 100),
    chargeUsd: minorToUsd(chargeMinor),
    balanceUsd: minorToUsd(order.balanceMinor ?? Math.max(0, totalMinor - chargeMinor)),
    paymentStatus: order.paymentStatus || (order.status === 'paid' ? 'paid' : null),
  };
}

// One idempotency key per cart payload: a retry of the same cart replays the
// same order; any change to the cart mints a new key.
function idempotencyKeyFor(items) {
  const signature = hashStr(JSON.stringify(items.map(toLiveItem))).toString(36);
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(IDEMPOTENCY_KEY) || 'null');
    if (stored && stored.signature === signature) return stored.key;
    const key = `web-${signature}-${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
    window.sessionStorage.setItem(IDEMPOTENCY_KEY, JSON.stringify({ signature, key }));
    return key;
  } catch {
    return `web-${signature}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

// Exported so the confirmation page can clear it once payment is confirmed —
// until then, a retry of the same cart must replay the same order.
export function clearIdempotencyKey() {
  try {
    window.sessionStorage.removeItem(IDEMPOTENCY_KEY);
  } catch {
    // best effort
  }
}

// Maps a server order (minor units, sourceKey) to the client shape the
// confirmation UI renders (USD numbers, catalog images).
function mapServerOrder(serverOrder) {
  const items = (serverOrder.items || []).map((item) => ({
    bookingCode: item.bookingCode || null,
    experienceId: item.sourceKey,
    title: item.title,
    image: getCartExperience(item.sourceKey)?.image || null,
    kind: item.kind || 'instant',
    date: item.date,
    time: item.time,
    requestedDates: item.requestedDates || null,
    staffNote: item.staffNote || null,
    mode: item.optionCode,
    guests: item.guests,
    pickup: item.pickup,
    priceLines: (item.priceLines || []).map((line) => ({ ...line, amountUsd: minorToUsd(line.amountMinor) })),
    totalUsd: item.totalMinor != null ? minorToUsd(item.totalMinor) : null,
  }));
  return {
    reference: serverOrder.reference,
    // Fixture orders have no status and are treated as paid by the UI.
    status: serverOrder.status || 'paid',
    createdAt: serverOrder.createdAt || new Date().toISOString(),
    totalUsd: minorToUsd(serverOrder.totalMinor),
    ...serverPaymentBreakdown(serverOrder),
    currency: serverOrder.currency || 'USD',
    contact: { name: serverOrder.contactName || '' },
    quoteNote: serverOrder.quoteNote || null,
    quoteExpiresAt: serverOrder.quoteExpiresAt || null,
    items,
  };
}

// ---------------------------------------------------------------------------
// Public API — identical signatures in both modes
// ---------------------------------------------------------------------------

export async function fetchBookingPricing(experienceId) {
  // Fixture-mode editorial prices have never been approved as group/pickup
  // rates. They remain useful for legacy fixture tests, not this new checkout.
  if (!LIVE) return null;
  const { data } = await apiRequest('/api/store/catalog');
  if (!data?.ok) throw new Error(data?.error || 'catalog_unavailable');
  const experience = data.experiences?.find((entry) => entry.sourceKey === experienceId);
  const options = {};
  for (const option of experience?.options || []) {
    if (['shared', 'private'].includes(option.code) && option.pickupPricingRequired === true && option.currency === 'USD') {
      options[option.code] = { groupPrices: option.groupPrices || {}, pickupPrices: option.pickupPrices || {} };
    }
  }
  return Object.keys(options).length ? { required: true, instantMaxGuests: 6, options } : null;
}

// Availability for one calendar month. `month` is 1–12.
export async function fetchMonthAvailability(experienceId, year, month, { latencyMs = DEFAULT_LATENCY_MS } = {}) {
  if (LIVE) {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const { data } = await apiRequest(
      `/api/store/availability?experience=${encodeURIComponent(experienceId)}&from=${monthPrefix}-01&to=${monthPrefix}-${String(daysInMonth).padStart(2, '0')}`,
    );
    if (!data?.ok) throw new Error(data?.error || 'availability_unavailable');
    return { experienceId, year, month, timezone: data.timezone, days: data.days || {} };
  }

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

// Re-price and re-check a set of cart items (drawer open, checkout render).
// Request items are not quotable — they get a static 'request_pending' status
// and never count toward the payable subtotal.
export async function quoteCartItems(items, { latencyMs = DEFAULT_LATENCY_MS } = {}) {
  const requestQuotes = items
    .filter(isRequestItem)
    .map((item) => ({ id: item.id, status: 'request_pending', seats: 0, totalUsd: 0 }));
  const instantItems = items.filter((item) => !isRequestItem(item));

  if (LIVE) {
    if (instantItems.length === 0) {
      return { quotes: requestQuotes, subtotalUsd: 0, currency: 'USD', ...depositBreakdown(0) };
    }
    const { data } = await apiRequest('/api/store/quote', {
      method: 'POST',
      body: { items: instantItems.map(toLiveItem) },
    });
    if (!data?.ok) throw new Error(data?.error || 'quote_unavailable');
    const quotes = (data.quotes || []).map((quote) => ({
      id: quote.id,
      status: quote.status,
      seats: quote.seats ?? 0,
      totalUsd: quote.price?.totalMinor != null ? minorToUsd(quote.price.totalMinor) : null,
      priceLines: (quote.price?.lines || []).map((line) => ({ ...line, amountUsd: minorToUsd(line.amountMinor) })),
      pickup: quote.pickup || null,
    }));
    return {
      quotes: [...quotes, ...requestQuotes],
      subtotalUsd: minorToUsd(data.subtotalMinor),
      currency: data.currency || 'USD',
      ...depositBreakdown(minorToUsd(data.subtotalMinor)),
    };
  }

  if (latencyMs > 0) await sleep(latencyMs);
  const today = todayInStoreTz();
  const quotes = instantItems.map((item) => evaluateItem(item, today));
  const subtotalUsd = quotes
    .filter((quote) => quote.status === 'available')
    .reduce((sum, quote) => sum + quote.totalUsd, 0);
  return { quotes: [...quotes, ...requestQuotes], subtotalUsd, currency: 'USD', ...depositBreakdown(subtotalUsd) };
}

// Simulated (fixtures) or real (live) checkout. Live mode creates the pending
// order + holds atomically server-side, then — while payments are in
// dev-simulation (pre-DPO) — finalizes through the dev-pay endpoint so the
// full journey runs against real inventory.
export async function submitCheckout({ items, contact, expectedTotalUsd, expectedChargeUsd }, { latencyMs = CHECKOUT_LATENCY_MS } = {}) {
  if (LIVE) {
    const { status, data } = await apiRequest('/api/store/checkout', {
      method: 'POST',
      body: {
        items: items.map(toLiveItem),
        contact: { name: contact?.name || '', email: contact?.email || '', phone: contact?.phone || '' },
        language: (document.documentElement.lang || 'en').slice(0, 2),
        idempotencyKey: idempotencyKeyFor(items),
      },
    });

    if (!data?.ok) {
      if (status === 409 || data?.error === 'availability_conflict') {
        return { ok: false, conflicts: data?.conflicts || [] };
      }
      return { ok: false, conflicts: [], error: data?.error || 'checkout_unavailable' };
    }

    saveOrderCredentials({ reference: data.reference, token: data.accessToken });

    // The order is re-priced under server locks. A price change must be shown
    // and reviewed before any payment page is created or money can be taken.
    if ((expectedTotalUsd != null && Math.round(expectedTotalUsd * 100) !== data.totalMinor) ||
        (expectedChargeUsd != null && Math.round(expectedChargeUsd * 100) !== (data.chargeMinor ?? data.depositMinor ?? data.totalMinor))) {
      return {
        ok: false,
        error: 'price_changed',
        quote: {
          quotes: (data.items || []).map((item) => ({
            id: item.id, status: 'available', seats: 0, totalUsd: minorToUsd(item.totalMinor),
            priceLines: (item.priceLines || []).map((line) => ({ ...line, amountUsd: minorToUsd(line.amountMinor) })),
            pickup: item.pickup || '',
          })),
          subtotalUsd: minorToUsd(data.totalMinor),
          currency: data.currency || 'USD',
          ...serverPaymentBreakdown(data),
        },
      };
    }

    if (['pesapal', 'dpo'].includes(data.payment?.mode)) {
      // Ask the server for a validated hosted-checkout handoff. The caller
      // chooses embedded Pesapal or the existing DPO redirect. The key survives so
      // an abandoned attempt replays the SAME order instead of double-holding.
      const pay = await apiRequest('/api/store/pay', {
        method: 'POST',
        body: { reference: data.reference, token: data.accessToken },
      });
      const handoff = hostedPaymentHandoff(pay.data, data.reference, data.payment.mode);
      if (!handoff) {
        // Definitive rejection permits a fresh checkout on the guest's next
        // attempt. Ambiguous submission/review must keep the original order.
        if (pay.data?.error === 'payment_create_failed' ||
            (pay.data?.error === 'order_not_payable' && ['payment_failed', 'expired', 'cancelled'].includes(pay.data?.status))) {
          clearIdempotencyKey();
        }
        return { ok: false, conflicts: [], error: pay.data?.error || 'payment_unavailable' };
      }
      return handoff;
    }

    if (data.payment?.mode !== 'dev_simulated') {
      // Order + holds exist, but nothing can take payment yet.
      return { ok: false, conflicts: [], error: 'payment_unavailable', reference: data.reference };
    }

    const devPay = await apiRequest('/api/store/dev-pay', {
      method: 'POST',
      body: { reference: data.reference, token: data.accessToken },
    });
    if (!devPay.data?.ok || !devPay.data?.order?.ok) {
      return { ok: false, conflicts: [], error: devPay.data?.error || 'finalize_unavailable' };
    }

    clearIdempotencyKey();
    return { ok: true, order: mapServerOrder(devPay.data.order) };
  }

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

  const totalUsd = orderItems.reduce((sum, item) => sum + item.totalUsd, 0);
  const order = {
    reference: orderReference(),
    status: 'paid',
    paymentStatus: 'deposit_paid',
    createdAt: new Date().toISOString(),
    totalUsd,
    ...depositBreakdown(totalUsd),
    currency: 'USD',
    contact: { name: contact?.name || '' },
    items: orderItems,
  };
  return { ok: true, order };
}

// Submit a request/mixed cart: an awaiting_availability order with no payment
// and no holds. Staff confirm via SQL; the guest accepts by email link.
export async function submitRequestCheckout({ items, contact }, { latencyMs = CHECKOUT_LATENCY_MS } = {}) {
  if (LIVE) {
    const { data } = await apiRequest('/api/store/request', {
      method: 'POST',
      body: {
        items: items.map(toLiveItem),
        contact: { name: contact?.name || '', email: contact?.email || '', phone: contact?.phone || '' },
        language: (document.documentElement.lang || 'en').slice(0, 2),
        idempotencyKey: idempotencyKeyFor(items),
      },
    });
    if (!data?.ok) {
      return { ok: false, error: data?.error || 'request_unavailable' };
    }
    saveOrderCredentials({ reference: data.reference, token: data.accessToken });
    clearIdempotencyKey();
    const order = {
      reference: data.reference,
      status: 'awaiting_availability',
      createdAt: new Date().toISOString(),
      totalUsd: 0,
      currency: 'USD',
      contact: { name: contact?.name || '' },
      items: items.map((item) => ({
        bookingCode: null,
        experienceId: item.experienceId,
        title: getCartExperience(item.experienceId)?.title || item.experienceId,
        image: getCartExperience(item.experienceId)?.image || null,
        kind: isRequestItem(item) ? 'request' : 'instant',
        date: item.date || null,
        time: item.time || null,
        requestedDates: item.requestedDates || null,
        mode: item.mode,
        guests: item.guests,
        pickup: getCartExperience(item.experienceId)?.pickup || null,
        totalUsd: null,
      })),
    };
    saveLastOrder(order);
    return { ok: true, order };
  }

  // Fixture mode: simulate the awaiting order locally (no staff flow exists).
  if (latencyMs > 0) await sleep(latencyMs);
  const order = {
    reference: orderReference(),
    status: 'awaiting_availability',
    createdAt: new Date().toISOString(),
    totalUsd: 0,
    currency: 'USD',
    contact: { name: contact?.name || '' },
    items: items.map((item) => ({
      bookingCode: null,
      experienceId: item.experienceId,
      title: getCartExperience(item.experienceId)?.title || item.experienceId,
      image: getCartExperience(item.experienceId)?.image || null,
      kind: isRequestItem(item) ? 'request' : 'instant',
      date: item.date || null,
      time: item.time || null,
      requestedDates: item.requestedDates || null,
      mode: item.mode,
      guests: item.guests,
      pickup: getCartExperience(item.experienceId)?.pickup || null,
      totalUsd: null,
    })),
  };
  return { ok: true, order };
}

// Guest accepts a staff quote (live only — the quoted state can't arise in
// fixtures). Returns the same transient hosted payment handoff as checkout
// so the order page can embed Pesapal or preserve DPO redirect behavior.
/** @param {string} reference
 * @param {{expectedTotalUsd?: number, expectedChargeUsd?: number}} [expected]
 */
export async function acceptQuote(reference, { expectedTotalUsd, expectedChargeUsd } = {}) {
  if (!LIVE) return { ok: false, error: 'accept_unavailable' };
  const credentials = readOrderCredentials(reference);
  if (!credentials) return { ok: false, error: 'not_found' };

  const { status, data } = await apiRequest('/api/store/accept', {
    method: 'POST',
    body: { reference, token: credentials.token },
  });
  if (!data?.ok) {
    if (status === 409 || data?.error === 'availability_conflict') {
      return { ok: false, error: 'availability_conflict', conflicts: data?.conflicts || [] };
    }
    return { ok: false, error: data?.error || 'accept_unavailable' };
  }

  if ((expectedTotalUsd != null && Math.round(expectedTotalUsd * 100) !== data.totalMinor) ||
      (expectedChargeUsd != null && Math.round(expectedChargeUsd * 100) !== (data.chargeMinor ?? data.depositMinor ?? data.totalMinor))) {
    // Acceptance has already secured holds; refresh the immutable accepted
    // order so the guest can explicitly review and resume the same payment.
    const order = await fetchStoredOrder(reference);
    return { ok: false, error: 'price_changed', order: order || undefined };
  }

  if (['pesapal', 'dpo'].includes(data.payment?.mode)) {
    const pay = await apiRequest('/api/store/pay', {
      method: 'POST',
      body: { reference, token: credentials.token },
    });
    const handoff = hostedPaymentHandoff(pay.data, reference, data.payment.mode);
    if (!handoff) {
      return { ok: false, error: pay.data?.error || 'payment_unavailable' };
    }
    return handoff;
  }

  if (data.payment?.mode === 'dev_simulated') {
    const devPay = await apiRequest('/api/store/dev-pay', {
      method: 'POST',
      body: { reference, token: credentials.token },
    });
    if (!devPay.data?.ok || !devPay.data?.order?.ok) {
      return { ok: false, error: devPay.data?.error || 'finalize_unavailable' };
    }
    const order = mapServerOrder(devPay.data.order);
    saveLastOrder(order);
    return { ok: true, order };
  }

  // Accepted with holds in place, but no payment rail yet (pre-DPO): the team
  // sends the payment link manually once DPO activates.
  const refreshed = await fetchStoredOrder(reference);
  return { ok: true, order: refreshed || undefined, paymentPending: true };
}

// ---------------------------------------------------------------------------
// Confirmation-page persistence
// ---------------------------------------------------------------------------

// The confirmation page reads the order back by reference. Session-scoped and
// browser-local; in live mode a refresh can also re-fetch from the server
// using the per-order credentials below.
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

function saveOrderCredentials(credentials) {
  try {
    window.sessionStorage.setItem(ORDER_CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch {
    // best effort
  }
}

function readOrderCredentials(reference) {
  try {
    const raw = window.sessionStorage.getItem(ORDER_CREDENTIALS_KEY);
    if (!raw) return null;
    const credentials = JSON.parse(raw);
    if (!credentials || credentials.reference !== reference || !credentials.token) return null;
    return credentials;
  } catch {
    return null;
  }
}

// Email links carry `?t=<token>`; the order page adopts it into the session
// (and then strips it from the URL) so refreshes and accepts keep working.
export function adoptOrderCredentials(reference, token) {
  if (!/^[a-f0-9]{48}$/.test(String(token || ''))) return false;
  saveOrderCredentials({ reference, token });
  return true;
}

// Live-mode refresh path for the confirmation page: re-reads the order from
// the server with the per-order token (no-store on the wire, sha256 at rest).
export async function fetchStoredOrder(reference) {
  if (!LIVE) return null;
  const credentials = readOrderCredentials(reference);
  if (!credentials) return null;
  const { data } = await apiRequest(`/api/store/orders/${encodeURIComponent(reference)}`, {
    headers: { authorization: `Bearer ${credentials.token}` },
  });
  if (!data?.ok) return null;
  const order = mapServerOrder(data);
  saveLastOrder(order);
  return order;
}

// Resume an existing held order directly, including historical full/DPO
// orders. Never create another order or assume a cached amount is current.
/** @param {string} reference
 * @param {{expectedTotalUsd?: number, expectedChargeUsd?: number}} [expected]
 */
export async function continueOrderPayment(reference, { expectedTotalUsd, expectedChargeUsd } = {}) {
  if (!LIVE) return { ok: false, error: 'payment_unavailable' };
  const credentials = readOrderCredentials(reference);
  if (!credentials) return { ok: false, error: 'not_found' };
  const order = await fetchStoredOrder(reference);
  if (!order) return { ok: false, error: 'payment_unavailable' };
  if (order.status === 'paid') return { ok: true, order };
  if (order.status !== 'pending_payment') return { ok: false, error: 'order_not_payable', order };
  if ((expectedTotalUsd != null && Math.round(expectedTotalUsd * 100) !== Math.round(order.totalUsd * 100)) ||
      (expectedChargeUsd != null && Math.round(expectedChargeUsd * 100) !== Math.round(order.chargeUsd * 100))) {
    return { ok: false, error: 'price_changed', order };
  }
  const pay = await apiRequest('/api/store/pay', {
    method: 'POST', body: { reference, token: credentials.token },
  });
  const handoff = hostedPaymentHandoff(pay.data, reference);
  if (!handoff) {
    return { ok: false, error: pay.data?.error || 'payment_unavailable' };
  }
  return handoff;
}
