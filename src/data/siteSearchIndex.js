import { EXCURSIONS } from './excursionsData.js';
import { EXCURSION_COMBINATIONS } from './excursionCombinations.js';
import { destinationParadisePackages } from './destinationParadisePackages.js';
import { ALL_SAFARI_PRODUCTS, SAFARI_TYPES } from './safariPageData.js';
import { TRANSFER_PRODUCTS } from './transferProducts.js';

const pageItems = [
  {
    title: 'Strona główna',
    category: 'Strona',
    description: 'Zacznij tutaj: Zanzibar, safari, pakiety, transfery, pogoda, galeria i planowanie podróży.',
    to: '/',
    keywords: ['destination paradise', 'zanzibar', 'tanzania', 'home', 'strona główna'],
  },
  {
    title: 'Wycieczki',
    category: 'Strona',
    description: 'Przeglądaj wycieczki po Zanzibarze: rejsy dhow, Stone Town, farmy przypraw, snorkeling, delfiny i natura.',
    to: '/excursions',
    keywords: ['wycieczki', 'atrakcje', 'tours', 'dhow', 'stone town', 'przyprawy', 'mnemba', 'jozani'],
  },
  {
    title: 'Safari',
    category: 'Strona',
    description: 'Trasy wildlife na lądzie stałym: Serengeti, Ngorongoro, Tarangire, Nyerere, Ruaha i więcej.',
    to: '/safaris',
    keywords: ['wildlife', 'wielka piątka', 'serengeti', 'ngorongoro', 'tarangire', 'migracja', 'game drive'],
  },
  {
    title: 'Pakiety',
    category: 'Strona',
    description: 'Pakiety safari i Zanzibar: honeymoon, rodzina, luksus, kultura, migracja i wakacje na plaży.',
    to: '/packages',
    keywords: ['pakiet wakacyjny', 'honeymoon', 'rodzina', 'safari i plaża', 'safari zanzibar'],
  },
  {
    title: 'Transfery',
    category: 'Strona',
    description: 'Transfery prywatne z lotniska i hoteli, przejazdy dla grup oraz obsługa VIP na lotnisku.',
    to: '/transfers',
    keywords: ['odbiór z lotniska', 'taxi', 'prywatny samochód', 'paje', 'nungwi', 'kendwa', 'stone town'],
  },
  {
    title: 'Planer podróży',
    category: 'Strona',
    description: 'Zbuduj indywidualny plan według tempa, dat, budżetu, plaży, safari i wycieczek.',
    to: '/trip-planner',
    keywords: ['podróż na miarę', 'itinerary', 'planer', 'ai planner', 'trasa'],
  },
  {
    title: 'Rezerwacja',
    category: 'Strona',
    description: 'Wyślij zapytanie o pakiet, wycieczkę, safari, transfer albo plan na miarę.',
    to: '/booking',
    keywords: ['rezerwuj', 'zapytanie', 'płatność', 'dostępność'],
  },
  {
    title: 'O nas',
    category: 'Strona',
    description: 'Poznaj Destination Paradise, naszą misję, historię, społeczność i lokalne podejście do podróży.',
    to: '/aboutus',
    keywords: ['firma', 'zespół', 'misja', 'historia', 'społeczność', 'kontakt'],
  },
];

const compactList = (items = []) => items.filter(Boolean).join(' · ');

const priceLabel = (pricing) => {
  if (!pricing?.from) return '';
  return `Od $${pricing.from}${pricing.unit ? ` ${pricing.unit.toLowerCase()}` : ''}`;
};

const packageItems = destinationParadisePackages.map((item) => ({
  title: item.title,
  category: 'Pakiet',
  description: compactList([item.duration, item.category, item.split, priceLabel(item.pricing)]),
  to: `/packages/${item.slug}`,
  keywords: [
    item.category,
    item.duration,
    item.split,
    ...(item.idealFor || []),
    ...(item.includes || []),
    ...(item.route || []),
  ],
}));

const safariItems = ALL_SAFARI_PRODUCTS.map((item) => ({
  title: item.title,
  category: item.productType || 'Safari',
  description: compactList([item.duration, item.categoryLabel || item.category || item.positioning, item.rib || (item.price ? `Od $${item.price} ${item.priceSub || 'za osobę'}` : '')]),
  to: `/safaris/${item.id}`,
  keywords: [
    item.categoryLabel || item.category,
    item.positioning,
    item.duration,
    item.from,
    item.intro,
    ...(item.highlights || []),
    ...(item.idealFor || []),
    ...(item.days || []).flatMap((day) => [day.h, day.p]),
  ],
}));

const safariTypeItems = SAFARI_TYPES.map((item) => ({
  title: item.title,
  category: 'Styl safari',
  description: compactList([item.bestFor, item.desc]),
  to: `/safaris/types/${item.id}`,
  keywords: [item.bestFor, item.desc, ...(item.highlights || [])],
}));

const excursionItems = EXCURSIONS.map((item) => ({
  title: item.title,
  category: 'Wycieczka',
  description: compactList([item.duration, item.categoryLabel || item.category, item.price ? `Od $${item.price} ${item.priceSub || 'za osobę'}` : '', item.description]),
  to: `/excursions/${item.id}`,
  keywords: [
    item.categoryLabel || item.category,
    item.eyebrow,
    item.duration,
    item.from,
    item.group,
    item.description,
    ...(item.highlights || []),
    ...(item.facts || []).flat(),
  ],
}));

const combinationItems = EXCURSION_COMBINATIONS.map((item) => ({
  title: item.title,
  category: 'Kombinacja wycieczek',
  description: compactList([item.length, item.combo?.join(' + '), item.desc]),
  to: `/excursions/combinations/${item.id}`,
  keywords: [item.length, item.desc, ...(item.combo || []), ...(item.idealFor || [])],
}));

const transferItems = TRANSFER_PRODUCTS.map((item) => ({
  title: item.title,
  category: item.category || 'Transfer',
  description: compactList([item.duration, item.priceSummary, item.description]),
  to: `/booking?type=transfer&item=${item.slug}#booking-details`,
  keywords: [
    item.duration,
    item.description,
    item.priceSummary,
    ...(item.pricing || []),
    ...(item.details || []),
  ],
}));

const normalizeSearchItem = (item, index) => {
  const text = [
    item.title,
    item.category,
    item.description,
    ...(item.keywords || []),
  ].filter(Boolean).join(' ');

  return {
    ...item,
    id: `${item.category}-${index}-${item.to}`,
    searchText: text.toLowerCase(),
  };
};

export const SITE_SEARCH_INDEX = [
  ...pageItems,
  ...transferItems,
  ...packageItems,
  ...safariItems,
  ...safariTypeItems,
  ...excursionItems,
  ...combinationItems,
].map(normalizeSearchItem);

export const SITE_SEARCH_POPULAR = [
  'Transfer lotniskowy',
  'Safari Blue',
  'Pakiet honeymoon',
  'Serengeti',
  'Stone Town',
  'Paje',
];
