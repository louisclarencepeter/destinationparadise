export const SERVICE_TYPES = [
  { value: 'package', label: 'Package', text: 'Safari + Zanzibar, honeymoon, family, culture, marine, or luxury route.' },
  { value: 'excursion', label: 'Excursion', text: 'Island day trips, dhow sailing, Stone Town, spice farms, snorkeling, and nature.' },
  { value: 'safari', label: 'Safari', text: 'Mainland wildlife routes, fly-in safaris, migration, southern parks, and custom circuits.' },
  { value: 'transfer', label: 'Transfer', text: 'Private airport, hotel-to-hotel, group, premium SUV, or VIP concierge transfer.' },
  { value: 'custom', label: 'Custom plan', text: 'Not sure yet? Tell us the shape and we will build a route around you.' },
];

export const PAYMENT_OPTIONS = [
  { value: 'secure-link', label: 'Send secure online payment link', text: 'Best after we confirm availability and the final price.' },
  { value: 'deposit', label: 'I want to pay a deposit online', text: 'We will confirm the deposit amount and send a payment link.' },
  { value: 'full', label: 'I want to pay the full amount online', text: 'For confirmed trips where you want to settle everything by card/link.' },
  { value: 'later', label: 'Quote first, payment later', text: 'We will price the trip first and discuss payment after.' },
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

export function bookingPriceLabel(item) {
  if (!item) return 'Final price after availability check';
  if (item.type === 'package') {
    const to = item.raw.pricing.to ? ` - ${money(item.raw.pricing.to)}` : '';
    return `From ${money(item.raw.pricing.from)}${to} ${item.raw.pricing.unit || 'per person'}`;
  }
  if (item.type === 'safari') {
    return `From ${money(item.raw.recommendedPublicPrice.lowSeason)} pp`;
  }
  if (item.type === 'excursion' && typeof item.raw.price === 'number') {
    return `From ${money(item.raw.price)} ${item.raw.priceSub || 'per person'}`;
  }
  if (item.type === 'transfer') {
    return item.raw.priceSummary || 'Final transfer price after route confirmation';
  }
  return 'Final price after availability check';
}
