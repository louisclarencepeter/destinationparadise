import { EXCURSIONS } from './excursionsData.js';
import { EXCURSION_COMBINATIONS } from './excursionCombinations.js';
import { ALL_SAFARI_PRODUCTS, SAFARI_TYPES } from './safariPageData.js';
import { uniqueProductImages } from '../utils/productImages.js';

const objectFromTranslation = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
);

// Locale files supply editorial text. Product identity, media provenance and
// commercial fields always come from the source catalog.
const SOURCE_FIELDS = new Set([
  'id', 'slug', 'sourceKey', 'image', 'originalImage', 'imageNeeded', 'imageTBD',
  'routeIds', 'excursionIds', 'pricing', 'publicPrice',
]);

function mergeEditorial(base, translated) {
  if (typeof base === 'string') return typeof translated === 'string' ? translated : base;
  // Keep the source array shape and merge each editorial record in place so
  // translated upgrade names cannot discard their numeric prices.
  if (Array.isArray(base)) {
    return Array.isArray(translated)
      ? base.map((value, index) => mergeEditorial(value, translated[index]))
      : base;
  }
  // Numbers, flags and absent fields are never authored by translations.
  if (!base || typeof base !== 'object') return base;
  if (!translated || typeof translated !== 'object' || Array.isArray(translated)) return base;

  const merged = { ...base };
  Object.keys(base).forEach((key) => {
    if (!SOURCE_FIELDS.has(key)) merged[key] = mergeEditorial(base[key], translated[key]);
  });
  return merged;
}

function localizeById(source, catalog) {
  return source.map((item) => mergeEditorial(item, objectFromTranslation(catalog[item.id])));
}

function catalogSection(t, key) {
  return objectFromTranslation(t(`catalog:${key}`, { returnObjects: true, defaultValue: {} }));
}

export function buildLocalizedExcursions(t) {
  const catalog = catalogSection(t, 'excursions');
  const localized = localizeById(EXCURSIONS, catalog).map((item, index) => ({
    ...item,
    // Category is a filter key and must remain locale-independent.
    localizedCategory: t(`excursions:categories.${EXCURSIONS[index].category}`, {
      defaultValue: item.category,
    }),
    category: EXCURSIONS[index].category,
  }));
  return uniqueProductImages(localized, {
    scope: t('catalog:placeholders.excursion'),
    categoryKey: 'localizedCategory',
    photoLabel: t('catalog:placeholders.photo'),
  });
}

export function buildLocalizedExcursionCombinations(t) {
  return localizeById(EXCURSION_COMBINATIONS, catalogSection(t, 'excursionCombinations'));
}

export function buildLocalizedSafariProducts(t) {
  const catalog = catalogSection(t, 'safariProducts');
  const localized = localizeById(ALL_SAFARI_PRODUCTS, catalog).map((item, index) => {
    const source = ALL_SAFARI_PRODUCTS[index];
    const localizedCategory = t(`safaris:categories.${source.category}`, {
      defaultValue: item.category,
    });
    const localizedDuration = item.duration;
    const localizedProductType = source.productType
      ? t('safaris:product_types.specialty', { defaultValue: item.productType || source.productType })
      : item.productType;

    return {
      ...item,
      // Category and duration are used by the route filters.
      localizedCategory,
      localizedDuration,
      localizedProductType,
      category: source.category,
      duration: source.duration,
      productType: source.productType,
      ...(source.productType ? { rib: `${localizedCategory} · ${localizedDuration}`, alt: item.title } : {}),
    };
  });
  return uniqueProductImages(localized, {
    scope: t('catalog:placeholders.safari'),
    categoryKey: 'localizedCategory',
    photoLabel: t('catalog:placeholders.photo'),
  });
}

export function buildLocalizedSafariTypes(t) {
  return localizeById(SAFARI_TYPES, catalogSection(t, 'safariTypes'));
}
