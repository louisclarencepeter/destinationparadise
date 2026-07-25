// The publish pipeline renders photos only (webp sources re-encoded to JPEG);
// anything else is rejected by Meta with "Only photo or video can be accepted
// as media type." (code 9004). Shared by the story script and the image endpoint.
export const INSTAGRAM_STORY_ALLOWED_SOURCE = /^\/assets\/images\/(home|excursions|safaris)\/[a-z0-9/-]+\.webp$/;

// Editorially approved Story queue. Keep each image, title, and caption together.
export const INSTAGRAM_STORY_CARDS = [
  { id: 'safari-blue-dhow', source: '/assets/images/excursions/trips/safari-blue-dhow.webp', title: 'Safari Blue', caption: 'A day on clear water, a traditional boat, and time to slow down.' },
  { id: 'stone-town-old-fort', source: '/assets/images/excursions/stone-town-old-fort.webp', title: 'Stone Town Stories', caption: 'Walk the old streets with a local guide and discover the island beyond the beach.' },
  { id: 'jozani-red-colobus', source: '/assets/images/excursions/jozani-red-colobus.webp', title: 'Jozani Forest', caption: 'Meet Zanzibar’s rare red colobus monkeys in the island’s last indigenous forest.' },
  { id: 'prison-island-tortoise', source: '/assets/images/excursions/prison-island-tortoise.webp', title: 'Prison Island', caption: 'Giant Aldabra tortoises, a short boat ride, and time for a swim in clear water.' },
  { id: 'dream-dhow-sunset', source: '/assets/images/excursions/dream-dhow-sunset.webp', title: 'Sunset by Dhow', caption: 'End the day on the Indian Ocean as Zanzibar’s sky turns gold.' },
  { id: 'dolphin-snorkeling', source: '/assets/images/excursions/dolphin-snorkeling.webp', title: 'Ocean Morning', caption: 'Set out early for the south coast, then snorkel in Zanzibar’s warm blue water.' },
  { id: 'spice-tour', source: '/assets/images/excursions/trips/spice-tour.webp', title: 'The Spice Island', caption: 'Cloves, cinnamon, nutmeg, and a Swahili lunch straight from the plantation.' },
  { id: 'mnemba-snorkeling', source: '/assets/images/excursions/trips/mnemba-snorkeling.webp', title: 'Mnemba Day Out', caption: 'Good company, a day on the boat, and Zanzibar’s bright blue water all around.' },
  { id: 'private-sunset-dhow', source: '/assets/images/excursions/trips/private-sunset-dhow.webp', title: 'Sunset on the Sand', caption: 'Take the evening slowly and watch the Indian Ocean turn gold.' },
  { id: 'organic-spice-farm', source: '/assets/images/excursions/trips/organic-spice-farm.webp', title: 'A Spice Farm Welcome', caption: 'Fresh coconut, generous local hospitality, and a taste of Zanzibar’s spice country.' },
  { id: 'nakupenda-sandbank', source: '/assets/images/excursions/trips/nakupenda-sandbank.webp', title: 'Sandbank Escape', caption: 'White sand, an open horizon, and nowhere else you need to be.' },
  { id: 'wellness-yoga-beach', source: '/assets/images/excursions/trips/wellness-yoga-beach.webp', title: 'Golden Hour', caption: 'A simple evening by the sea, shared with the people you came to Zanzibar with.' },
  { id: 'aerial-zanzibar-water', source: '/assets/images/home/aerial-boats-turquoise-water-600w.webp', title: 'Zanzibar From Above', caption: 'From above, the Indian Ocean reveals every shade of blue.' },
  { id: 'mizingani-waterfront', source: '/assets/images/home/mizingani-waterfront-600w.webp', title: 'A Waterfront Morning', caption: 'Palms, sea air, and an unhurried start along Stone Town’s waterfront.' },
  { id: 'stone-town-seafront', source: '/assets/images/home/stone-town-waterfront.webp', title: 'Where History Meets the Sea', caption: 'Centuries of island history unfold beside Stone Town’s blue horizon.' },
  { id: 'blue-lagoon-reef', source: '/assets/images/excursions/trips/blue-lagoon-snorkeling.webp', title: 'Beneath Zanzibar', caption: 'Clear water, bright reef fish, and a gentler pace below the surface.' },
  { id: 'chumbe-coral-park', source: '/assets/images/excursions/trips/chumbe-coral-reef.webp', title: 'Chumbe Coral Park', caption: 'Protected reef, clear water, and conservation at the heart of the day.' },
  { id: 'spice-in-your-hands', source: '/assets/images/excursions/trips/cooking-coffee-spices.webp', title: 'Taste the Spice Island', caption: 'Touch, taste, and discover how Zanzibar’s famous spices grow.' },
  { id: 'dhow-heritage', source: '/assets/images/excursions/trips/dhow-building.webp', title: 'Dhow Heritage', caption: 'Hand-built wooden boats still carry Zanzibar’s Indian Ocean story.' },
  { id: 'pange-sandbank', source: '/assets/images/excursions/trips/pange-sandbank.webp', title: 'Pange Sandbank', caption: 'A ribbon of white sand surrounded by open blue water.' },
  { id: 'the-rock-zanzibar', source: '/assets/images/excursions/trips/the-rock-restaurant.webp', title: 'An Island Icon', caption: 'The Rock rises from the tide on Zanzibar’s beautiful east coast.' },
  { id: 'zanzibar-historical-ruins', source: '/assets/images/excursions/trips/historical-ruins.webp', title: 'Zanzibar Through Time', caption: 'Palaces, old façades, and stories shaped by centuries of island history.' },
  { id: 'buffalo-country', source: '/assets/images/safaris/buffalo-herd-close.webp', title: 'Buffalo Country', caption: 'A powerful safari encounter on Tanzania’s open plains.' },
  { id: 'yellow-weaver', source: '/assets/images/safaris/yellow-weaver-on-rail.webp', title: 'Safari in the Details', caption: 'The smallest flashes of colour can become unforgettable safari moments.' },
  { id: 'eland-herd', source: '/assets/images/safaris/eland-herd-plains.webp', title: 'Across the Plains', caption: 'Eland move quietly through Tanzania’s wide landscapes.' },
  { id: 'lion-cub', source: '/assets/images/safaris/lion-cub-in-grass.webp', title: 'Young Explorer', caption: 'A lion cub discovers the grasslands one careful step at a time.' },
  { id: 'lioness-and-cub', source: '/assets/images/safaris/lioness-and-cub-resting.webp', title: 'A Quiet Family Moment', caption: 'A lioness and her cub rest together between journeys across the plains.' },
  { id: 'male-lion', source: '/assets/images/safaris/male-lion-in-grass.webp', title: 'Lion on the Plains', caption: 'A male lion watches over the grasslands on a quiet safari morning.' },
  { id: 'rhino-on-plains', source: '/assets/images/safaris/rhino-on-plains.webp', title: 'A Rare Encounter', caption: 'A rhino on the open plain is a safari moment that stays with you.' },
  { id: 'zebra-family', source: '/assets/images/safaris/zebra-mare-and-foal.webp', title: 'Together on Safari', caption: 'A zebra mare keeps her foal close on Tanzania’s green plains.' },
];

// One-time migration seed for images published by the former local scheduler.
// These were posted to the same Instagram account but are not all present in
// the cloud scheduler's retained log.
export const INSTAGRAM_STORY_PUBLISHED_HISTORY_SEED = [
  'safari-blue-dhow',
  'stone-town-old-fort',
  'jozani-red-colobus',
  'prison-island-tortoise',
  'dream-dhow-sunset',
  'dolphin-snorkeling',
  'spice-tour',
  'mnemba-snorkeling',
  'private-sunset-dhow',
];

export const INSTAGRAM_STORY_CARD_BY_ID = new Map(INSTAGRAM_STORY_CARDS.map((card) => [card.id, card]));
