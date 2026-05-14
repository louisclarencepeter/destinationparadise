export const safariImg = (file) => `/assets/images/safaris/${file}`;

export const WILDLIFE_CATEGORIES = [
  {
    title: 'Big cats',
    sub: 'Predators',
    rowMod: 'cats',
    tiles: [
      { src: 'male-lion-in-grass.webp', alt: 'Male lion lying in grass', cap: 'Male lion · Ngorongoro Crater', mod: 'wide' },
      { src: 'serval-in-grass.webp', alt: 'Serval cat in grass', cap: 'Serval · rare daylight sighting' },
      { src: 'lion-cub-in-grass.webp', alt: 'Lion cub in grass', cap: 'Cub · ten weeks old' },
      { src: 'lioness-and-cub-resting.webp', alt: 'Lioness with cub resting', cap: 'Lioness & cub · evening rest', mod: 'wide' },
    ],
  },
  {
    title: 'Hooved giants',
    sub: 'The grazers',
    rowMod: 'ungulates',
    tiles: [
      { src: 'zebra-mare-and-foal.webp', alt: 'Zebra mare and foal', cap: 'Zebra · mare and foal', mod: 'tall' },
      { src: 'zebra-herd-on-track.webp', alt: 'Zebra herd on track', cap: 'The herd, deciding', mod: 'wide' },
      { src: 'wildebeest-grazing.webp', alt: 'Blue wildebeest grazing', cap: 'Blue wildebeest' },
      { src: 'eland-grazing.webp', alt: 'Eland grazing', cap: 'Eland · the largest antelope' },
      { src: 'eland-herd-plains.webp', alt: 'Eland herd', cap: 'Eland herd · Ngorongoro', mod: 'wide' },
      { src: 'warthog-on-plains.webp', alt: 'Warthog', cap: 'Warthog · Pumbaa, in person' },
    ],
  },
  {
    title: 'Heavyweights',
    sub: 'Big & rare',
    rowMod: 'heavy',
    tiles: [
      { src: 'buffalo-herd-close.webp', alt: 'Cape buffalo herd close-up', cap: 'Cape buffalo · the dagga boys', mod: 'wide' },
      { src: 'buffalo-and-egret.webp', alt: 'Buffalo with cattle egret', cap: 'Buffalo & egret · partners', mod: 'wide' },
      { src: 'rhino-on-plains.webp', alt: 'Black rhino on plains', cap: 'Black rhino · <30 left in the crater', mod: 'full' },
    ],
  },
  {
    title: 'Birds',
    sub: '400+ species',
    rowMod: 'birds',
    tiles: [
      { src: 'crowned-crane-close.webp', alt: 'Grey crowned crane close-up', cap: 'Grey crowned crane', mod: 'tall' },
      { src: 'crowned-cranes-in-grass.webp', alt: 'Pair of crowned cranes', cap: 'The pair · always two' },
      { src: 'yellow-weaver-on-rail.webp', alt: 'Yellow weaver on rail', cap: "Speke's weaver · lodge regular" },
      { src: 'raptor-on-log.webp', alt: 'Lanner falcon on rock', cap: 'Lanner falcon · with prey', mod: 'wide' },
    ],
  },
];

export const SEASONS = [
  {
    mod: 'peak',
    months: 'Jun · Jul · Aug · Sep · Oct',
    title: 'Dry & classic',
    blurb: 'Animals cluster at waterholes. The Mara River crossings happen July–September. Cool, golden grass, picture-postcard. Books out 6+ months ahead.',
    rating: '★★★★★',
  },
  {
    mod: 'good',
    months: 'Dec · Jan · Feb',
    title: 'Calving season',
    blurb: 'Wildebeest drop half a million calves on the southern Serengeti plains in February. Predator action peaks. Hot, but lush. Quieter parks.',
    rating: '★★★★☆',
  },
  {
    mod: 'shoulder',
    months: 'Nov · Mar',
    title: 'Green & cheap',
    blurb: 'Short rains. Skies are dramatic, parks empty, prices drop 20–30%. Birding peaks in November. Some bush roads can muddy.',
    rating: '★★★☆☆',
  },
  {
    mod: 'avoid',
    months: 'Apr · May',
    title: 'Long rains',
    blurb: 'Many camps close. Roads flood. Bargain-hunters only — and even then, we usually steer guests elsewhere this season.',
    rating: '★★☆☆☆',
  },
];

export const SAFARI_COMPARISON = [
  { label: 'Best quick taste', pick: 'Tarangire Express Day Safari', slug: 'tarangire-day-trip', note: 'Lowest commitment, real mainland wildlife in one day.' },
  { label: 'Best short safari', pick: 'Ngorongoro Overnight', slug: 'ngorongoro-overnight', note: 'One night, high wildlife density, crater at first light.' },
  { label: 'Best first-timer route', pick: 'Ngorongoro & Tarangire', slug: 'ngorongoro-tarangire', note: 'Classic Big Five scenery plus elephants and baobabs.' },
  { label: 'Best migration focus', pick: 'Serengeti Migration', slug: 'serengeti-migration', note: 'For river-crossing season and big open-plains drama.' },
  { label: 'Best remote wilderness', pick: 'Nyerere, Ruaha, Katavi', slug: 'nyerere-selous', note: 'Fewer vehicles, wilder camps, stronger adventure feel.' },
  { label: 'Best premium add-on', pick: 'Mahale Chimp & Lake Tanganyika', slug: 'mahale-chimp', note: 'Rare chimp trekking with a lakefront finish.' },
];

export const BOOKING_STEPS = [
  { step: '01', title: 'Choose a route', text: 'Start with a card, or send your dates and we’ll recommend the best safari for your budget.' },
  { step: '02', title: 'We price the real trip', text: 'We check flights, camp availability, park fees, and seasonality before sending the final quote.' },
  { step: '03', title: 'Deposit confirms it', text: 'Your deposit locks the flights, guide, camps, and transfers. The rest is paid before travel.' },
];

export const INITIAL_SAFARI_COUNT = 9;
export const SAFARI_BATCH_COUNT = 9;

export const SAFARI_FILTERS = [
  { key: 'all', label: 'All', match: () => true },
  {
    key: 'classic',
    label: 'Classic routes',
    match: (item) => ['Northern Circuit', 'Migration Safari', 'Last-minute Safari', 'Day Safari'].includes(item.category),
  },
  {
    key: 'southern',
    label: 'Southern parks',
    match: (item) => ['Southern Circuit', 'Quick Safari', 'Beach & Safari', 'Hiking & Nature'].includes(item.category),
  },
  {
    key: 'western',
    label: 'Western & remote',
    match: (item) => ['Western Circuit', 'Wildlife'].includes(item.category) || ['katavi-frontier', 'mahale-chimp', 'chimpanzee-trekking'].includes(item.id),
  },
  {
    key: 'short',
    label: '1-3 day trips',
    match: (item) => /1 Day|1 - 2 Days|1 - 3 Days|1 night|2 nights/i.test(item.duration),
  },
  {
    key: 'culture',
    label: 'Culture & nature',
    match: (item) => ['Culture', 'History & Safari', 'Nature & Culture', 'Nature & Adventure', 'Mountain Adventure'].includes(item.category),
  },
  {
    key: 'luxury',
    label: 'Luxury & private',
    match: (item) => ['Luxury', 'Luxury & Wellness', 'Ultra Luxury'].includes(item.category),
  },
  {
    key: 'special',
    label: 'Special interests',
    match: (item) => ['Photography', 'Birding', 'Adventure', 'Migration', 'Family'].includes(item.category),
  },
  {
    key: 'combo',
    label: 'Bush & beach',
    match: (item) => ['Combo', 'Beach & Safari', 'Multi Country'].includes(item.category),
  },
];

export const FAQS = [
  {
    q: 'How many days do I need on safari?',
    a: 'Three nights is the absolute minimum and only worth it if you fly between parks. Five nights is the sweet spot. Anything over seven and you’ll start to crave the beach — which is why most guests pair safari with Zanzibar.',
    open: true,
  },
  {
    q: 'Is it safe to bring kids?',
    a: 'Yes — most camps welcome children 7+. We pick "family" lodges with pools and flexible game drives. For kids under 7, we suggest Tarangire (shorter drives, big elephant sightings) over Serengeti.',
  },
  {
    q: 'What about malaria?',
    a: 'Tanzania is a malaria area. Speak to your travel doctor about prophylaxis. Camps provide repellent, mosquito nets, and most have screened tents.',
  },
  {
    q: 'Big Five — guaranteed?',
    a: 'In the Ngorongoro Crater, you’ll usually tick four of five in a single day. Leopard is the wildcard — sometimes the same morning, sometimes never. We don’t promise sightings; the bush isn’t a zoo. We do promise we’ll work hard to find them.',
  },
  {
    q: 'What kind of camera should I bring?',
    a: 'A 200mm zoom minimum if you want frame-fillers. Most of our guests now shoot phones with a small clip-on telephoto and they do great. Bring a dust-blower — every camp’s nightmare is sand on the sensor.',
  },
  {
    q: 'Can I extend with Zanzibar?',
    a: 'Yes — and you should. We design every safari to flow into a beach stay. See our Bush & Beach package for a 10-night example.',
    extendLink: true,
  },
];
