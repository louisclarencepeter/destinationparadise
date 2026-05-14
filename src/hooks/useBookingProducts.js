import { useMemo } from 'react';
import { EXCURSIONS } from '../data/excursionsData.js';
import { destinationParadisePackages } from '../data/destinationParadisePackages.js';
import { destinationParadiseSafariPricing } from '../data/safariPricing.js';
import { TRANSFER_PRODUCTS } from '../data/transferProducts.js';

export function useBookingProducts() {
  return useMemo(() => {
    const packages = destinationParadisePackages.map((item) => ({
      type: 'package',
      value: `package:${item.slug}`,
      label: item.title,
      category: item.categoryLabel || item.category,
      raw: item,
    }));

    const excursions = EXCURSIONS.map((item) => ({
      type: 'excursion',
      value: `excursion:${item.id}`,
      label: item.title,
      category: item.category,
      raw: item,
    }));

    const safaris = destinationParadiseSafariPricing.map((item) => ({
      type: 'safari',
      value: `safari:${item.slug}`,
      label: item.title,
      category: item.positioning,
      raw: item,
    }));

    const transfers = TRANSFER_PRODUCTS.map((item) => ({
      type: 'transfer',
      value: `transfer:${item.slug}`,
      label: item.title,
      category: item.duration,
      raw: item,
    }));

    return { packages, excursions, safaris, transfers, all: [...packages, ...excursions, ...safaris, ...transfers] };
  }, []);
}
