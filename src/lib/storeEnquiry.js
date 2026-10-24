import { MAX_ACCOMMODATION_LENGTH, PICKUP_ZONES } from './storePricing.js';

/** @typedef {{ type: string, value: string, label: string, raw?: unknown }} BookingProduct */
/** @typedef {{ experienceId: string, mode: 'shared' | 'private' | 'request', guests: number, pickupZone: string, accommodation: string, preferredDate: string, preferredTime: string, product: BookingProduct }} StoreEnquiryItem */
/** @typedef {{ items: StoreEnquiryItem[], contact: { name?: string, email?: string, phone?: string } }} StoreEnquiry */

/** @param {unknown} value @returns {Record<string, unknown> | null} */
const record = (value) => value && typeof value === 'object' && !Array.isArray(value)
  ? /** @type {Record<string, unknown>} */ (value) : null;

/** @param {unknown} value @param {number} max */
const boundedText = (value, max) => {
  if (value === undefined) return '';
  if (typeof value !== 'string' || value.length > max ||
      [...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return null;
  return value.trim();
};

/** @param {string} value */
export function isStoreEnquiryDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Router state is only a convenience prefill. Resolve titles and products from
 * the booking catalog, and never accept a client price or silently clamp guests.
 * @param {unknown} raw
 * @param {BookingProduct[]} products
 * @returns {StoreEnquiry | null}
 */
export function parseStoreEnquiry(raw, products) {
  const source = record(raw);
  if (!source) return null;
  const entries = source.items === undefined ? [source] : source.items;
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > 20) return null;
  const items = /** @type {StoreEnquiryItem[]} */ ([]);
  for (const entry of entries) {
    const item = record(entry);
    if (!item || typeof item.experienceId !== 'string' || item.experienceId.length > 120 ||
        typeof item.mode !== 'string' || !['shared', 'private', 'request'].includes(item.mode) ||
        !Number.isInteger(item.guests) || Number(item.guests) < 1 || Number(item.guests) > 24) return null;
    const product = products.find((candidate) => {
      const ids = record(candidate.raw);
      return candidate.value === item.experienceId || ids?.id === item.experienceId || ids?.slug === item.experienceId;
    });
    if (!product) return null;
    const pickupZone = boundedText(item.pickupZone, 20);
    const accommodation = boundedText(item.accommodation, MAX_ACCOMMODATION_LENGTH);
    const preferredDate = boundedText(item.preferredDate, 300);
    const preferredTime = boundedText(item.preferredTime, 5);
    if (pickupZone === null || (pickupZone && !PICKUP_ZONES.includes(pickupZone)) ||
        accommodation === null || preferredDate === null || preferredTime === null ||
        (preferredTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(preferredTime)) ||
        (/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) && !isStoreEnquiryDate(preferredDate))) return null;
    items.push({
      experienceId: item.experienceId,
      mode: /** @type {StoreEnquiryItem['mode']} */ (item.mode),
      guests: /** @type {number} */ (item.guests),
      pickupZone, accommodation, preferredDate, preferredTime, product,
    });
  }
  const contact = /** @type {StoreEnquiry['contact']} */ ({});
  if (source.contact !== undefined) {
    const details = record(source.contact);
    if (details) {
      // The quote CTA can carry partially completed contact fields. Invalid
      // optional contact must never discard an otherwise valid trip enquiry.
      for (const [key, max] of /** @type {[keyof StoreEnquiry['contact'], number][]} */ ([['name', 200], ['email', 254], ['phone', 60]])) {
        const value = boundedText(details[key], max);
        if (value === null || (key === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) continue;
        if (value) contact[key] = value;
      }
    }
  }
  return { items, contact };
}

/** @param {StoreEnquiry} enquiry @param {Function} t */
export function storeEnquiryNote(enquiry, t) {
  const flexible = t('common.flexible', { defaultValue: 'Flexible' });
  const unspecified = t('common.not_selected', { defaultValue: 'Not selected' });
  return enquiry.items.map((item) => `${item.product.label}\n${t('store:pricing.enquiry_note', {
    guests: item.guests,
    mode: t(`store:cart.mode_${item.mode}`),
    accommodation: item.accommodation || unspecified,
    area: item.pickupZone ? t(`store:pickup.zones.${item.pickupZone}`) : unspecified,
    date: item.preferredDate || flexible,
    time: item.preferredTime || '',
  }).trim()}`).join('\n\n');
}

/** @param {typeof import('../data/bookingPageData.js').DEFAULT_BOOKING_FORM} current @param {StoreEnquiry} enquiry @param {Function} t */
export function applyStoreEnquiry(current, enquiry, t) {
  const first = enquiry.items[0];
  return {
    ...current,
    ...enquiry.contact,
    serviceType: first.product.type || 'excursion',
    product: first.product.value,
    retreatOption: '',
    guests: String(first.guests),
    startDate: isStoreEnquiryDate(first.preferredDate) ? first.preferredDate : current.startDate,
    endDate: '',
    paymentPreference: 'later',
    message: [current.message, storeEnquiryNote(enquiry, t)].filter(Boolean).join('\n\n'),
  };
}

/** Keep the original open-ended choices and represent an incoming exact count. @param {string} selected */
export function bookingGuestOptions(selected) {
  const options = ['1', '2', '3', '4', '5', '6'];
  if (/^(?:[7-9]|1\d|2[0-4])$/.test(selected)) options.push(selected);
  return [...options, '6+', '10+'];
}
