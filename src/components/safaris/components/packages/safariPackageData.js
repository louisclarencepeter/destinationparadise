// safariPackageData.js
const safariPackages = [
    {
      title: "Classic Northern Circuit Safari",
      duration: "6 Days / 5 Nights",
      destinations:
        "Tarangire National Park, Lake Manyara National Park, Serengeti National Park, Ngorongoro Crater",
      bestFor: "First-time safari travelers, wildlife enthusiasts",
      highlights: [
        "Game drives in Tarangire, famous for elephants and baobab trees",
        "Spot tree-climbing lions in Lake Manyara",
        "Witness the Big Five in the Serengeti and Ngorongoro Crater",
        "Stay in comfortable lodges or tented camps",
      ],
      prices: {
        budget: "$1,900 per person",
        midRange: "$2,500 per person",
        luxury: "$4,000 per person",
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
        budget: "$2,500 per person",
        midRange: "$3,500 per person",
        luxury: "$5,500 per person",
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
        midRange: "$3,800 per person",
        luxury: "$6,000 per person",
      },
    },
    {
      title: "Short Safari from Zanzibar",
      duration: "3 Days / 2 Nights",
      destinations: "Serengeti or Nyerere National Park (Selous)",
      bestFor: "Travelers with limited time",
      highlights: [
        "Fly from Zanzibar to Serengeti or Selous",
        "Experience thrilling game drives in a short time",
        "Perfect for those on a Zanzibar beach holiday",
      ],
      prices: {
        midRange: "$1,500 per person",
        luxury: "$2,800 per person",
      },
    },
    {
      title: "Southern Tanzania Safari",
      duration: "7 Days / 6 Nights",
      destinations: "Nyerere (Selous) & Ruaha National Parks",
      bestFor: "Off-the-beaten-path travelers",
      highlights: [
        "Remote safari with fewer crowds",
        "Boat safaris on the Rufiji River",
        "Excellent predator sightings in Ruaha",
        "Great for repeat safari-goers looking for something different",
      ],
      prices: {
        midRange: "$3,200 per person",
        luxury: "$5,000 per person",
      },
    },
    {
      title: "Chimpanzee Trekking & Safari",
      duration: "7 Days / 6 Nights",
      destinations: "Mahale Mountains, Katavi National Park",
      bestFor: "Adventure seekers, primate lovers",
      highlights: [
        "Trek wild chimpanzees in Mahale Mountains",
        "Explore the untouched wilderness of Katavi",
        "Enjoy a mix of boat safaris, walking safaris, and game drives",
      ],
      prices: {
        midRange: "$4,500 per person",
        luxury: "$7,000 per person",
      },
    },
    {
      title: "Serengeti National Park – Day Safari from Zanzibar",
      duration: "1 Day",
      destinations: "Serengeti National Park",
      bestFor: "Witnessing the Big Five and the Serengeti's vast plains",
      highlights: [
        "Early flight from Zanzibar to Serengeti (~1.5 hours)",
        "Full-day game drive in Serengeti",
        "Spot lions, elephants, giraffes, and possibly the Great Migration (seasonal)",
        "Flight back to Zanzibar, arriving in the late evening",
      ],
      prices: {
        budget: "$800 per person",
        luxury: "$1,500 per person",
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
        budget: "$600 per person",
        luxury: "$1,200 per person",
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
        budget: "$500 per person",
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
  ];
  
  // Helper constant to identify multi-day vs day safaris
  const MULTI_DAY_SAFARI_COUNT = 6;
  
  export { safariPackages, MULTI_DAY_SAFARI_COUNT };