export const SERVICE_TYPES = [
  { value: 'package', label: 'Pakiet', text: 'Safari + Zanzibar, podróż poślubna, rodzina, kultura, ocean albo luksusowa trasa.' },
  { value: 'excursion', label: 'Wycieczka', text: 'Jednodniowe wypady po wyspie, dhow, Stone Town, farmy przypraw, snorkeling i natura.' },
  { value: 'safari', label: 'Safari', text: 'Trasy z dziką przyrodą na kontynencie, safari samolotem, migracja, parki południa i programy na miarę.' },
  { value: 'transfer', label: 'Transfer', text: 'Prywatny transfer z lotniska, hotel-hotel, grupa, premium SUV albo VIP concierge.' },
  { value: 'custom', label: 'Plan na miarę', text: 'Nie masz jeszcze pewności? Opowiedz nam, czego szukasz, a ułożymy trasę wokół Ciebie.' },
];

export const PAYMENT_OPTIONS = [
  { value: 'secure-link', label: 'Wyślij bezpieczny link do płatności online', text: 'Najlepsze rozwiązanie po potwierdzeniu dostępności i końcowej ceny.' },
  { value: 'deposit', label: 'Chcę zapłacić zaliczkę online', text: 'Potwierdzimy kwotę zaliczki i wyślemy link do płatności.' },
  { value: 'full', label: 'Chcę zapłacić całość online', text: 'Dla potwierdzonych podróży, które chcesz opłacić kartą lub linkiem.' },
  { value: 'later', label: 'Najpierw wycena, płatność później', text: 'Najpierw wycenimy wyjazd, a potem omówimy płatność.' },
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
  accommodationLevel: 'Średni standard',
  paymentPreference: 'secure-link',
  message: '',
};

const money = (value) => `$${Number(value).toLocaleString()}`;

export function bookingPriceLabel(item) {
  if (!item) return 'Końcowa cena po sprawdzeniu dostępności';
  if (item.type === 'package') {
    const to = item.raw.pricing.to ? ` - ${money(item.raw.pricing.to)}` : '';
    return `Od ${money(item.raw.pricing.from)}${to} ${item.raw.pricing.unit || 'za osobę'}`;
  }
  if (item.type === 'safari') {
    return `Od ${money(item.raw.recommendedPublicPrice.lowSeason)} za osobę`;
  }
  if (item.type === 'excursion' && typeof item.raw.price === 'number') {
    return `Od ${money(item.raw.price)} ${item.raw.priceSub || 'za osobę'}`;
  }
  if (item.type === 'transfer') {
    return item.raw.priceSummary || 'Końcowa cena transferu po potwierdzeniu trasy';
  }
  return 'Końcowa cena po sprawdzeniu dostępności';
}
