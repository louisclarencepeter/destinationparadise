import { EXCURSIONS } from './excursionsData.js';
import { EXCURSION_COMBINATIONS } from './excursionCombinations.js';
import { destinationParadisePackages } from './destinationParadisePackages.js';
import { ALL_SAFARI_PRODUCTS, SAFARI_TYPES } from './safariPageData.js';
import { TRANSFER_PRODUCTS } from './transferProducts.js';
import { isStoreEnabled } from '../config/featureFlags.js';

const pageItems = [
  // Feature-flagged: joins search only where the store itself is reachable.
  ...(isStoreEnabled()
    ? [{
        title: 'Experiences Store',
        category: 'Page',
        description: 'Book selected excursions instantly — pick dates, times, and guests, combine several trips, and pay once.',
        to: '/store',
        keywords: ['store', 'instant booking', 'book online', 'cart', 'checkout', 'availability', 'safari blue', 'spice tour'],
      }]
    : []),
  {
    title: 'Home',
    category: 'Page',
    description: 'Start here for Zanzibar trips, safaris, packages, transfers, weather, gallery, and trip planning.',
    to: '/',
    keywords: ['destination paradise', 'zanzibar', 'tanzania', 'home', 'main page'],
  },
  {
    title: 'Excursions',
    category: 'Page',
    description: 'Browse Zanzibar day trips, dhow sailing, Stone Town, spice farms, snorkeling, dolphins, and nature tours.',
    to: '/excursions',
    keywords: ['day trips', 'activities', 'tours', 'dhow', 'stone town', 'spice', 'mnemba', 'jozani'],
  },
  {
    title: 'Safaris',
    category: 'Page',
    description: 'Mainland wildlife routes across Serengeti, Ngorongoro, Tarangire, Nyerere, Ruaha, and more.',
    to: '/safaris',
    keywords: ['wildlife', 'big five', 'serengeti', 'ngorongoro', 'tarangire', 'migration', 'game drive'],
  },
  {
    title: 'Packages',
    category: 'Page',
    description: 'Safari and Zanzibar packages for honeymoon, family, luxury, culture, migration, and beach holidays.',
    to: '/packages',
    keywords: ['holiday package', 'honeymoon', 'family', 'bush and beach', 'safari zanzibar'],
  },
  {
    title: 'Yoga & Wellness Retreats',
    category: 'Page',
    description: 'Teacher-led yoga, bodywork, coastal reset weeks, private retreats, and yoga safari journeys on Zanzibar.',
    to: '/retreats',
    keywords: ['wellness', 'yoga', 'meditation', 'vinyasa', 'yin', 'hatha', 'bodywork', 'thaivedic', 'mindfulness', 'retreat'],
  },
  {
    title: 'Transfers',
    category: 'Page',
    description: 'Private airport transfers, hotel transfers, group transport, and VIP airport concierge service.',
    to: '/transfers',
    keywords: ['airport pickup', 'taxi', 'private car', 'paje', 'nungwi', 'kendwa', 'stone town'],
  },
  {
    title: 'Trip Planner',
    category: 'Page',
    description: 'Build a custom itinerary around pace, dates, budget, beach time, safaris, and excursions.',
    to: '/trip-planner',
    keywords: ['custom trip', 'itinerary', 'planner', 'ai planner', 'route'],
  },
  {
    title: 'Booking',
    category: 'Page',
    description: 'Send a booking request for a package, excursion, safari, transfer, or custom plan.',
    to: '/booking',
    keywords: ['book now', 'request', 'payment', 'reserve', 'availability'],
  },
  {
    title: 'Our Zanzibar Guide',
    category: 'Local guide',
    description: 'Our current restaurant recommendations across eight Zanzibar areas, plus the island events worth planning around.',
    to: '/explore#our-zanzibar-guide',
    keywords: ['restaurants', 'food', 'where to eat', 'stone town', 'nungwi', 'kendwa', 'matemwe', 'kiwengwa', 'pongwe', 'michamvi', 'paje', 'bwejuu', 'jambiani', 'kizimkazi', 'local guide', 'family dinner', 'events', 'festivals', 'whats on', 'sauti za busara', 'ziff', 'full moon party', 'mwaka kogwa', 'forodhani night market'],
  },
  {
    title: 'About Us',
    category: 'Page',
    description: 'Learn about Destination Paradise, our mission, story, community, and local travel approach.',
    to: '/aboutus',
    keywords: ['company', 'team', 'mission', 'story', 'community', 'contact'],
  },
];

const compactList = (items = []) => items.filter(Boolean).join(' · ');

const priceLabel = (pricing) => {
  if (!pricing?.from) return '';
  return `From $${pricing.from}${pricing.unit ? ` ${pricing.unit.toLowerCase()}` : ''}`;
};

const packageItems = destinationParadisePackages.map((item) => ({
  title: item.title,
  category: 'Package',
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
  description: compactList([item.duration, item.category || item.positioning, item.rib || (item.price ? `From $${item.price} ${item.priceSub || 'pp'}` : '')]),
  to: `/safaris/${item.id}`,
  keywords: [
    item.category,
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
  category: 'Safari style',
  description: compactList([item.bestFor, item.desc]),
  to: `/safaris/types/${item.id}`,
  keywords: [item.bestFor, item.desc, ...(item.highlights || [])],
}));

const excursionItems = EXCURSIONS.map((item) => ({
  title: item.title,
  category: 'Excursion',
  description: compactList([item.duration, item.category, item.price ? `From $${item.price} ${item.priceSub || 'pp'}` : '', item.description]),
  to: `/excursions/${item.id}`,
  keywords: [
    item.category,
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
  category: 'Excursion combo',
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
  'Airport transfer',
  'Safari Blue',
  'Honeymoon package',
  'Serengeti',
  'Stone Town',
  'Paje',
];
