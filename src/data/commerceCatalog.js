// Commerce catalog: a thin sellability layer over the editorial content
// (HANDOFF.md "Product and inventory model"). Editorial copy, images and USD
// display prices stay in excursionsData.js; this module only adds the
// commercial rules the store needs. In Phase 2 these records move to the
// database — keep ids stable.
//
// Pilot allowlist (instant booking): Safari Blue, Spice Tour, Historical City
// Tour (`stone-town`). Everything else stays on the request-availability flow.
// A numeric editorial price does NOT make a product instant-bookable.
import { EXCURSIONS } from './excursionsData.js';

export const STORE_TIMEZONE = 'Africa/Dar_es_Salaam';

const excursionById = (id, excursions = EXCURSIONS) => excursions.find((item) => item.id === id);

// Operational rules per pilot experience. Times are Zanzibar local wall times;
// capacity/cutoff values are placeholders until Phase 0 confirms them.
const INSTANT_RULES = [
  {
    id: 'safari-blue',
    code: 'SB',
    departureTimes: ['08:30', '09:30'],
    minGuests: 1,
    maxGuests: 8,
    privateSupplementUsd: 180,
    capacityPerDeparture: 20,
    bookingCutoffHours: 20,
    pickup: 'Hotel pickup from south-coast and Stone Town areas, 07:15–07:45.',
  },
  {
    id: 'spice-tour',
    code: 'SP',
    departureTimes: ['09:00', '14:00'],
    minGuests: 1,
    maxGuests: 10,
    privateSupplementUsd: 90,
    capacityPerDeparture: 16,
    bookingCutoffHours: 20,
    pickup: 'Hotel pickup from Stone Town and west-coast areas, 30 minutes before start.',
  },
  {
    id: 'stone-town',
    code: 'ST',
    departureTimes: ['09:30', '14:30', '16:30'],
    minGuests: 1,
    maxGuests: 8,
    privateSupplementUsd: 70,
    capacityPerDeparture: 12,
    bookingCutoffHours: 20,
    pickup: 'Meet at the Old Fort forecourt, or Stone Town hotel pickup on request.',
  },
];

// Request-only cards shown in the store grid beside the pilot products. They
// route to the existing enquiry flows and never enter the instant-payment cart.
const REQUEST_CARDS = [
  {
    id: 'prison-island',
    sourceKey: 'prison-island',
    // Has its own request panel (Phase 5) — deep-link straight to it.
    to: '/excursions/prison-island#book',
  },
  {
    id: 'northern-safari',
    title: 'Northern Tanzania Safari',
    image: '/assets/images/safaris/zebra-herd-on-track.webp',
    alt: 'Zebra herd on a safari track',
    blurb: 'A mainland safari across the Serengeti and Ngorongoro — wildlife game drives, lodge nights and light-aircraft transfers.',
    durationTag: 'Multi-day',
    priceFromUsd: 340,
    to: '/safaris',
  },
  {
    id: 'custom-journey',
    title: 'Custom Zanzibar Journey',
    image: '/assets/images/home/aerial-boats-turquoise-water.webp',
    alt: 'Aerial view of boats on turquoise water',
    blurb: 'Tell us the shape of your days and we will stitch dhows, spice gardens, beaches and Stone Town into one private itinerary.',
    durationTag: 'Tailor-made',
    priceFromUsd: null,
    to: '/trip-planner',
  },
];

function instantExperienceFor(rules, excursions = EXCURSIONS, operationalCopy = {}) {
  const excursion = excursionById(rules.id, excursions);
  if (!excursion || typeof excursion.price !== 'number') return null;
  return {
    ...rules,
    pickup: operationalCopy.pickups?.[rules.id] || rules.pickup,
    sourceKey: excursion.id,
    title: excursion.title,
    image: excursion.image,
    alt: excursion.alt || excursion.title,
    blurb: excursion.description,
    durationTag: excursion.duration,
    priceUsd: excursion.price,
    bookingMode: 'instant',
    timezone: STORE_TIMEZONE,
  };
}

export const INSTANT_EXPERIENCE_IDS = INSTANT_RULES.map((rules) => rules.id);

export function getInstantExperience(id, excursions = EXCURSIONS, operationalCopy = {}) {
  const rules = INSTANT_RULES.find((entry) => entry.id === id);
  return rules ? instantExperienceFor(rules, excursions, operationalCopy) : null;
}

export function isInstantBookable(id) {
  return INSTANT_EXPERIENCE_IDS.includes(id);
}

// Request-to-book products that can join the multi-trip cart (Phase 5). Only
// products with their own detail page get an on-page request panel; the
// consultative ones (safari, custom journey) stay on their existing flows.
const REQUEST_RULES = [
  { id: 'prison-island', code: 'PI', maxGuests: 8, minGuests: 1 },
];

function requestExperienceFor(rules, excursions = EXCURSIONS, operationalCopy = {}) {
  const excursion = excursionById(rules.id, excursions);
  if (!excursion) return null;
  return {
    ...rules,
    pickup: operationalCopy.pickups?.[rules.id],
    sourceKey: excursion.id,
    title: excursion.title,
    image: excursion.image,
    alt: excursion.alt || excursion.title,
    blurb: excursion.description,
    durationTag: excursion.duration,
    indicativePriceUsd: typeof excursion.price === 'number' ? excursion.price : null,
    bookingMode: 'request',
    timezone: STORE_TIMEZONE,
  };
}

export function getRequestExperience(id, excursions = EXCURSIONS, operationalCopy = {}) {
  const rules = REQUEST_RULES.find((entry) => entry.id === id);
  return rules ? requestExperienceFor(rules, excursions, operationalCopy) : null;
}

// Any experience that can live in the cart (drawer/checkout rendering).
export function getCartExperience(id, excursions = EXCURSIONS, operationalCopy = {}) {
  return getInstantExperience(id, excursions, operationalCopy) || getRequestExperience(id, excursions, operationalCopy);
}

// Cards for the store grid: instant pilots first, then request-only products.
export function getStoreCards({ excursions = EXCURSIONS, operationalCopy = {} } = {}) {
  const localizedCopy = /** @type {any} */ (operationalCopy);
  const instant = INSTANT_RULES
    .map((rules) => instantExperienceFor(rules, excursions, operationalCopy))
    .filter(Boolean)
    .map((exp) => ({
    id: exp.id,
    kind: 'instant',
    title: exp.title,
    image: exp.image,
    alt: exp.alt,
    blurb: exp.blurb,
    durationTag: exp.durationTag,
    priceFromUsd: exp.priceUsd,
    to: `/excursions/${exp.sourceKey}#book`,
  }));

  const request = REQUEST_CARDS.map((card) => {
    const translated = localizedCopy.requestCards?.[card.id] || {};
    const excursion = card.sourceKey ? excursionById(card.sourceKey, excursions) : null;
    return {
      id: card.id,
      kind: 'request',
      title: translated.title || card.title || excursion?.title || card.id,
      image: card.image || excursion?.image,
      alt: translated.alt || card.alt || excursion?.alt || card.title || '',
      blurb: translated.blurb || card.blurb || excursion?.description || '',
      durationTag: translated.durationTag || card.durationTag || excursion?.duration || '',
      priceFromUsd: card.priceFromUsd ?? (typeof excursion?.price === 'number' ? excursion.price : null),
      to: card.to,
    };
  }).filter((card) => card.image);

  return [...instant, ...request];
}
