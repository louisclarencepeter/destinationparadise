import { tourImages } from './tourImages';
import { createTourDescription } from './tourDescriptions';
import { tourInclusions } from './tourInclusion';
import { tourActivities } from './tourActivities';
import { whatToBring } from './whatToBring';
import { tourFaqs } from './tourFaqs';

export const tours = [
  {
    id: "zanzibar-spice-culture-tour",
    ...createTourDescription(
      "Spice Tour",
      "Explore the history and plantations of Zanzibar's spice trade. Dazzle your senses with fresh spices and learn about their uses in medicine, cosmetics, and cooking.",
      [
        "Pickup from your hotel in the morning.",
        "Drive to spice plantations (approximately 30 minutes).",
        "Guided tour of the spice plantations, learning about the history and uses of spices.",
        "Taste fresh spices and exotic fruits.",
        "Enjoy an opulent lunch (if requested).",
        "Return to your hotel by early afternoon.",
      ],
      "Half-day",
      tourImages.spiceTour,
      60
    ),
    ...tourInclusions.spiceTour,
    ...tourActivities.spiceTour,
    ...whatToBring.spiceTour,
    FAQs: tourFaqs.spiceTour,
  },
  {
    id: "stone-town-heritage-walk",
    ...createTourDescription(
      "Historical City Tour",
      "Take a fascinating walk through Stone Town and visit historical sites like the House of Wonders, Palace Museum, Dr. Livingston's House, and Arab Fort.",
      [
        "Morning or afternoon pickup from your hotel.",
        "Begin the guided walk through Stone Town's narrow streets.",
        "Visit key landmarks: House of Wonders, Palace Museum, and Arab Fort.",
        "Explore vibrant markets and local artisan shops.",
        "Enjoy a refreshing local snack before returning to your hotel.",
      ],
      "Half-day",
      tourImages.historicalCityTour,
      50
    ),
    ...tourInclusions.historicalCityTour,
    ...tourActivities.historicalCityTour,
    ...whatToBring.historicalCityTour,
    FAQs: tourFaqs.historicalCityTour,
  },
  {
    id: "prison-island-boat-trip",
    ...createTourDescription(
      "Prison Island Boat Trip",
      "Escape to Prison Island, home to giant tortoises and a beautiful coral reef. Enjoy snorkeling, sunbathing, and a visit to the historic prison.",
      [
        "Pickup from your hotel in the morning.",
        "Board a traditional boat to Prison Island.",
        "Tour the historic prison and learn its history.",
        "Meet the giant tortoises in the sanctuary.",
        "Optional snorkeling session to explore the coral reef.",
        "Relax on the beach before returning to the mainland.",
      ],
      "Half-day or Full-day",
      tourImages.prisonIsland,
      70
    ),
    ...tourInclusions.prisonIsland,
    ...tourActivities.prisonIsland,
    ...whatToBring.prisonIsland,
    FAQs: tourFaqs.prisonIsland,
  },
  {
    id: "jozani-forest-tour",
    ...createTourDescription(
      "Jozani Forest Tour",
      "Explore the Jozani Forest, home to the rare red colobus monkey and other wildlife. Walk through the impressive flora and fauna on a guided nature trail.",
      [
        "Pickup from your hotel in the morning.",
        "Drive to Jozani Forest (approximately 1 hour).",
        "Begin the guided nature walk through the forest trails.",
        "Spot red colobus monkeys and learn about their conservation.",
        "Visit the mangrove boardwalk to explore unique ecosystems.",
        "Relax and enjoy light refreshments before the return journey.",
      ],
      "Half-day",
      tourImages.jozaniForest,
      65
    ),
    ...tourInclusions.jozaniForest,
    ...tourActivities.jozaniForest,
    ...whatToBring.jozaniForest,
    FAQs: tourFaqs.jozaniForest,
  },
  {
    id: "dolphin-tour",
    ...createTourDescription(
      "Dolphin Tour",
      "Visit Kizimkazi fishing village and take a boat trip to see schools of bottle-nosed and humpback dolphins. Swim close to the dolphins and visit a 12th-century mosque.",
      [
        "Early morning pickup from your hotel.",
        "Drive to Kizimkazi fishing village (approximately 1 hour).",
        "Board a boat and begin the dolphin sighting adventure.",
        "Optional swim with the dolphins in their natural habitat.",
        "Visit the historical 12th-century mosque in Kizimkazi.",
        "Return to your hotel by noon.",
      ],
      "Half-day",
      tourImages.dolphinTour,
      75
    ),
    ...tourInclusions.dolphinTour,
    ...tourActivities.dolphinTour,
    ...whatToBring.dolphinTour,
    FAQs: tourFaqs.dolphinTour,
  },
  {
    id: "mnemba-snorkeling-trip-north",
    ...createTourDescription(
      "Mnemba Snorkeling & Trip to the North",
      "Snorkel in the crystal-clear waters of Mnemba Island, a private conserved island in the northeast. Spot a variety of fish and enjoy the beautiful beach of Nungwi.",
      [
        "Morning pickup from your hotel.",
        "Drive to the boat departure point (approximately 1.5 hours).",
        "Board a traditional dhow or motorboat to Mnemba Island.",
        "Snorkel in the protected waters around Mnemba, exploring vibrant marine life.",
        "Break for lunch on the beach at Nungwi village.",
        "Relax on Nungwi beach before returning to your hotel in the evening.",
      ],
      "Full-day",
      tourImages.mnemba,
      90
    ),
    ...tourInclusions.mnembaSnorkeling,
    ...tourActivities.mnembaSnorkeling,
    ...whatToBring.mnembaSnorkeling,
    FAQs: tourFaqs.mnembaSnorkeling,
  },
  {
    id: "dhow-snorkeling-safari-blue",
    ...createTourDescription(
      "Safari Blue",
      "Embark on a full-day excursion on traditional sailing dhows. Swim, sunbathe, and explore the sandbank in Menai Bay. Enjoy traditional seafood lunch and refreshments.",
      [
        "Morning pickup from your hotel.",
        "Drive to Fumba village (approximately 1 hour).",
        "Board a traditional dhow and set sail to Menai Bay.",
        "Explore sandbanks, snorkel, and swim in the crystal-clear waters.",
        "Enjoy a seafood lunch served on Kwale Island.",
        "Sail back to Fumba village and return to your hotel in the evening.",
      ],
      "Full-day",
      tourImages.safariBlue,
      85
    ),
    ...tourInclusions.safariBlue,
    ...tourActivities.safariBlue,
    ...whatToBring.safariBlue,
    FAQs: tourFaqs.safariBlue,
  },
  {
    id: "local-game-fishing",
    ...createTourDescription(
      "Local Game Fishing",
      "Join a Zanzibarian fisherman on a traditional dhow and experience fishing for a living. Use simple fishing gear to catch kingfish, yellowfin tuna, barracuda, and grouper.",
      [
        "Early morning pickup from your hotel.",
        "Drive to the fishing village (approximately 1 hour).",
        "Board a traditional dhow and begin the fishing adventure.",
        "Learn traditional fishing techniques and try your luck catching fish.",
        "Break for refreshments and snacks on the dhow.",
        "Return to the mainland and drive back to your hotel.",
      ],
      "Half-day or Full-day",
      tourImages.localFishing,
      60
    ),
    ...tourInclusions.localFishing,
    ...tourActivities.localFishing,
    ...whatToBring.localFishing,
    FAQs: tourFaqs.localFishing,
  },
  {
    id: "swimming-cave",
    ...createTourDescription(
      "Swimming in the Cave",
      "Visit Maalum, a beautiful natural water swimming cave on the East Coast of Zanzibar. Relax, swim, and enjoy the wonders of this special place.",
      [
        "Morning pickup from your hotel.",
        "Drive to Maalum cave (approximately 1 hour).",
        "Enjoy a refreshing swim in the natural cave pool.",
        "Relax and take photos in the serene environment.",
        "Return to your hotel by early afternoon.",
      ],
      "Half-day",
      tourImages.swimmingCave,
      35
    ),
    ...tourInclusions.swimmingCave,
    ...tourActivities.swimmingCave,
    ...whatToBring.swimmingCave,
    FAQs: tourFaqs.swimmingCave,
  },
];
