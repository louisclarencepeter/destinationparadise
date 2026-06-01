export const SERVICE_TYPES = [
  { value: 'package', label: 'Package', text: 'Safari + Zanzibar, honeymoon, family, culture, marine, or luxury route.' },
  { value: 'excursion', label: 'Excursion', text: 'Island day trips, dhow sailing, Stone Town, spice farms, snorkeling, and nature.' },
  { value: 'safari', label: 'Safari', text: 'Mainland wildlife routes, fly-in safaris, migration, southern parks, and custom circuits.' },
  { value: 'transfer', label: 'Transfer', text: 'Private airport, hotel-to-hotel, group, premium SUV, or VIP concierge transfer.' },
  { value: 'custom', label: 'Custom plan', text: 'Not sure yet? Tell us the shape and we will build a route around you.' },
  { value: 'retreat', label: 'Retreat', text: '14-day yoga & safari retreat on Zanzibar — sunrise vinyasa, yin evenings, meditation, and a mainland safari.' },
];

export const PAYMENT_OPTIONS = [
  { value: 'secure-link', label: 'Send secure online payment link', text: 'Best after we confirm availability and the final price.' },
  { value: 'deposit', label: 'I want to pay a deposit online', text: 'We will confirm the deposit amount and send a payment link.' },
  { value: 'full', label: 'I want to pay the full amount online', text: 'For confirmed trips where you want to settle everything by card/link.' },
  { value: 'later', label: 'Quote first, payment later', text: 'We will price the trip first and discuss payment after.' },
];

export const BUDGET_OPTIONS = [
  { value: '', label: 'Not sure yet' },
  { value: 'Under $1,000 pp', label: 'Under $1,000 pp' },
  { value: '$1,000 - $2,500 pp', label: '$1,000 - $2,500 pp' },
  { value: '$2,500 - $5,000 pp', label: '$2,500 - $5,000 pp' },
  { value: '$5,000 - $8,000 pp', label: '$5,000 - $8,000 pp' },
  { value: '$8,000+ pp', label: '$8,000+ pp' },
];

export const COMFORT_OPTIONS = [
  { value: 'Budget', label: 'Budget' },
  { value: 'Mid-range', label: 'Mid-range' },
  { value: 'Luxury', label: 'Luxury' },
  { value: 'Ultra luxury', label: 'Ultra luxury' },
  { value: 'Flexible', label: 'Flexible' },
];

export const DEFAULT_BOOKING_FORM = {
  serviceType: 'package',
  product: '',
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  startDate: '',
  endDate: '',
  guests: '2',
  transferTier: 'standard-private',
  pickupLocation: '',
  dropoffLocation: '',
  flightNumber: '',
  transferTime: '',
  budget: '',
  accommodationLevel: 'Mid-range',
  paymentPreference: 'secure-link',
  message: '',
};

const money = (value) => `$${Number(value).toLocaleString()}`;

export const translatedList = (t, key, fallback) => {
  const translated = t?.(key, { returnObjects: true, defaultValue: fallback });
  return Array.isArray(translated) ? translated : fallback;
};

export const translatedLabel = (items, value, fallback = value) => (
  items.find((item) => item.value === value)?.label || fallback
);

export function bookingPriceLabel(item, t, format) {
  const translate = (key, fallback) => t?.(key, { defaultValue: fallback }) || fallback;
  const fmt = typeof format === 'function' ? format : money;

  if (!item) return translate('price.final_after_availability', 'Final price after availability check');
  if (item.type === 'package') {
    const to = item.raw.pricing.to ? ` - ${fmt(item.raw.pricing.to)}` : '';
    return `${translate('price.from', 'From')} ${fmt(item.raw.pricing.from)}${to} ${item.unit || item.raw.pricing.unit || translate('price.per_person', 'per person')}`;
  }
  if (item.type === 'safari') {
    return `${translate('price.from', 'From')} ${fmt(item.raw.recommendedPublicPrice.lowSeason)} ${translate('price.pp', 'pp')}`;
  }
  if (item.type === 'excursion' && typeof item.raw.price === 'number') {
    return `${translate('price.from', 'From')} ${fmt(item.raw.price)} ${item.priceSub || item.raw.priceSub || translate('price.per_person', 'per person')}`;
  }
  if (item.type === 'transfer') {
    return item.priceSummary || item.raw.priceSummary || translate('price.final_transfer_after_route', 'Final transfer price after route confirmation');
  }
  // Retreat deliberately shows the soft "final price after availability" copy in
  // the booking summary — the "from" price lives on the retreat page instead.
  return translate('price.final_after_availability', 'Final price after availability check');
}
