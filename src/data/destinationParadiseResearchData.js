export const destinationParadiseResearchData = {

  brand: {
    name: "Destination Paradise Zanzibar",
    positioning: "Premium Zanzibar & Tanzania Experience Brand",
    focus: [
      "Luxury Experiences",
      "Safari + Beach Packages",
      "Honeymoon Travel",
      "Adventure Tourism",
      "Cultural Experiences",
      "Fly-In Safaris",
      "VIP Experiences"
    ]
  },

  statistics: {
    originalExcursions: 17,
    combinedExcursions: 6,
    additionalExperiences: 40,
    safariRoutes: 9,
    safariStyles: 8,
    totalOfferings: 80
  },

  safariPricingResearch: {

    parkFees: {
      serengeti: {
        entryFee: 82.6,
        concessionFee: 70.8,
        currency: "USD"
      },

      ngorongoro: {
        entryFee: 70,
        craterVehicleFee: 295,
        rangerFee: 40,
        currency: "USD"
      },

      tarangire: {
        entryFee: 59,
        concessionFee: 47.8,
        currency: "USD"
      },

      lakeManyara: {
        entryFee: 59,
        concessionFee: 47.8,
        currency: "USD"
      },

      ruaha: {
        entryFee: 35.4,
        concessionFee: 35.4,
        currency: "USD"
      },

      mahale: {
        entryFee: 94.4,
        chimpPermitEstimate: 100,
        currency: "USD"
      }
    },

    safariCostRanges: {
      budget: {
        min: 200,
        max: 350,
        unit: "USD/day"
      },

      midRange: {
        min: 350,
        max: 600,
        unit: "USD/day"
      },

      luxury: {
        min: 600,
        max: 1500,
        unit: "USD/day"
      }
    },

    domesticFlights: {
      zanzibarToArusha: {
        min: 50,
        max: 150,
        currency: "USD"
      },

      zanzibarToNyerere: {
        min: 130,
        max: 250,
        currency: "USD"
      },

      zanzibarToRuaha: {
        min: 180,
        max: 300,
        currency: "USD"
      }
    }
  },

  safariRoutes: [

    {
      slug: "ngorongoro-tarangire",
      title: "Ngorongoro & Tarangire",
      duration: "5 Nights",

      pricing: {
        lowSeason: 2890,
        peakSeason: 3290,
        currency: "USD"
      },

      highlights: [
        "Tarangire elephants",
        "Ngorongoro Crater",
        "Luxury lodges",
        "Big Five safari"
      ]
    },

    {
      slug: "serengeti-migration",
      title: "Serengeti Migration",
      duration: "3 Nights",

      pricing: {
        lowSeason: 2190,
        peakSeason: 2690,
        currency: "USD"
      },

      highlights: [
        "Great Migration",
        "Mara River crossings",
        "Luxury camps",
        "Optional balloon safari"
      ]
    },

    {
      slug: "nyerere-selous",
      title: "Nyerere (Selous) Wild",
      duration: "4 Nights",

      pricing: {
        lowSeason: 2490,
        peakSeason: 2990,
        currency: "USD"
      },

      highlights: [
        "Boat safari",
        "Walking safari",
        "Fly camping",
        "Rufiji River"
      ]
    },

    {
      slug: "ruaha-big-cat",
      title: "Ruaha Big-Cat Trail",
      duration: "3 Nights",

      pricing: {
        lowSeason: 2590,
        peakSeason: 3190,
        currency: "USD"
      },

      highlights: [
        "Big cats",
        "Remote wilderness",
        "Luxury bush camps"
      ]
    },

    {
      slug: "mahale-chimp",
      title: "Mahale Chimp & Lake Tanganyika",
      duration: "4 Nights",

      pricing: {
        lowSeason: 3890,
        peakSeason: 4890,
        currency: "USD"
      },

      highlights: [
        "Chimpanzee trekking",
        "Lake Tanganyika",
        "Luxury beach camps"
      ]
    },

    {
      slug: "katavi-frontier",
      title: "Katavi Remote Frontier",
      duration: "5 Nights",

      pricing: {
        lowSeason: 4290,
        peakSeason: 5490,
        currency: "USD"
      },

      highlights: [
        "Remote safari",
        "Buffalo herds",
        "Luxury expedition"
      ]
    },

    {
      slug: "tarangire-short",
      title: "Tarangire + Ngorongoro Short Circuit",
      duration: "2 Nights",

      pricing: {
        lowSeason: 1390,
        peakSeason: 1690,
        currency: "USD"
      }
    },

    {
      slug: "ngorongoro-overnight",
      title: "Ngorongoro Overnight",
      duration: "1 Night",

      pricing: {
        lowSeason: 950,
        peakSeason: 1190,
        currency: "USD"
      }
    },

    {
      slug: "tarangire-day-safari",
      title: "Tarangire Express Day Safari",
      duration: "1 Day",

      pricing: {
        lowSeason: 490,
        peakSeason: 590,
        currency: "USD"
      }
    }
  ],

  packages: [

    {
      slug: "classic-safari-zanzibar",
      title: "10-Day Classic Safari & Zanzibar Escape",

      duration: "10 Days",

      pricing: {
        from: 3800,
        currency: "USD"
      },

      includes: [
        "Tarangire",
        "Serengeti",
        "Ngorongoro",
        "Zanzibar beach stay",
        "Internal flights",
        "Luxury lodges",
        "Transfers"
      ]
    },

    {
      slug: "honeymoon-paradise",
      title: "7-Day Honeymoon Safari & Zanzibar",

      duration: "7 Days",

      pricing: {
        from: 3200,
        currency: "USD"
      },

      includes: [
        "Romantic beach resort",
        "Sunset dhow cruise",
        "Private dinners",
        "Luxury safari"
      ]
    },

    {
      slug: "luxury-14day",
      title: "14-Day Luxury Tanzania & Zanzibar",

      duration: "14 Days",

      pricing: {
        from: 7500,
        currency: "USD"
      },

      includes: [
        "Great Migration",
        "Fly-in safari",
        "Luxury eco-lodges",
        "Kendwa beach villa"
      ]
    },

    {
      slug: "mikumi-flyin",
      title: "2-Day Fly-In Safari From Zanzibar",

      duration: "2 Days",

      pricing: {
        from: 600,
        currency: "USD"
      },

      includes: [
        "Return flights",
        "Safari",
        "Lodge stay",
        "Park fees"
      ]
    },

    {
      slug: "kilimanjaro-safari-zanzibar",
      title: "Kilimanjaro + Safari + Zanzibar Expedition",

      duration: "14 Days",

      pricing: {
        from: 4350,
        currency: "USD"
      },

      includes: [
        "Kilimanjaro climb",
        "Safari",
        "Zanzibar beach stay",
        "Transfers"
      ]
    },

    {
      slug: "family-safari-zanzibar",
      title: "Luxury Family Safari & Zanzibar",

      duration: "8 Days",

      pricing: {
        from: 9000,
        currency: "USD"
      },

      includes: [
        "Family suites",
        "Private safari",
        "Luxury beach resort",
        "Domestic flights"
      ]
    },

    {
      slug: "migration-luxury",
      title: "Great Migration Luxury Package",

      duration: "7 - 9 Days",

      pricing: {
        from: 5000,
        currency: "USD"
      },

      includes: [
        "Migration safari",
        "Luxury tented camps",
        "Balloon safari option",
        "Beach resort"
      ]
    },

    {
      slug: "marine-package",
      title: "Zanzibar Adventure & Marine Package",

      duration: "5 - 7 Days",

      pricing: {
        from: 900,
        currency: "USD"
      },

      includes: [
        "Mnemba snorkeling",
        "Dolphin tour",
        "Sunset cruise",
        "Jozani Forest",
        "Sandbank picnic"
      ]
    },

    {
      slug: "culture-package",
      title: "Stone Town & Culture Experience",

      duration: "3 - 5 Days",

      pricing: {
        from: 700,
        currency: "USD"
      },

      includes: [
        "Stone Town",
        "Prison Island",
        "Spice farm",
        "Cooking class",
        "Street food experience"
      ]
    },

    {
      slug: "digital-nomad",
      title: "Digital Nomad Zanzibar Stay",

      duration: "14 - 30 Days",

      pricing: {
        from: 1500,
        currency: "USD"
      },

      includes: [
        "Accommodation",
        "SIM setup",
        "Coworking recommendations",
        "Excursions"
      ]
    }
  ],

  futureOpportunities: [

    "Hotel booking commissions",

    "Luxury airport concierge",

    "Private yacht charters",

    "Destination weddings",

    "Content creator packages",

    "VIP nightlife experiences",

    "Corporate retreats",

    "Travel insurance partnerships",

    "Luxury villa partnerships",

    "Multi-country East Africa circuits"
  ],

  recommendedCategories: [

    "Safari Packages",

    "Luxury Experiences",

    "Zanzibar Excursions",

    "Honeymoon Packages",

    "Family Packages",

    "Adventure Tours",

    "Fly-In Safaris",

    "Cultural Experiences",

    "Marine & Diving",

    "Wellness Retreats",

    "VIP Experiences",

    "Tailor-Made Packages"
  ]
};