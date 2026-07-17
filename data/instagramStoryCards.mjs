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
];

export const INSTAGRAM_STORY_CARD_BY_ID = new Map(INSTAGRAM_STORY_CARDS.map((card) => [card.id, card]));
