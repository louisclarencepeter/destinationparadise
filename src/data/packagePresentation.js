import { destinationParadisePackages } from './destinationParadisePackages.js';
import { uniqueProductImages } from '../utils/productImages.js';

const PACKAGE_IMAGES = {
  'six-day-safari-zanzibar-escape': '/assets/images/safaris/eland-herd-plains.webp',
  'seven-day-honeymoon-safari-zanzibar': '/assets/images/safaris/lioness-and-cub-resting.webp',
  'eight-day-tanzania-parks-zanzibar': '/assets/images/safaris/zebra-herd-on-track.webp',
  'nine-day-safari-zanzibar-culture': '/assets/images/excursions/stone-town-old-fort.webp',
  'ten-day-classic-safari-zanzibar': '/assets/images/safaris/rhino-on-plains.webp',
  'twelve-day-serengeti-zanzibar': '/assets/images/safaris/wildebeest-grazing.webp',
  'fourteen-day-ultimate-tanzania-zanzibar': '/assets/images/safaris/male-lion-in-grass.webp',
  'two-day-fly-in-safari-zanzibar': '/assets/images/safaris/buffalo-and-egret.webp',
  'three-day-serengeti-fly-in-safari': '/assets/images/safaris/zebra-mare-and-foal.webp',
  'kilimanjaro-safari-zanzibar-expedition': '/assets/images/safaris/warthog-on-plains.webp',
  'luxury-family-safari-zanzibar': '/assets/images/safaris/lion-cub-in-grass.webp',
  'great-migration-luxury-package': '/assets/images/safaris/serval-in-grass.webp',
  'zanzibar-adventure-marine-package': '/assets/images/excursions/dolphin-snorkeling.webp',
  'stone-town-culture-experience': '/assets/images/excursions/spice-tour-nutmeg.webp',
  'digital-nomad-zanzibar-stay': '/assets/images/home/mizingani-waterfront.webp',
};

const imgForPackage = (pkg) => {
  if (PACKAGE_IMAGES[pkg.slug]) return PACKAGE_IMAGES[pkg.slug];
  const { category } = pkg;
  if (/safari|multi/i.test(category)) return '/assets/images/safaris/raptor-on-log.webp';
  if (/honeymoon|romantic|wedding/i.test(category)) return '/assets/images/home/stone-town-waterfront.webp';
  if (/family|festival|digital/i.test(category)) return '/assets/images/excursions/prison-island-tortoise.webp';
  if (/luxury|wellness|creator/i.test(category)) return '/assets/images/safaris/eland-grazing.webp';
  if (/adventure/i.test(category)) return '/assets/images/excursions/dolphin-snorkeling.webp';
  return '/assets/images/home/stone-town-waterfront.webp';
};

const priceLabel = (pricing) => {
  const from = `$${pricing.from.toLocaleString()}`;
  if (pricing.to) return `${from} - $${pricing.to.toLocaleString()}`;
  return from;
};

export const categoryText = (pkg) => `${pkg.category} ${pkg.title} ${(pkg.idealFor || []).join(' ')} ${(pkg.includes || []).join(' ')} ${pkg.searchText || ''}`;

const objectFromTranslation = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
);

export function buildLocalizedPackages(t) {
  const catalog = objectFromTranslation(t('catalog', { returnObjects: true, defaultValue: {} }));

  return uniqueProductImages(destinationParadisePackages.map((pkg) => {
    const translated = objectFromTranslation(catalog[pkg.slug]);
    const translatedPricing = objectFromTranslation(translated.pricing);
    const includes = translated.includes || pkg.includes;
    const pricing = { ...pkg.pricing, ...translatedPricing };
    const localized = {
      ...pkg,
      ...translated,
      pricing,
      includes,
      idealFor: translated.idealFor || pkg.idealFor,
      route: translated.route || pkg.route,
      destinations: translated.destinations || pkg.destinations,
      priceTiers: translated.priceTiers || pkg.priceTiers,
      id: pkg.slug,
      image: imgForPackage(pkg),
      from: translated.category || pkg.category,
      price: pkg.pricing.from,
      priceLabel: priceLabel(pkg.pricing),
      priceSub: pricing.unit || t(`price_units.${pkg.pricing.unit}`, { defaultValue: pkg.pricing.unit || 'Per Person' }),
      searchText: categoryText(pkg),
    };

    return {
      ...localized,
      description: translated.split || translated.focus || includes.slice(0, 4).join(' · '),
    };
  }), { scope: 'Package' });
}
