import { EXCURSIONS, CATEGORIES } from './excursionsData.js';
import { uniqueProductImages } from '../utils/productImages.js';

export const EXCURSIONS_HERO_IMAGE = '/assets/images/excursions/safari-blue-sandbank.webp';
export const EXCURSIONS_CTA_IMAGE = '/assets/images/excursions/dolphin-snorkeling.webp';

export const INITIAL_EXCURSION_COUNT = 12;
export const EXCURSION_BATCH_COUNT = 12;

export const EXCURSION_PAGE_CARDS = uniqueProductImages(EXCURSIONS, { scope: 'Excursion' });

const PRICES = EXCURSIONS.map((e) => e.price).filter((p) => typeof p === 'number');
export const MIN_EXCURSION_PRICE = PRICES.length ? Math.min(...PRICES) : null;

export const EXCURSION_FILTERS = [
  { cat: 'all', label: 'All', count: EXCURSIONS.length },
  ...CATEGORIES.map((cat) => ({
    cat,
    label: cat,
    count: EXCURSIONS.filter((e) => e.category === cat).length,
  })),
];

export function categoryToSlug(cat) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const EXCURSION_PRACTICAL = [
  { h: "What's always included", icon: 'check', items: ['Hotel pickup & drop-off', 'Licensed local guide', 'Bottled water all day', 'All park & entry fees', 'Equipment (masks, fins, life jackets)'] },
  { h: 'Not included', icon: 'x', items: ['Tips for guides & crew', 'Alcohol on certain trips ($15 add-on)', 'Travel insurance (please bring your own)', 'Spending money for markets/cafés'] },
  { h: 'Family-friendly', icon: 'check', items: ['Spice Tour, Prison Island, Jozani — all ages', 'Safari Blue — kids 8+', 'Dolphins — confident swimmers, 10+', 'Children under 5 free on most trips'] },
  { h: 'Rezerwacja i płatność', icon: 'clock', items: ['Rezerwuj minimum 48 godzin wcześniej', '20% zaliczki, reszta w dniu wycieczki', 'Bezpłatna anulacja do 24 godzin przed', 'Akceptujemy USD, EUR, GBP i TZS'] },
];
