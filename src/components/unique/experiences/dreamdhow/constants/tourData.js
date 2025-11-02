/**
 * Image lists for different locations
 */
export const MNEMBA_IMAGES = [
  "mnemba/DJI_20250915124414_0001_D.jpg",
  "mnemba/DJI_20250915124543_0003_D.jpg",
  "mnemba/DJI_20250915124633_0008_D.jpg",
  "mnemba/DJI_20250915124638_0009_D.jpg",
  "mnemba/DJI_20250915170806_0003_D.jpg",
  "mnemba/DJI_20250915170921_0008_D.jpg",
  "mnemba/DJI_20250915170937_0009_D.jpg",
  "mnemba/DJI_20250915171037_0011_D.jpg",
  "mnemba/DJI_20250915171311_0018_D.jpg",
  "mnemba/DJI_20250915191226_0022_D.jpg",
  "mnemba/DJI_20250915191246_0026_D.jpg",
  "mnemba/DJI_20250915191436_0032_D.jpg",
  "mnemba/DJI_20250915192140_0043_D.jpg",
  "mnemba/DJI_20250915192450_0049_D.jpg",
  "mnemba/DJI_20250915192525_0051_D.jpg",
  "mnemba/DJI_20250915194507_0075_D.jpg",
  "mnemba/IMG_20250916_041952_456.jpg",
  "mnemba/Snapshot_202509259_040901.jpg",
  "mnemba/Snapshot_202509259_040902.jpg",
  "mnemba/Snapshot_202509259_040909 2.jpg",
];

export const TUMBATU_IMAGES = [
  "tumbatu/WhatsApp Image 2025-10-27 at 6.51.22 AM.jpeg",
];

export const SUNSET_IMAGES = [
  "sunset/WhatsApp Image 2025-10-27 at 6.49.17 AM (1).jpeg",
  "sunset/WhatsApp Image 2025-10-27 at 6.50.22 AM (1).jpeg",
  "sunset/WhatsApp Image 2025-10-27 at 6.50.22 AM.jpeg",
  "sunset/WhatsApp Image 2025-10-27 at 6.50.23 AM.jpeg",
];

/**
 * Value propositions for Why Book Us section
 */
export const VALUE_PROPS = [
  {
    icon: "fas fa-check-circle",
    title: "Best-in-Class Partners",
    description:
      "We've vetted the best, safest, and most professional dhow operators so you don't have to.",
  },
  {
    icon: "fas fa-percent",
    title: "Unlock Exclusive Savings",
    description:
      "Your dhow booking is your key to special rates on our other top-rated services, from airport transfers to private tours.",
  },
  {
    icon: "fas fa-concierge-bell",
    title: "Seamless One-Stop Planning",
    description:
      "Let us handle all the details. We're your single point of contact for a stress-free, perfectly coordinated itinerary.",
  },
];

/**
 * Tour packages data
 * @param {Array} mnembaImages - Shuffled Mnemba images
 * @param {Array} tumbatuImages - Tumbatu images
 * @param {Array} sunsetImages - Shuffled sunset images
 * @returns {Array} Array of tour objects
 */
export const getTourPackages = (
  mnembaImages,
  tumbatuImages,
  sunsetImages
) => [
  {
    title: "Mnemba Island (Best Seller)",
    icon: "fas fa-water",
    images: mnembaImages,
    departure: "9:00 AM from Kendwa Beach",
    activities: "Dolphin spotting, snorkeling, sandbank/lagoon, sunset sail",
    food: "Seafood lunch + fruits, snacks & drinks",
    pricing:
      '<strong>Private boat:</strong> from $185 to $110 p.p. · <strong>Shared:</strong> $95/person',
    kids: "0–4 free · 5–10 years $50",
    ctaText: "Book Mnemba Island",
    ctaLink: "/contact",
  },
  {
    title: "Tumbatu Island",
    icon: "fas fa-fish",
    images: tumbatuImages,
    departure: "9:00 AM from Kendwa Beach",
    activities: "Snorkeling (turtles!), beach walk, sunset sail",
    food: "Seafood lunch + fruits & soft drinks",
    pricing:
      '<strong>Private boat:</strong> from $185 to $110 p.p. · <strong>Shared:</strong> $95/person',
    kids: "0–4 free · 5–10 years $50",
    ctaText: "Book Tumbatu Island",
    ctaLink: "/contact",
  },
  {
    title: "Romantic Sunset Cruise",
    icon: "fas fa-heart",
    images: sunsetImages,
    departure: "5:00 PM from Nungwi & Kendwa",
    activities: "Sunset sailing, romantic vibes, dinner onboard",
    food: '<strong>Dinner:</strong> $110 → $90 p.p. · <strong>Snacks:</strong> $90 → $70 p.p.',
    pricing: "",
    kids: "0–4 free · 5–10 years $50",
    ctaText: "Book Sunset Cruise",
    ctaLink: "/contact",
  },
];