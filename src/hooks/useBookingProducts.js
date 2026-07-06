import { useMemo } from 'react';
import { EXCURSIONS } from '../data/excursionsData.js';
import { destinationParadisePackages } from '../data/destinationParadisePackages.js';
import { destinationParadiseSafariPricing } from '../data/safariPricing.js';
import { TRANSFER_PRODUCTS } from '../data/transferProducts.js';
import { RETREAT_PRODUCTS } from '../data/retreatProducts.js';

const objectFromTranslation = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
);

const productTranslation = (products, type, key) => objectFromTranslation(objectFromTranslation(products[type])[key]);

export function useBookingProducts(t) {
  return useMemo(() => {
    const translatedProducts = objectFromTranslation(t?.('products', { returnObjects: true, defaultValue: {} }));

    const packages = destinationParadisePackages.map((item) => ({
      type: 'package',
      value: `package:${item.slug}`,
      label: productTranslation(translatedProducts, 'package', item.slug).label || item.title,
      category: productTranslation(translatedProducts, 'package', item.slug).category || item.category,
      unit: productTranslation(translatedProducts, 'package', item.slug).unit,
      raw: item,
    }));

    const excursions = EXCURSIONS.map((item) => ({
      type: 'excursion',
      value: `excursion:${item.id}`,
      label: productTranslation(translatedProducts, 'excursion', item.id).label || item.title,
      category: productTranslation(translatedProducts, 'excursion', item.id).category || item.categoryLabel || item.category,
      priceSub: productTranslation(translatedProducts, 'excursion', item.id).priceSub,
      raw: item,
    }));

    const safaris = destinationParadiseSafariPricing.map((item) => ({
      type: 'safari',
      value: `safari:${item.slug}`,
      label: productTranslation(translatedProducts, 'safari', item.slug).label || item.title,
      category: productTranslation(translatedProducts, 'safari', item.slug).category || item.positioning,
      raw: item,
    }));

    const transfers = TRANSFER_PRODUCTS.map((item) => ({
      type: 'transfer',
      value: `transfer:${item.slug}`,
      label: productTranslation(translatedProducts, 'transfer', item.slug).label || item.title,
      category: productTranslation(translatedProducts, 'transfer', item.slug).category || item.duration,
      priceSummary: productTranslation(translatedProducts, 'transfer', item.slug).priceSummary,
      raw: item,
    }));

    const retreats = RETREAT_PRODUCTS.map((item) => {
      const retreatTranslation = productTranslation(translatedProducts, 'retreat', item.slug);
      const optionTranslations = objectFromTranslation(retreatTranslation.options);

      return {
        type: 'retreat',
        value: `retreat:${item.slug}`,
        label: retreatTranslation.label || item.title,
        category: retreatTranslation.category || item.duration,
        raw: {
          ...item,
          options: item.options?.map((option) => ({
            ...option,
            ...objectFromTranslation(optionTranslations[option.slug]),
          })),
        },
      };
    });

    return { packages, excursions, safaris, transfers, retreats, all: [...packages, ...excursions, ...safaris, ...transfers, ...retreats] };
  }, [t]);
}
