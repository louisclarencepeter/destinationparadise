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

// Store publication model (one record per public experience). Each listing
// carries its own publication state, status and booking mode, so the grid,
// the filters and the store API all read the same rules:
//   published: false               never shown in the public catalogue
//   status 'available' + 'instant' Available filter, date picker + basket
//   status 'coming_soon'           Coming Soon filter, details only — no
//                                  dates, basket or payment
//   bookingMode 'request'          On Request filter, enquiry only, no payment
//   status 'temporarily_unavailable' shown with a notice, never bookable
// Only the pilot allowlist above is instant. Every other listing is an
// experience that already exists elsewhere on the site.
export const STORE_STATUSES = ['available', 'coming_soon', 'on_request', 'temporarily_unavailable'];

// Fully written excursions that are the next candidates for online booking.
// They keep their detail pages and enquiry links, but never enter the cart.
const COMING_SOON_IDS = [
  'jozani', 'dolphins', 'sunset-rock', 'snorkeling-tour', 'village-tour', 'mnemba',
  'fishing-kizimkazi', 'local-fishing', 'mangrove', 'sandbank-picnic', 'cave', 'north-nungwi',
];

// Consultative products that live outside the excursion catalogue.
const EXTRA_LISTINGS = [
  {
    id: 'northern-safari',
    title: 'Northern Tanzania Safari',
    category: 'safari',
    image: '/assets/images/safaris/zebra-herd-on-track.webp',
    alt: 'Zebra herd on a safari track',
    blurb: 'A mainland safari across the Serengeti and Ngorongoro — wildlife game drives, lodge nights and light-aircraft transfers.',
    durationTag: 'Multi-day',
    to: '/safaris',
  },
  {
    id: 'custom-journey',
    title: 'Custom Zanzibar Journey',
    category: 'custom',
    image: '/assets/images/home/aerial-boats-turquoise-water.webp',
    alt: 'Aerial view of boats on turquoise water',
    blurb: 'Tell us the shape of your days and we will stitch dhows, spice gardens, beaches and Stone Town into one private itinerary.',
    durationTag: 'Tailor-made',
    to: '/trip-planner',
  },
];

const enquiryLink = (id) => `/book-now?type=excursion&item=${encodeURIComponent(id)}#booking-contact`;

function listingRulesFor(id) {
  if (INSTANT_RULES.some((rules) => rules.id === id)) {
    return { status: 'available', bookingMode: 'instant', to: `/excursions/${id}#book` };
  }
  if (COMING_SOON_IDS.includes(id)) {
    return { status: 'coming_soon', bookingMode: 'none', to: `/excursions/${id}` };
  }
  return {
    status: 'on_request',
    bookingMode: 'request',
    to: enquiryLink(id),
  };
}

// Every listing the store knows about, in grid order. `excursions` lets the
// page pass localized editorial copy; ids and commercial fields never change.
export function getStoreListings(excursions = EXCURSIONS) {
  const fromExcursions = excursions.map((excursion) => ({
    id: excursion.id,
    sourceKey: excursion.id,
    category: excursion.category,
    published: true,
    currency: 'USD',
    depositPercent: 20,
    editorialPriceUsd: typeof excursion.price === 'number' ? excursion.price : null,
    ...listingRulesFor(excursion.id),
  }));
  const extras = EXTRA_LISTINGS.map((listing) => ({
    id: listing.id,
    sourceKey: listing.id,
    category: listing.category,
    published: true,
    currency: 'USD',
    depositPercent: 20,
    editorialPriceUsd: null,
    status: 'on_request',
    bookingMode: 'request',
    to: listing.to,
  }));
  const order = { available: 0, coming_soon: 1, on_request: 2, temporarily_unavailable: 3 };
  return [...fromExcursions, ...extras]
    .map((listing, index) => ({ listing, index }))
    .sort((a, b) => order[a.listing.status] - order[b.listing.status] || a.index - b.index)
    .map(({ listing }) => listing);
}

const listingById = (id) => getStoreListings().find((listing) => listing.id === id);

// Server-side gate (store API): only published, available, instant listings
// may be quoted, held or paid for.
export function isPaidCheckoutAllowed(id) {
  const listing = listingById(id);
  return Boolean(listing?.published && listing.status === 'available' && listing.bookingMode === 'instant');
}

// Request carts take enquiry-only products plus the instant pilots. Coming
// Soon, unavailable and unpublished listings can never be submitted.
export function isStoreRequestAllowed(id) {
  const listing = listingById(id);
  if (!listing?.published) return false;
  return isPaidCheckoutAllowed(id) || (listing.status === 'on_request' && listing.bookingMode === 'request');
}

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

// Cards for the store grid, one per published listing. Prices only show
// where the site already publishes one; Coming Soon cards never show a price.
export function getStoreCards({ excursions = EXCURSIONS, operationalCopy = {} } = {}) {
  const localizedCopy = /** @type {any} */ (operationalCopy);
  return getStoreListings(excursions)
    .filter((listing) => listing.published)
    .map((listing) => {
      const translated = localizedCopy.requestCards?.[listing.id] || {};
      const excursion = excursionById(listing.id, excursions);
      const extra = EXTRA_LISTINGS.find((entry) => entry.id === listing.id);
      const bookable = listing.status === 'available';
      return {
        id: listing.id,
        status: listing.status,
        bookingMode: listing.bookingMode,
        category: listing.category,
        // Legacy kind used by older call sites: instant vs everything else.
        kind: bookable ? 'instant' : 'request',
        title: translated.title || excursion?.title || extra?.title || listing.id,
        image: excursion?.image || extra?.image,
        alt: translated.alt || excursion?.alt || extra?.alt || '',
        blurb: translated.blurb || excursion?.description || extra?.blurb || '',
        durationTag: translated.durationTag || excursion?.duration || extra?.durationTag || '',
        priceFromUsd: listing.status === 'coming_soon' ? null : listing.editorialPriceUsd,
        to: listing.to,
      };
    })
    .filter((card) => card.image);
}

// Dynamic filter counts for the store chips.
export function countStoreCards(cards) {
  const counts = { all: cards.length, available: 0, coming_soon: 0, on_request: 0 };
  for (const card of cards) {
    if (card.status in counts) counts[card.status] += 1;
  }
  return counts;
}
