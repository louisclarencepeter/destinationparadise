import { EXCURSIONS } from './excursionsData.js';
import { DESTINATION_MAP_PINS } from './destinationMapPins.js';
import { destinationParadisePackages } from './destinationParadisePackages.js';
import { destinationParadiseSafariPricing } from './safariPricing.js';

export const EXPLORE_HERO_IMAGE = '/assets/images/home/stone-town-waterfront.webp';
export const EXPLORE_CTA_IMAGE = '/assets/images/safaris/buffalo-herd-close.webp';

export const EXPLORE_PATHS = [
  {
    eyebrow: 'Packages',
    title: 'I want the full trip arranged',
    text: 'Hotels, safaris, excursions, transfers, and special moments packaged into one plan.',
    to: '/packages',
    image: '/assets/images/safaris/zebra-herd-on-track.webp',
  },
  {
    eyebrow: 'Excursions',
    title: 'I am already on the island',
    text: 'Day trips, dhow sails, Stone Town, spice farms, Jozani, snorkeling, culture, and ocean days.',
    to: '/excursions',
    image: '/assets/images/excursions/safari-blue-sandbank.webp',
  },
  {
    eyebrow: 'Safaris',
    title: 'I want mainland wildlife',
    text: 'Northern icons, southern wilderness, western chimp routes, quick fly-ins, Kilimanjaro, and cultural stops.',
    to: '/safaris',
    image: '/assets/images/safaris/male-lion-in-grass.webp',
  },
  {
    eyebrow: 'Trip Planner',
    title: 'I need help choosing',
    text: 'Tell the AI planner your dates, pace, budget, and travel style. We turn the draft into a quote.',
    to: '/trip-planner',
    image: '/assets/images/safaris/crowned-crane-close.webp',
  },
];

export const DESTINATION_HUBS = {
  'stone-town': {
    title: 'Stone Town',
    type: 'Culture hub',
    text: 'Best for guests who want history, food, carved doors, markets, rooftops, spice routes, and an easy first day on Zanzibar.',
    bestFor: ['Culture', 'Food', 'First day', 'Rainy-day friendly'],
    excursions: [
      { label: 'Historical City Tour', to: '/excursions/stone-town' },
      { label: 'Spice Tour', to: '/excursions/spice-tour' },
      { label: 'Stone Town & Prison Island combo', to: '/excursions/combinations/tortoises-alleys' },
    ],
    packages: [
      { label: '9 Days Safari, Zanzibar & Culture', to: '/packages/nine-day-safari-zanzibar-culture' },
      { label: 'Stone Town & Culture Experience', to: '/packages/stone-town-culture-experience' },
    ],
  },
  fumba: {
    title: 'Fumba',
    type: 'Ocean hub',
    text: 'The classic launch point for dhow sailing, sandbanks, snorkeling, seafood lunches, and slow Menai Bay days.',
    bestFor: ['Dhow sailing', 'Sandbank picnic', 'Snorkeling', 'Couples'],
    excursions: [
      { label: 'Safari Blue Dhow & Snorkel', to: '/excursions/safari-blue' },
      { label: 'Reef & mangrove combo', to: '/excursions/combinations/reef-mangrove' },
    ],
    packages: [
      { label: 'Zanzibar Adventure & Marine Package', to: '/packages/zanzibar-adventure-marine-package' },
      { label: '6 Days Safari & Zanzibar Escape', to: '/packages/six-day-safari-zanzibar-escape' },
    ],
  },
  kizimkazi: {
    title: 'Kizimkazi',
    type: 'South coast',
    text: 'Best for early-morning dolphin trips and a quieter south-coast rhythm, often paired with Jozani or a beach lunch.',
    bestFor: ['Dolphins', 'Early starts', 'Nature', 'South coast'],
    excursions: [
      { label: 'Dolphin Tour', to: '/excursions/dolphins' },
      { label: 'South-coast nature combo', to: '/excursions/combinations/south-coast-nature' },
    ],
    packages: [
      { label: 'Zanzibar Adventure & Marine Package', to: '/packages/zanzibar-adventure-marine-package' },
    ],
  },
  jozani: {
    title: 'Jozani Forest',
    type: 'Nature stop',
    text: 'A gentle nature stop for red colobus monkeys, mangrove boardwalks, and forest time between beach or culture days.',
    bestFor: ['Families', 'Nature', 'Wildlife', 'Half day'],
    excursions: [
      { label: 'Jozani Forest Tour', to: '/excursions/jozani' },
      { label: 'Forest & spice combo', to: '/excursions/combinations/forest-spice' },
    ],
    packages: [
      { label: 'Zanzibar Adventure & Marine Package', to: '/packages/zanzibar-adventure-marine-package' },
      { label: '9 Days Safari, Zanzibar & Culture', to: '/packages/nine-day-safari-zanzibar-culture' },
    ],
  },
  nungwi: {
    title: 'Nungwi',
    type: 'North beach',
    text: 'The easiest north-coast base for wide beaches, sunsets, turtle stops, dhow yards, and Mnemba snorkeling days.',
    bestFor: ['Beach', 'Sunset', 'Snorkeling', 'Honeymoon'],
    excursions: [
      { label: 'Trip to the North · Nungwi', to: '/excursions/north-nungwi' },
      { label: 'Mnemba Snorkeling & Trip to the North', to: '/excursions/mnemba' },
      { label: 'North-coast all-day combo', to: '/excursions/combinations/north-coast-all-day' },
    ],
    packages: [
      { label: '7 Days Honeymoon Safari & Zanzibar', to: '/packages/seven-day-honeymoon-safari-zanzibar' },
      { label: '10 Days Classic Safari & Zanzibar', to: '/packages/ten-day-classic-safari-zanzibar' },
    ],
  },
  matemwe: {
    title: 'Matemwe',
    type: 'Reef coast',
    text: 'A quieter northeast-coast base for reef days, Mnemba snorkeling, slower boutique stays, and ocean time without the busiest beach rhythm.',
    bestFor: ['Snorkeling', 'Quiet beach', 'Reef days', 'Couples'],
    excursions: [
      { label: 'Mnemba Snorkeling & Trip to the North', to: '/excursions/mnemba' },
      { label: 'North-coast all-day combo', to: '/excursions/combinations/north-coast-all-day' },
    ],
    packages: [
      { label: '7 Days Honeymoon Safari & Zanzibar', to: '/packages/seven-day-honeymoon-safari-zanzibar' },
      { label: 'Zanzibar Adventure & Marine Package', to: '/packages/zanzibar-adventure-marine-package' },
    ],
  },
  paje: {
    title: 'Paje',
    type: 'East coast',
    text: 'A breezy east-coast base for kitesurfing, lagoon walks, casual beach stays, and active ocean days.',
    bestFor: ['Kitesurfing', 'Beach', 'Adventure', 'Long stays'],
    excursions: [
      { label: 'Kitesurfing Lessons', to: '/excursions/kitesurfing' },
      { label: 'Zanzibar Adventure & Marine Package', to: '/packages/zanzibar-adventure-marine-package' },
    ],
    packages: [
      { label: 'Digital Nomad Zanzibar Stay', to: '/packages/digital-nomad-zanzibar-stay' },
      { label: 'Zanzibar Adventure & Marine Package', to: '/packages/zanzibar-adventure-marine-package' },
    ],
  },
  arusha: {
    title: 'Arusha',
    type: 'Safari gateway',
    text: 'The main launch point for northern Tanzania safaris, Kilimanjaro add-ons, and smooth connections into Tarangire, Manyara, Ngorongoro, and Serengeti.',
    bestFor: ['Safari start', 'Airport access', 'Northern circuit', 'Kilimanjaro add-on'],
    safaris: [
      { label: 'Ngorongoro & Tarangire', to: '/safaris/ngorongoro-tarangire' },
      { label: 'Serengeti Migration', to: '/safaris/serengeti-migration' },
      { label: 'Mount Kilimanjaro Day Experience', to: '/safaris/kilimanjaro-day-hike' },
    ],
    packages: [
      { label: '10 Days Classic Safari & Zanzibar', to: '/packages/ten-day-classic-safari-zanzibar' },
      { label: 'Kilimanjaro + Safari + Zanzibar Expedition', to: '/packages/kilimanjaro-safari-zanzibar-expedition' },
    ],
  },
  serengeti: {
    title: 'Serengeti',
    type: 'Safari circuit',
    text: 'The big-name safari anchor: migration plains, predators, balloon options, and fly-in routes from Zanzibar.',
    bestFor: ['Migration', 'Big cats', 'Photography', 'Luxury camps'],
    safaris: [
      { label: 'Serengeti Migration', to: '/safaris/serengeti-migration' },
      { label: '3 Days Serengeti Fly-In Safari', to: '/packages/three-day-serengeti-fly-in-safari' },
    ],
    packages: [
      { label: 'Great Migration Luxury Package', to: '/packages/great-migration-luxury-package' },
      { label: '12 Days Serengeti & Zanzibar', to: '/packages/twelve-day-serengeti-zanzibar' },
    ],
  },
  ngorongoro: {
    title: 'Ngorongoro',
    type: 'Crater safari',
    text: 'High-density wildlife, crater landscapes, black rhino chances, and a strong fit for short Tanzania safari routes.',
    bestFor: ['Big Five', 'Short safari', 'First timers', 'Crater views'],
    safaris: [
      { label: 'Ngorongoro Overnight', to: '/safaris/ngorongoro-overnight' },
      { label: 'Ngorongoro & Tarangire', to: '/safaris/ngorongoro-tarangire' },
    ],
    packages: [
      { label: '8 Days Tanzania Parks & Zanzibar', to: '/packages/eight-day-tanzania-parks-zanzibar' },
      { label: '10 Days Classic Safari & Zanzibar', to: '/packages/ten-day-classic-safari-zanzibar' },
    ],
  },
  tarangire: {
    title: 'Tarangire',
    type: 'Elephant country',
    text: 'A strong short-safari choice for elephants, baobabs, and easier routing with Ngorongoro.',
    bestFor: ['Elephants', 'Baobabs', 'Short safari', 'Value'],
    safaris: [
      { label: 'Tarangire Express Day Safari', to: '/safaris/tarangire-day-trip' },
      { label: 'Tarangire + Ngorongoro Short Circuit', to: '/safaris/tarangire-ngorongoro-short' },
    ],
    packages: [
      { label: '6 Days Safari & Zanzibar Escape', to: '/packages/six-day-safari-zanzibar-escape' },
      { label: '8 Days Tanzania Parks & Zanzibar', to: '/packages/eight-day-tanzania-parks-zanzibar' },
    ],
  },
  manyara: {
    title: 'Lake Manyara',
    type: 'Northern lake park',
    text: 'A compact northern-circuit stop for lake views, birdlife, forest, and a gentle wildlife day between Tarangire and Ngorongoro.',
    bestFor: ['Birding', 'Families', 'Short game drive', 'Northern circuit'],
    safaris: [
      { label: 'Ngorongoro & Tarangire', to: '/safaris/ngorongoro-tarangire' },
      { label: 'Tarangire + Ngorongoro Short Circuit', to: '/safaris/tarangire-ngorongoro-short' },
    ],
    packages: [
      { label: '10 Days Classic Safari & Zanzibar', to: '/packages/ten-day-classic-safari-zanzibar' },
    ],
  },
  'lake-natron': {
    title: 'Lake Natron',
    type: 'Adventure lake',
    text: 'Remote soda-lake landscapes, flamingo breeding grounds, hot springs, Maasai villages, and volcanic scenery near Ol Doinyo Lengai.',
    bestFor: ['Flamingos', 'Remote landscapes', 'Photography', 'Adventure'],
    safaris: [
      { label: 'Lake Natron Flamingo Expedition', to: '/safaris/lake-natron-expedition' },
      { label: 'Authentic Maasai Cultural Safari', to: '/safaris/maasai-cultural-expedition' },
    ],
  },
  olduvai: {
    title: 'Olduvai Gorge',
    type: 'History stop',
    text: 'A human-origins stop between Ngorongoro and Serengeti, good for guests who want archaeology and context alongside wildlife.',
    bestFor: ['Human origins', 'History', 'Ngorongoro add-on', 'Culture'],
    safaris: [
      { label: 'Olduvai Gorge Human Origins Safari', to: '/safaris/olduvai-gorge' },
      { label: 'Ngorongoro & Tarangire', to: '/safaris/ngorongoro-tarangire' },
    ],
    packages: [
      { label: '9 Days Safari, Zanzibar & Culture', to: '/packages/nine-day-safari-zanzibar-culture' },
    ],
  },
  maasai: {
    title: 'Maasai Villages',
    type: 'Cultural safari',
    text: 'A cultural layer for guests who want village time, Maasai traditions, local cooking, and a more human story around the northern circuit.',
    bestFor: ['Culture', 'Families', 'Photography', 'Northern add-on'],
    safaris: [
      { label: 'Authentic Maasai Cultural Safari', to: '/safaris/maasai-cultural-expedition' },
      { label: 'Lake Natron Flamingo Expedition', to: '/safaris/lake-natron-expedition' },
    ],
    packages: [
      { label: '9 Days Safari, Zanzibar & Culture', to: '/packages/nine-day-safari-zanzibar-culture' },
    ],
  },
  kilimanjaro: {
    title: 'Mount Kilimanjaro',
    type: 'Mountain adventure',
    text: 'Tanzania’s mountain icon, available as a day experience or as the anchor for a longer climb, safari, and Zanzibar combination.',
    bestFor: ['Mountain views', 'Hiking', 'Bucket list', 'Adventure'],
    safaris: [
      { label: 'Mount Kilimanjaro Day Experience', to: '/safaris/kilimanjaro-day-hike' },
      { label: 'Materuni Waterfalls & Coffee Experience', to: '/safaris/materuni-waterfalls-coffee' },
    ],
    packages: [
      { label: 'Kilimanjaro + Safari + Zanzibar Expedition', to: '/packages/kilimanjaro-safari-zanzibar-expedition' },
    ],
  },
  materuni: {
    title: 'Materuni',
    type: 'Mountain village',
    text: 'A softer Kilimanjaro foothills day with waterfall hiking, coffee farms, Chagga culture, and mountain scenery.',
    bestFor: ['Waterfall', 'Coffee', 'Culture', 'Soft adventure'],
    safaris: [
      { label: 'Materuni Waterfalls & Coffee Experience', to: '/safaris/materuni-waterfalls-coffee' },
      { label: 'Mount Kilimanjaro Day Experience', to: '/safaris/kilimanjaro-day-hike' },
    ],
    packages: [
      { label: 'Kilimanjaro + Safari + Zanzibar Expedition', to: '/packages/kilimanjaro-safari-zanzibar-expedition' },
    ],
  },
  mikumi: {
    title: 'Mikumi National Park',
    type: 'Quick fly-in safari',
    text: 'One of the fastest mainland safari choices from Zanzibar, with lions, giraffes, buffalo, zebra, and simpler logistics for short stays.',
    bestFor: ['Short stays', 'Value', 'First safari', 'Zanzibar guests'],
    safaris: [
      { label: 'Mikumi Fly-In Safari From Zanzibar', to: '/safaris/mikumi-flyin' },
      { label: '2 Days Fly-In Safari From Zanzibar', to: '/packages/two-day-fly-in-safari-zanzibar' },
    ],
    packages: [
      { label: '2 Days Fly-In Safari From Zanzibar', to: '/packages/two-day-fly-in-safari-zanzibar' },
    ],
  },
  selous: {
    title: 'Nyerere National Park',
    type: 'Southern safari',
    text: 'A wilder southern choice for boat safaris, walking safaris, fewer vehicles, and quick fly-in options from Zanzibar.',
    bestFor: ['Boat safari', 'Walking safari', 'Fly-in', 'Wilderness'],
    safaris: [
      { label: 'Nyerere (Selous) Wild', to: '/safaris/nyerere-selous' },
      { label: '2 Days Fly-In Safari From Zanzibar', to: '/packages/two-day-fly-in-safari-zanzibar' },
    ],
    packages: [
      { label: '2 Days Fly-In Safari From Zanzibar', to: '/packages/two-day-fly-in-safari-zanzibar' },
      { label: '14 Days Ultimate Tanzania & Zanzibar', to: '/packages/fourteen-day-ultimate-tanzania-zanzibar' },
    ],
  },
  saadani: {
    title: 'Saadani National Park',
    type: 'Beach safari',
    text: 'A rare Indian Ocean safari setting where beach, river, and bush meet, best for guests who want a different coastal wilderness feel.',
    bestFor: ['Beach + bush', 'Boat safari', 'Turtles', 'Unusual routes'],
    safaris: [
      { label: 'Saadani Beach & Safari Experience', to: '/safaris/saadani-beach-safari' },
      { label: 'Nyerere (Selous) Wild', to: '/safaris/nyerere-selous' },
    ],
  },
  udzungwa: {
    title: 'Udzungwa Mountains',
    type: 'Hiking wilderness',
    text: 'Rainforest hikes, waterfalls, rare primates, and a nature-heavy mountain counterpoint to Mikumi or southern safari routes.',
    bestFor: ['Hiking', 'Waterfalls', 'Rare primates', 'Nature'],
    safaris: [
      { label: 'Udzungwa Mountains Hiking Safari', to: '/safaris/udzungwa-hiking-safari' },
      { label: 'Mikumi Fly-In Safari From Zanzibar', to: '/safaris/mikumi-flyin' },
    ],
  },
  ruaha: {
    title: 'Ruaha National Park',
    type: 'Southern big-cat safari',
    text: 'A remote southern park known for big-cat country, baobab valleys, fewer vehicles, and a stronger wilderness feel than the classic north.',
    bestFor: ['Big cats', 'Remote safari', 'Repeat guests', 'Photography'],
    safaris: [
      { label: 'Ruaha Big-Cat Trail', to: '/safaris/ruaha-big-cat' },
      { label: 'Nyerere (Selous) Wild', to: '/safaris/nyerere-selous' },
    ],
    packages: [
      { label: '14 Days Ultimate Tanzania & Zanzibar', to: '/packages/fourteen-day-ultimate-tanzania-zanzibar' },
    ],
  },
  mahale: {
    title: 'Mahale Mountains & Lake Tanganyika',
    type: 'Western chimp route',
    text: 'A premium western circuit for wild chimpanzee trekking, remote lakefront lodges, forest walks, and Lake Tanganyika downtime.',
    bestFor: ['Chimpanzees', 'Lake Tanganyika', 'Remote luxury', 'Adventure'],
    safaris: [
      { label: 'Mahale Chimp & Lake Tanganyika', to: '/safaris/mahale-chimp' },
      { label: 'Chimpanzee Trekking Expedition', to: '/safaris/chimpanzee-trekking' },
    ],
  },
  katavi: {
    title: 'Katavi National Park',
    type: 'Remote frontier',
    text: 'A far-west wilderness for serious safari travellers, dry-season floodplain herds, lion coalitions, hippo pools, and very few vehicles.',
    bestFor: ['Remote wilderness', 'Buffalo herds', 'Experienced safari', 'Fly-in'],
    safaris: [
      { label: 'Katavi Remote Frontier', to: '/safaris/katavi-frontier' },
      { label: 'Mahale Chimp & Lake Tanganyika', to: '/safaris/mahale-chimp' },
    ],
  },
};

export const MIN_PACKAGE_PRICE = Math.min(...destinationParadisePackages.map((item) => item.pricing.from));
export const MIN_SAFARI_PRICE = Math.min(...destinationParadiseSafariPricing.map((item) => item.recommendedPublicPrice.lowSeason));
export const MIN_EXPLORE_EXCURSION_PRICE = Math.min(...EXCURSIONS.map((item) => item.price).filter((price) => typeof price === 'number'));

const objectFromTranslation = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
);

export function buildLocalizedExploreContent(t) {
  const translatedPins = objectFromTranslation(t('pins', { returnObjects: true, defaultValue: {} }));
  const translatedHubs = objectFromTranslation(t('hubs', { returnObjects: true, defaultValue: {} }));
  const translatedPaths = t('paths.items', { returnObjects: true, defaultValue: EXPLORE_PATHS });

  const pins = DESTINATION_MAP_PINS.map((pin) => ({
    ...pin,
    ...objectFromTranslation(translatedPins[pin.id]),
  }));

  const hubs = Object.fromEntries(Object.entries(DESTINATION_HUBS).map(([id, hub]) => {
    const translated = objectFromTranslation(translatedHubs[id]);
    return [
      id,
      {
        ...hub,
        ...translated,
        bestFor: translated.bestFor || hub.bestFor,
        excursions: translated.excursions || hub.excursions,
        safaris: translated.safaris || hub.safaris,
        packages: translated.packages || hub.packages,
      },
    ];
  }));

  return { pins, hubs, paths: translatedPaths };
}

export function plannerHrefForHub(hub) {
  const params = new URLSearchParams({
    place: hub.title,
    type: hub.type,
    context: hub.text,
    bestFor: hub.bestFor.join(', '),
  });

  return `/trip-planner?${params.toString()}#planner`;
}
