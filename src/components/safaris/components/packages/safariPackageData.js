// safariPackageData.js
const safariPackages = [
  {
    title: "Classic Northern Circuit Safari",
    duration: "6 Days / 5 Nights",
    destinations: "Tarangire National Park, Lake Manyara National Park, Serengeti National Park, Ngorongoro Crater",
    bestFor: "First-time safari travelers, wildlife enthusiasts",
    highlights: [
      "Game drives in Tarangire, famous for elephants and baobab trees",
      "Spot tree-climbing lions in Lake Manyara",
      "Witness the Big Five in the Serengeti and Ngorongoro Crater",
      "Stay in comfortable lodges or tented camps",
    ],
    prices: {
      budget: "$2,100 per person",  // Updated based on average 2025 rates
      midRange: "$2,800 per person",
      luxury: "$4,500 per person",
    },
  },
  {
    title: "The Great Migration Safari",
    duration: "8 Days / 7 Nights",
    destinations: "Serengeti National Park, Ngorongoro Crater",
    bestFor: "Wildlife lovers, photographers",
    highlights: [
      "Follow the Great Migration (seasonal: December–July)",
      "Witness dramatic river crossings (July–October)",
      "Experience the iconic Serengeti plains",
      "Explore the Ngorongoro Crater for diverse wildlife",
    ],
    prices: {
      budget: "$2,800 per person",  // Aligned with 2025 migration tour averages
      midRange: "$4,000 per person",
      luxury: "$6,000 per person",
    },
  },
  {
    title: "Tanzania & Zanzibar Safari",
    duration: "10 Days / 9 Nights",
    destinations: "Tarangire, Serengeti, Ngorongoro Crater, Zanzibar",
    bestFor: "Honeymooners, relaxation seekers",
    highlights: [
      "Big Five safari in Tanzania's top parks",
      "Luxury beach escape in Zanzibar",
      "Explore Stone Town, Spice Tour, and Snorkeling excursions",
      "Enjoy a mix of adventure and relaxation",
    ],
    prices: {
      midRange: "$4,000 per person",  // Reflects 2025 combined safari-beach package costs
      luxury: "$6,500 per person",
    },
  },
  {
    title: "Short Safari from Zanzibar",
    duration: "3 Days / 2 Nights",
    destinations: "Serengeti or Nyerere National Park (Selous)",
    bestFor: "Travelers with limited time",
    highlights: [
      "Fly from Zanzibar for quick access to mainland wildlife",
      "Game drives in Serengeti or Nyerere, spotting elephants, lions, and more",
      "Overnight in tented camps or lodges",
      "Return flights and transfers included",
    ],
    prices: {
      budget: "$1,300 per person",  // Updated for 2025 short fly-in safaris
      midRange: "$2,000 per person",
      luxury: "$2,800 per person",
    },
    includes: [
      "Round-trip flights from Zanzibar",
      "Accommodations and meals",
      "Game drives in a 4x4 safari vehicle",
      "Park entrance fees",
      "Professional safari guide",
    ],
    excludes: [
      "Travel insurance",
      "Tips & personal expenses",
    ],
  },
  {
    title: "Serengeti National Park – Day Safari from Zanzibar",  // New addition to match recommendations
    duration: "1 Day",
    destinations: "Serengeti National Park",
    bestFor: "Iconic wildlife and Big Five sightings in a world-famous park",
    highlights: [
      "Flight from Zanzibar to Serengeti (~1-1.5 hours)",
      "Full-day game drive spotting lions, elephants, cheetahs, and possibly the Great Migration",
      "Picnic lunch in the park",
      "Flight back to Zanzibar by evening",
    ],
    prices: {
      budget: "$550 per person",  // Based on 2025 fly-in day rates
      luxury: "$1,100 per person",
    },
    includes: [
      "Round-trip flights Zanzibar – Serengeti",
      "Game drive in a 4x4 safari vehicle",
      "Park entrance fees",
      "Professional safari guide",
      "Lunch in the park",
    ],
    excludes: [
      "Travel insurance",
      "Tips & personal expenses",
    ],
  },
  {
    title: "Nyerere National Park (Selous) – Day Safari from Zanzibar",
    duration: "1 Day",
    destinations: "Nyerere National Park (Selous)",
    bestFor: "A mix of wildlife game drives and boat safaris in a less crowded park",
    highlights: [
      "Flight from Zanzibar to Nyerere (Selous) (~1 hour)",
      "Game drive through the park, famous for elephants, lions, giraffes, and hippos",
      "Option for a boat safari on the Rufiji River",
      "Flight back to Zanzibar, arriving by sunset",
    ],
    prices: {
      budget: "$550 per person",  // Adjusted to 2025 averages from fly-in data
      luxury: "$1,000 per person",
    },
    includes: [
      "Round-trip flights Zanzibar – Safari Park",
      "Game drive in a 4x4 safari vehicle",
      "Park entrance fees",
      "Professional safari guide",
      "Lunch in the park",
    ],
    excludes: [
      "Travel insurance",
      "Tips & personal expenses",
    ],
  },
  {
    title: "Mikumi National Park – Day Safari from Zanzibar",
    duration: "1 Day",
    destinations: "Mikumi National Park",
    bestFor: "A budget-friendly, shorter safari with excellent wildlife sightings",
    highlights: [
      "Flight from Zanzibar to Mikumi (~1 hour)",
      "Game drive in Mikumi, home to lions, elephants, zebras, and buffalo",
      "Flight back to Zanzibar",
    ],
    prices: {
      budget: "$500 per person",  // Updated based on 2025 day trip quotes
      luxury: "$900 per person",
    },
    includes: [
      "Round-trip flights Zanzibar – Safari Park",
      "Game drive in a 4x4 safari vehicle",
      "Park entrance fees",
      "Professional safari guide",
      "Lunch in the park",
    ],
    excludes: [
      "Travel insurance",
      "Tips & personal expenses",
    ],
  },
];

// Helper constant to identify multi-day vs day safaris (updated to 4 for the new structure)
const MULTI_DAY_SAFARI_COUNT = 4;

export { safariPackages, MULTI_DAY_SAFARI_COUNT };