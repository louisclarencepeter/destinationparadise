// Per-product structured data (schema.org) for the detail pages.
//
// Each bookable detail page (excursion, excursion combination, safari route,
// safari style, package) emits a TouristTrip describing the trip, with a nested
// Offer when a concrete starting price is known. Prices are the authored USD
// figures from the data layer (not the locale-converted display value), so the
// markup is stable regardless of the visitor's currency.
import { SITE_URL, SITE_NAME, clampDescription } from '../hooks/usePageMeta.js';

const PROVIDER = { '@type': 'TravelAgency', name: SITE_NAME, url: `${SITE_URL}/` };

function absolute(path) {
  if (!path) return undefined;
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path}`;
}

/**
 * Build a TouristTrip JSON-LD object (with an Offer when priced).
 *
 * @param {object} input
 * @param {string} input.name
 * @param {string} [input.description]
 * @param {string} input.path - site-relative canonical path, e.g. "/excursions/spice-tour"
 * @param {string} [input.image] - site-relative or absolute image URL
 * @param {number} [input.price] - starting price in USD; omit/0 to skip the Offer
 * @param {string} [input.priceCurrency]
 * @returns {Record<string, unknown>}
 */
export function touristTripJsonLd({ name, description, path, image, price, priceCurrency = 'USD' }) {
  const url = absolute(path);
  /** @type {Record<string, unknown>} */
  const trip = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name,
    url,
    provider: PROVIDER,
  };

  const desc = clampDescription(description, 300);
  if (desc) trip.description = desc;

  const img = absolute(image);
  if (img) trip.image = img;

  if (typeof price === 'number' && price > 0) {
    trip.offers = {
      '@type': 'Offer',
      price: String(price),
      priceCurrency,
      availability: 'https://schema.org/InStock',
      url,
    };
  }

  return trip;
}

export default touristTripJsonLd;
