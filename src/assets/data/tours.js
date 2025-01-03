// src/data/tours.js
import spiceTourImage from "../../assets/images/spicetour/spice.jpg";
import historicalCityTourImage from "../../assets/images/stonetown/stonetown.jpg";
import prisonIslandImage from "../../assets/images/prisonisland/prison.jpg";
import jozaniForestImage from "../../assets/images/jozaniforest/jozani.jpg";
import dolphinTourImage from "../../assets/images/dolphintour/dolphins.jpg";
import sunsetRockImage from "../../assets/images/sunsetrock/sunsetrock.jpg";
import snorkelingImage from "../../assets/images/snorkeling/snorkel.jpg";
import villageTourImage from "../../assets/images/villagetour/village.jpg";
import motorbikeImage from "../../assets/images/motorbike/motorbike.jpg";
import mnembaImage from "../../assets/images/mnemba/mnemba.jpg";
import safariBlueImage from "../../assets/images/safariblue/safariblue.jpg";
import localFishingImage from "../../assets/images/fishing/fishing.jpg";
import swimmingCaveImage from "../../assets/images/cave/maalum.jpg";
import sailingSunsetImage from "../../assets/images/sunsetsailing/sunsetsail.jpg";
import quadTourImage from "../../assets/images/quad/quadtour.jpg";

export const tours = [
  {
    id: "zanzibar-spice-culture-tour",
    title: "Spice Tour",
    description:
      "Explore the history and plantations of Zanzibar's spice trade. Dazzle your senses with fresh spices and learn about their uses in medicine, cosmetics, and cooking.",
    itinerary: [
      "Pickup from your hotel in the morning.",
      "Drive to spice plantations (approximately 30 minutes).",
      "Guided tour of the spice plantations, learning about the history and uses of spices.",
      "Taste fresh spices and exotic fruits.",
      "Enjoy an opulent lunch (if requested).",
      "Return to your hotel by early afternoon.",
    ],
    activities: [
      "Visit spice plantations",
      "Learn about traditional herbal medicine",
      "Taste spices and fruits",
      "Opulent lunch (on request)",
    ],
    duration: "Half-day",
    inclusions: ["Transport", "Guide", "Entrance fees", "Lunch (on request)"],
    whatToBring: ["Comfortable shoes", "Sunscreen", "Camera"],
    FAQs: [
      {
        question: "Is the tour suitable for children?",
        answer:
          "Yes, the tour is family-friendly and educational for all ages.",
      },
      {
        question: "Are vegetarian meal options available?",
        answer: "Yes, vegetarian options are available upon request.",
      },
    ],
    image: spiceTourImage,
    price: 60,
  },
  {
    id: "stone-town-heritage-walk",
    title: "Historical City Tour",
    description:
      "Take a fascinating walk through Stone Town and visit historical sites like the House of Wonders, Palace Museum, Dr. Livingston's House, and Arab Fort.",
    itinerary: [
      "Morning or afternoon pickup from your hotel.",
      "Begin the guided walk through Stone Town's narrow streets.",
      "Visit key landmarks: House of Wonders, Palace Museum, and Arab Fort.",
      "Explore vibrant markets and local artisan shops.",
      "Enjoy a refreshing local snack before returning to your hotel.",
    ],
    activities: [
      "Guided walk through Stone Town",
      "Visit historical sites",
      "Explore markets and shops",
    ],
    duration: "Half-day",
    inclusions: ["Guide", "Entrance fees"],
    whatToBring: ["Comfortable walking shoes", "Hat", "Water bottle"],
    FAQs: [
      {
        question: "Is Stone Town safe for tourists?",
        answer:
          "Yes, Stone Town is safe, and our guides ensure a secure experience.",
      },
      {
        question: "Can I purchase souvenirs during the tour?",
        answer:
          "Yes, there will be opportunities to buy local crafts and souvenirs.",
      },
    ],
    image: historicalCityTourImage,
    price: 50,
  },
  {
    id: "prison-island-boat-trip",
    title: "Prison Island Boat Trip",
    description:
      "Escape to Prison Island, home to giant tortoises and a beautiful coral reef. Enjoy snorkeling, sunbathing, and a visit to the historic prison.",
    itinerary: [
      "Pickup from your hotel in the morning.",
      "Board a traditional boat to Prison Island.",
      "Tour the historic prison and learn its history.",
      "Meet the giant tortoises in the sanctuary.",
      "Optional snorkeling session to explore the coral reef.",
      "Relax on the beach before returning to the mainland.",
    ],
    activities: [
      "Visit Prison Island",
      "See giant tortoises",
      "Snorkeling",
      "Sunbathing",
    ],
    duration: "Half-day or Full-day",
    inclusions: ["Boat ride", "Entrance fees", "Snorkeling equipment"],
    whatToBring: ["Swimwear", "Sunscreen", "Towel"],
    FAQs: [
      {
        question: "Can non-swimmers join this tour?",
        answer: "Yes, non-swimmers can enjoy the land-based activities.",
      },
      {
        question: "Are life jackets provided?",
        answer: "Yes, life jackets are available for all participants.",
      },
    ],
    image: prisonIslandImage,
    price: 70,
  },
  {
    id: "jozani-forest-tour",
    title: "Jozani Forest Tour",
    description:
      "Explore the Jozani Forest, home to the rare red colobus monkey and other wildlife. Walk through the impressive flora and fauna on a guided nature trail.",
    itinerary: [
      "Pickup from your hotel in the morning.",
      "Drive to Jozani Forest (approximately 1 hour).",
      "Begin the guided nature walk through the forest trails.",
      "Spot red colobus monkeys and learn about their conservation.",
      "Visit the mangrove boardwalk to explore unique ecosystems.",
      "Relax and enjoy light refreshments before the return journey.",
    ],
    activities: [
      "Guided nature trail",
      "See red colobus monkeys",
      "Spot other wildlife",
      "Mangrove boardwalk exploration",
    ],
    duration: "Half-day",
    inclusions: ["Transport", "Entrance fee", "Guide"],
    whatToBring: ["Comfortable walking shoes", "Sunscreen", "Bug repellent"],
    FAQs: [
      {
        question: "Can children participate in this tour?",
        answer:
          "Yes, this tour is suitable for all ages. The trails are family-friendly.",
      },
      {
        question: "Are there restrooms in the forest?",
        answer:
          "Yes, there are basic restroom facilities at the forest entrance.",
      },
    ],
    image: jozaniForestImage,
    price: 65,
  },
  {
    id: "dolphin-tour",
    title: "Dolphin Tour",
    description:
      "Visit Kizimkazi fishing village and take a boat trip to see schools of bottle-nosed and humpback dolphins. Swim close to the dolphins and visit a 12th-century mosque.",
    itinerary: [
      "Early morning pickup from your hotel.",
      "Drive to Kizimkazi fishing village (approximately 1 hour).",
      "Board a boat and begin the dolphin sighting adventure.",
      "Optional swim with the dolphins in their natural habitat.",
      "Visit the historical 12th-century mosque in Kizimkazi.",
      "Return to your hotel by noon.",
    ],
    activities: [
      "Boat trip to see dolphins",
      "Swim with dolphins",
      "Visit 12th-century mosque",
    ],
    duration: "Half-day",
    inclusions: ["Transport", "Guide", "Boat", "Snorkeling equipment"],
    whatToBring: ["Swimwear", "Sunscreen", "Towel", "Camera"],
    FAQs: [
      {
        question: "Is swimming with dolphins guaranteed?",
        answer:
          "Dolphin sightings are likely but not guaranteed as they are wild animals.",
      },
      {
        question: "Is the tour suitable for non-swimmers?",
        answer: "Yes, non-swimmers can stay on the boat and enjoy the sights.",
      },
    ],
    image: dolphinTourImage,
    price: 75,
  },
  {
    id: "sunset-the-rock-restaurant",
    title: "Sunset & The Rock Restaurant",
    description:
      "Watch the breathtaking sunset at Michamvi beach on the east coast. Visit the famous Rock Restaurant, situated on a rock in the ocean.",
    itinerary: [
      "Afternoon pickup from your hotel.",
      "Drive to Michamvi beach for sunset views.",
      "Relax and enjoy the serene atmosphere at the beach.",
      "Visit The Rock Restaurant for a unique dining experience (optional, reservation required).",
      "Return to your hotel in the evening.",
    ],
    activities: ["Watch the sunset", "Swim", "Visit The Rock Restaurant"],
    duration: "Evening",
    inclusions: ["Transport"],
    whatToBring: ["Casual attire", "Camera", "Swimwear (optional)"],
    FAQs: [
      {
        question: "Is dinner included in the price?",
        answer:
          "No, dinner at The Rock Restaurant is optional and at your own expense.",
      },
      {
        question: "Can I visit The Rock without dining there?",
        answer: "Yes, but reservations are recommended for access.",
      },
    ],
    image: sunsetRockImage,
    price: 40,
  },
  {
    id: "snorkeling",
    title: "Snorkeling",
    description:
      "Discover the rich coral reefs and abundant sea life at the Blue Lagoon on the east coast. Enjoy snorkeling in the clear waters during low tide.",
    itinerary: [
      "Morning pickup from your hotel.",
      "Drive to the snorkeling site (approximately 1 hour).",
      "Receive a safety briefing and equipment orientation.",
      "Enjoy snorkeling at the Blue Lagoon, exploring vibrant marine life.",
      "Relax and enjoy light refreshments before returning to your hotel.",
    ],
    activities: [
      "Snorkeling",
      "Explore coral reefs",
      "Spot various fish species",
    ],
    duration: "Half-day",
    inclusions: [
      "Snorkeling equipment",
      "Guide",
      "Transport",
      "Light refreshments",
    ],
    whatToBring: ["Swimwear", "Sunscreen", "Towel"],
    FAQs: [
      {
        question: "Do I need prior snorkeling experience?",
        answer:
          "No, the tour is suitable for beginners and experienced snorkelers alike.",
      },
      {
        question: "Is snorkeling equipment provided?",
        answer: "Yes, all necessary equipment is included.",
      },
    ],
    image: snorkelingImage,
    price: 45,
  },
  {
    id: "village-tour",
    title: "Village Tour",
    description:
      "Take a walking tour to the local village of Bwejuu and interact with the locals. Visit local shops, houses, and the charity school to learn about the local way of life.",
    itinerary: [
      "Pickup from your hotel in the morning.",
      "Drive to Bwejuu village (approximately 30 minutes).",
      "Guided walking tour through the village, meeting locals and exploring daily life.",
      "Visit the local charity school and learn about its initiatives.",
      "Relax with light refreshments before returning to your hotel.",
    ],
    activities: [
      "Walking tour of Bwejuu village",
      "Visit local shops and houses",
      "Visit charity school",
    ],
    duration: "Half-day",
    inclusions: ["Local guide", "Transport", "Refreshments"],
    whatToBring: ["Comfortable shoes", "Sunscreen", "Water bottle"],
    FAQs: [
      {
        question: "Can I bring donations for the school?",
        answer: "Yes, donations are welcome and greatly appreciated.",
      },
      {
        question: "Is this tour suitable for families?",
        answer: "Yes, it's a great experience for families and children.",
      },
    ],
    image: villageTourImage,
    price: 30,
  },
  {
    id: "motorbike-renting",
    title: "Motorbike Renting",
    description:
      "Explore the island independently by renting a motorbike. Choose from Vespas, automatic scooters, or 250cc Honda motorbikes. A valid license is required.",
    itinerary: [
      "Morning pickup from your hotel or meet at the rental location.",
      "Choose your preferred motorbike model (Vespa, scooter, or 250cc).",
      "Receive a safety briefing and a local map for navigation.",
      "Explore the island independently at your own pace, visiting beaches, villages, or other attractions.",
      "Return the motorbike by the agreed time.",
    ],
    activities: [
      "Rent a motorbike",
      "Explore the island independently",
      "Discover beaches and local attractions",
    ],
    duration: "Full-day",
    inclusions: ["Motorbike rental", "Driving permit", "Helmets"],
    whatToBring: ["Valid driving license", "Sunscreen", "Comfortable clothing"],
    FAQs: [
      {
        question: "Do I need prior experience riding a motorbike?",
        answer:
          "Yes, prior riding experience and a valid license are required.",
      },
      {
        question: "Are fuel costs included in the rental price?",
        answer:
          "No, fuel costs are not included. You will need to refuel as needed.",
      },
    ],
    image: motorbikeImage,
    price: 25,
  },
  {
    id: "mnemba-snorkeling-trip-north",
    title: "Mnemba Snorkeling & Trip to the North",
    description:
      "Snorkel in the crystal-clear waters of Mnemba Island, a private conserved island in the northeast. Spot a variety of fish and enjoy the beautiful beach of Nungwi.",
    itinerary: [
      "Morning pickup from your hotel.",
      "Drive to the boat departure point (approximately 1.5 hours).",
      "Board a traditional dhow or motorboat to Mnemba Island.",
      "Snorkel in the protected waters around Mnemba, exploring vibrant marine life.",
      "Break for lunch on the beach at Nungwi village.",
      "Relax on Nungwi beach before returning to your hotel in the evening.",
    ],
    activities: [
      "Snorkeling at Mnemba Island",
      "Relax on Nungwi beach",
      "Explore marine life",
    ],
    duration: "Full-day",
    inclusions: [
      "Transport",
      "Guide",
      "Boat ride",
      "Entrance fees",
      "Snorkeling equipment",
    ],
    whatToBring: ["Swimwear", "Towel", "Sunscreen"],
    FAQs: [
      {
        question: "Is lunch included in the tour?",
        answer: "Yes, a delicious seafood lunch is included.",
      },
      {
        question: "Can non-swimmers join this tour?",
        answer: "Yes, non-swimmers can enjoy the beach and boat ride.",
      },
    ],
    image: mnembaImage,
    price: 90,
  },
  {
    id: "dhow-snorkeling-safari-blue",
    title: "Safari Blue",
    description:
      "Embark on a full-day excursion on traditional sailing dhows. Swim, sunbathe, and explore the sandbank in Menai Bay. Enjoy traditional seafood lunch and refreshments.",
    itinerary: [
      "Morning pickup from your hotel.",
      "Drive to Fumba village (approximately 1 hour).",
      "Board a traditional dhow and set sail to Menai Bay.",
      "Explore sandbanks, snorkel, and swim in the crystal-clear waters.",
      "Enjoy a seafood lunch served on Kwale Island.",
      "Sail back to Fumba village and return to your hotel in the evening.",
    ],
    activities: [
      "Dhow sailing",
      "Swimming",
      "Snorkeling",
      "Sandbank exploration",
    ],
    duration: "Full-day",
    inclusions: ["Food", "Soft drinks", "Boat trip", "Transport"],
    whatToBring: ["Swimwear", "Towel", "Sunscreen", "Camera"],
    FAQs: [
      {
        question: "Is the tour suitable for children?",
        answer: "Yes, the tour is family-friendly and suitable for all ages.",
      },
      {
        question: "Do I need to bring snorkeling equipment?",
        answer: "No, all equipment is provided.",
      },
    ],
    image: safariBlueImage,
    price: 85,
  },
  {
    id: "local-game-fishing",
    title: "Local Game Fishing",
    description:
      "Join a Zanzibarian fisherman on a traditional dhow and experience fishing for a living. Use simple fishing gear to catch kingfish, yellowfin tuna, barracuda, and grouper.",
    itinerary: [
      "Early morning pickup from your hotel.",
      "Drive to the fishing village (approximately 1 hour).",
      "Board a traditional dhow and begin the fishing adventure.",
      "Learn traditional fishing techniques and try your luck catching fish.",
      "Break for refreshments and snacks on the dhow.",
      "Return to the mainland and drive back to your hotel.",
    ],
    activities: ["Fishing with local fishermen", "Traditional dhow sailing"],
    duration: "Half-day or Full-day",
    inclusions: [
      "Boat ride",
      "Fishing guide",
      "Local fishing gear",
      "Fruits",
      "Soft drinks",
    ],
    whatToBring: ["Hat", "Sunscreen", "Comfortable clothing"],
    FAQs: [
      {
        question: "Do I need fishing experience?",
        answer:
          "No, the tour is suitable for beginners and experienced fishers.",
      },
      {
        question: "Can I keep the fish I catch?",
        answer: "Yes, you can keep or release your catch, as you prefer.",
      },
    ],
    image: localFishingImage,
    price: 60,
  },
  {
    id: "swimming-cave",
    title: "Swimming in the Cave",
    description:
      "Visit Maalum, a beautiful natural water swimming cave on the East Coast of Zanzibar. Relax, swim, and enjoy the wonders of this special place.",
    itinerary: [
      "Morning pickup from your hotel.",
      "Drive to Maalum cave (approximately 1 hour).",
      "Enjoy a refreshing swim in the natural cave pool.",
      "Relax and take photos in the serene environment.",
      "Return to your hotel by early afternoon.",
    ],
    activities: ["Swimming in the cave", "Relaxation"],
    duration: "Half-day",
    inclusions: ["Transport", "Water"],
    whatToBring: ["Swimwear", "Towel", "Waterproof bag"],
    FAQs: [
      {
        question: "Is the cave suitable for children?",
        answer: "Yes, children can swim under parental supervision.",
      },
      {
        question: "Is the water cold?",
        answer: "The water is cool and refreshing, perfect for a swim.",
      },
    ],
    image: swimmingCaveImage,
    price: 35,
  },
];
