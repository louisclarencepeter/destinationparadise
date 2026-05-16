export const TRANSFER_SERVICE_TIERS = [
  {
    value: 'standard-private',
    label: 'Standard Private',
    text: 'Reliable AC vehicle, meet & greet, flight tracking, luggage help, and door-to-door service.',
  },
  {
    value: 'premium-suv',
    label: 'Premium SUV',
    text: 'More space and a more elevated arrival for couples, families, safari clients, and extra luggage.',
  },
  {
    value: 'vip-concierge',
    label: 'VIP Concierge',
    text: 'Luxury vehicle, private concierge handling, cold towels, refreshments, and fast-track support on request.',
  },
  {
    value: 'group-transfer',
    label: 'Group Transfer',
    text: 'Minivans and coaster buses for families, wedding groups, teams, and safari parties.',
  },
];

export const TRANSFER_PRODUCTS = [
  {
    slug: 'airport-stonetown',
    title: 'Airport ⇄ Stone Town',
    duration: '15 - 25 minutes',
    icon: 'plane',
    description: 'A polished private arrival for Stone Town hotels, short stays, business travellers, and guests who want the airport handled before they land.',
    pricing: ['Private car from $25 per vehicle', 'Premium SUV from $45', 'Group transfer from $10 per person'],
    details: ['Meet & greet at arrivals', 'Flight tracking included', 'Stone Town hotels', 'Short-stay friendly'],
    priceSummary: 'Private from $25',
    category: 'Airport transfer',
  },
  {
    slug: 'airport-paje',
    title: 'Airport ⇄ Paje / Jambiani',
    duration: '1 - 1.5 hours',
    icon: 'coast',
    description: 'Direct beach-resort transfers for the southeast coast, with room for luggage, kite gear, and a calm first hour on the island.',
    pricing: ['Private car from $45 per vehicle', 'Premium SUV from $70', 'Luxury VIP from $120'],
    details: ['Paje, Bwejuu & Jambiani', 'Couples and beach stays', 'Kitesurf luggage support', 'Door-to-door resort drop-off'],
    priceSummary: 'Private from $45',
    category: 'Airport transfer',
  },
  {
    slug: 'airport-nungwi',
    title: 'Airport ⇄ Nungwi / Kendwa',
    duration: 'Around 1.5 hours',
    icon: 'north',
    description: 'Premium long-route transfers for north coast resorts, honeymoon stays, and guests who want comfort after a long international flight.',
    pricing: ['Private car from $50 per vehicle', 'Premium SUV from $80', 'Luxury VIP from $140'],
    details: ['Nungwi and Kendwa resorts', 'Honeymoon arrivals', 'Luxury beach holidays', 'Refreshment stop on request'],
    priceSummary: 'Private from $50',
    category: 'Airport transfer',
  },
  {
    slug: 'hotel-hotel',
    title: 'Hotel ⇄ Hotel Transfers',
    duration: 'Island-wide',
    icon: 'hotel',
    description: 'Switching from Stone Town to the beach, or combining multiple resorts? We manage the timing, pickup point, luggage, and route.',
    pricing: ['Private transfer from $35 per vehicle', 'Premium transfer from $60', 'North coast routes priced by distance'],
    details: ['All areas on the island', 'Stone Town ⇄ Nungwi', 'Paje ⇄ Kendwa & more', 'Flexible pickup times'],
    priceSummary: 'Private from $35',
    category: 'Island transfer',
  },
  {
    slug: 'group-transfers',
    title: 'Group & Minivan Transfers',
    duration: 'Families · events · teams',
    icon: 'group',
    description: 'Coordinated arrivals for families, wedding groups, corporate teams, and safari parties travelling together with luggage.',
    pricing: ['Minivan from $90', 'Coaster bus from $180', 'Custom quote for large groups'],
    details: ['5 - 25 guests', 'Group luggage planning', 'Multiple pickup points', 'Airport or hotel coordination'],
    priceSummary: 'Minivan from $90',
    category: 'Group transfer',
  },
  {
    slug: 'vip-airport-service',
    title: 'VIP Airport Concierge',
    duration: 'Luxury arrival service',
    icon: 'vip',
    description: 'A high-touch arrival experience for premium guests, honeymooners, executives, and safari clients who want every detail handled.',
    pricing: ['VIP concierge from $150', 'Luxury vehicle included', 'Fast-track assistance on request'],
    details: ['Private concierge', 'Meet & greet', 'Cold towels & refreshments', 'WhatsApp support'],
    priceSummary: 'VIP from $150',
    category: 'VIP transfer',
    featured: true,
  },
];

const objectFromTranslation = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
);

export function buildLocalizedTransferProducts(t) {
  const products = objectFromTranslation(t('products', { returnObjects: true, defaultValue: {} }));

  return TRANSFER_PRODUCTS.map((product) => {
    const translated = objectFromTranslation(products[product.slug]);

    return {
      ...product,
      ...translated,
      pricing: translated.pricing || product.pricing,
      details: translated.details || product.details,
    };
  });
}
