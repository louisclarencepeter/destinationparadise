// Approved group totals and pickup charges are supplied by the store catalog.
// Missing configuration is a quote request, never an editorial-price fallback.
export const MAX_INSTANT_GUESTS = 6;
export const MAX_ACCOMMODATION_LENGTH = 200;
export const PICKUP_ZONES = ['stone-town', 'north', 'east', 'south', 'other'];

export function hasPickupDetails(item) {
  return PICKUP_ZONES.includes(item?.pickupZone) &&
    typeof item?.accommodation === 'string' &&
    item.accommodation.trim().length > 0 &&
    item.accommodation.length <= MAX_ACCOMMODATION_LENGTH;
}

export function pickupFields(item) {
  return {
    ...(item.pickupZone !== undefined ? { pickupZone: item.pickupZone } : {}),
    ...(item.accommodation !== undefined ? { accommodation: item.accommodation.trim() } : {}),
  };
}

export function calculateGroupPickupPrice(pricing, mode, guests, pickupZone) {
  const unavailable = (reason) => ({
    lines: [], totalUsd: null, currency: 'USD',
    effectivePerPersonUsd: null, quoteRequired: true, reason,
  });
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_INSTANT_GUESTS) {
    return unavailable('group_too_large');
  }
  if (!PICKUP_ZONES.includes(pickupZone)) return unavailable('pickup_required');
  if (pickupZone === 'other') return unavailable('quote_required');
  const option = pricing?.options?.[mode];
  if (!option) return unavailable('pricing_unavailable');
  const groupMinor = option.groupPrices?.[String(guests)];
  const pickupMinor = option.pickupPrices?.[pickupZone];
  if (!Number.isSafeInteger(groupMinor) || groupMinor < 0 ||
      !Number.isSafeInteger(pickupMinor) || pickupMinor < 0 ||
      !Number.isSafeInteger(groupMinor + pickupMinor) || groupMinor + pickupMinor <= 0) {
    return unavailable('quote_required');
  }
  const totalUsd = (groupMinor + pickupMinor) / 100;
  return {
    lines: [
      { type: 'group_price', guests, amountUsd: groupMinor / 100 },
      { type: 'pickup_supplement', zoneCode: pickupZone, amountUsd: pickupMinor / 100 },
    ],
    totalUsd, currency: 'USD', effectivePerPersonUsd: totalUsd / guests,
    quoteRequired: false, reason: null,
  };
}

// Duplicate selections need staff review: combining their group tiers or
// pickup charges would otherwise assume how many parties/cars are needed.
// Independent departures remain separate trips.
export function quoteOnlyDepartureItems(items) {
  const groups = new Map();
  for (const item of items.filter((entry) => entry.mode !== 'request')) {
    const key = `${item.experienceId}|${item.date}|${item.time}`;
    const group = groups.get(key) || { guests: 0, ids: [] };
    group.guests += item.guests;
    group.ids.push(item.id);
    groups.set(key, group);
  }
  return new Set([...groups.values()].filter((group) => group.guests > MAX_INSTANT_GUESTS || group.ids.length > 1).flatMap((group) => group.ids));
}

export function selectionReviewStatus(item, oversized = new Set()) {
  if (item.mode === 'request') return null;
  if (item.guests > MAX_INSTANT_GUESTS || oversized.has(item.id) || item.pickupZone === 'other') return 'quote_required';
  if (!hasPickupDetails(item)) return 'pickup_required';
  return null;
}
