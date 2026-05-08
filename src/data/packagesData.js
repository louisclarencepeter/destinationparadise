// Premium packages and add-on services — separate from the day-trip excursions list.
// Currently no dedicated `/packages` page — keep the data ready for when one ships.
// All entries lean: id, title, category, description, image, optional price/duration.

const img = (file) => `/assets/images/excursions/${file}`;
const homeImg = (file) => `/assets/images/home/${file}`;

export const PACKAGES = [
  {
    id: 'romantic-beach-dinner',
    title: 'Romantic Beach Dinner Setup',
    category: 'Service',
    image: homeImg('stone-town-waterfront.webp'),
    imageTBD: true,
    description: 'A private candlelit beach dinner with seafood platters, flowers, live music, and on-site photography. Set up at your hotel beach or any stretch of coast we can reach.',
    duration: 'Evening',
    group: '2 – 12 guests',
    highlights: ['Candlelit private setup', 'Seafood and Swahili menu', 'Optional live music & photography'],
  },
  {
    id: 'luxury-picnic',
    title: 'Luxury Picnic Experience',
    category: 'Service',
    image: img('safari-blue-sandbank.jpg'),
    imageTBD: true,
    description: 'A premium picnic on a beach or sandbank — luxury decor, tropical fruits, seafood platters, drinks, drone photography and shaded lounges. Built for special occasions.',
    duration: 'Half / Full Day',
    group: '2 – 8 guests',
    highlights: ['Beach or sandbank setup', 'Drinks, fruit, seafood platter', 'Drone photography included'],
  },
  {
    id: 'proposal-honeymoon',
    title: 'Proposal & Honeymoon Packages',
    category: 'Multi-day Package',
    image: homeImg('mizingani-waterfront.jpg'),
    imageTBD: true,
    description: 'Bespoke romantic packages built around proposals, anniversaries and honeymoons. Private dhow cruises, photographers, flower decoration, luxury dinners and surprise touches.',
    duration: '1 – 7 days',
    group: 'Couples',
    highlights: ['Private dhow & sunset moments', 'Photographer for the moment', 'Hotel and dinner curation'],
  },
  {
    id: 'drone-content',
    title: 'Drone Photography & Vacation Content',
    category: 'Service',
    image: homeImg('stone-town-waterfront.webp'),
    imageTBD: true,
    description: 'A vacation content service — cinematic travel videos, drone reels, beach and couple photoshoots, social-media-ready edits delivered the day after.',
    duration: 'Half / Full Day',
    group: 'Solo, couple or family',
    highlights: ['Drone & DSLR', 'Cinematic travel video edit', 'Social-ready reel deliverables'],
  },
  {
    id: 'safari-extension',
    title: 'Zanzibar Safari Extension',
    category: 'Multi-day Package',
    image: img('safari-blue-sandbank.jpg'),
    imageTBD: true,
    description: 'Multi-day mainland safari combinations from Zanzibar — Serengeti, Ngorongoro, Selous, Mikumi or Tarangire — with bush flights, lodges, game drives and beach days bookending the trip.',
    duration: '3 – 10 days',
    group: '2 – 8 guests',
    highlights: ['All bush flights & transfers', 'Lodge or fly-camp options', 'Bush + beach combinations'],
  },
];
