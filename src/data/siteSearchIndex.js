import { buildLocalizedExcursionCombinations, buildLocalizedExcursions, buildLocalizedSafariProducts, buildLocalizedSafariTypes } from './localizedCatalog.js';
import { buildLocalizedPackages } from './packagePresentation.js';
import { buildLocalizedTransferProducts } from './transferProducts.js';
import { isStoreEnabled } from '../config/featureFlags.js';

const objectFromTranslation = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
);

const arrayFromTranslation = (value) => (Array.isArray(value) ? value : []);
const scopedT = (t, namespace) => (key, options) => t(`${namespace}:${key}`, options);
const compactList = (items = []) => items.filter(Boolean).join(' · ');

const normalizeSearchItem = (item, index) => {
  const text = [item.title, item.category, item.description, ...(item.keywords || [])]
    .filter(Boolean)
    .join(' ');

  return {
    ...item,
    id: `${item.category}-${index}-${item.to}`,
    searchText: text.toLocaleLowerCase(),
  };
};

export function buildSiteSearchIndex(t) {
  const search = objectFromTranslation(t('common:search.index', { returnObjects: true, defaultValue: {} }));
  const pages = objectFromTranslation(search.pages);
  const categories = objectFromTranslation(search.categories);
  const excursions = buildLocalizedExcursions(t);
  const combinations = buildLocalizedExcursionCombinations(t);
  const safaris = buildLocalizedSafariProducts(t);
  const safariTypes = buildLocalizedSafariTypes(t).map((item) => ({
    ...item,
    title: t(`safaris:types.items.${item.id}.title`, { defaultValue: item.title }),
    desc: t(`safaris:types.items.${item.id}.desc`, { defaultValue: item.desc }),
    bestFor: t(`safaris:types.items.${item.id}.best_for`, { defaultValue: item.bestFor }),
  }));
  const packages = buildLocalizedPackages(scopedT(t, 'packages'));
  const transfers = buildLocalizedTransferProducts(scopedT(t, 'transfers'));

  const page = (key, to, featured = false) => ({
    title: pages[key]?.title || key,
    category: pages[key]?.category || categories.page || '',
    description: pages[key]?.description || '',
    keywords: pages[key]?.keywords || [],
    to,
    featured,
  });

  const pageItems = [
    ...(isStoreEnabled() ? [page('store', '/store')] : []),
    page('home', '/'),
    page('excursions', '/excursions', true),
    page('safaris', '/safaris', true),
    page('packages', '/packages', true),
    page('retreats', '/retreats'),
    page('transfers', '/transfers', true),
    page('tripPlanner', '/trip-planner', true),
    page('booking', '/book-now', true),
    page('guide', '/explore#our-zanzibar-guide'),
    page('about', '/aboutus'),
  ];

  const packageItems = packages.map((item) => ({
    title: item.title,
    category: categories.package,
    description: compactList([item.duration, item.category, item.split]),
    to: `/packages/${item.slug}`,
    keywords: [item.category, item.duration, item.split, ...(item.idealFor || []), ...(item.includes || []), ...(item.route || [])],
  }));

  const safariItems = safaris.map((item) => ({
    title: item.title,
    category: item.localizedProductType || categories.safari,
    description: compactList([item.localizedDuration, item.localizedCategory || item.positioning, item.rib]),
    to: `/safaris/${item.id}`,
    keywords: [item.localizedCategory, item.positioning, item.localizedDuration, item.from, item.intro, ...(item.highlights || []), ...(item.idealFor || []), ...(item.days || []).flatMap((day) => [day.h, day.p])],
  }));

  const safariTypeItems = safariTypes.map((item) => ({
    title: item.title,
    category: categories.safariStyle,
    description: compactList([item.bestFor, item.desc]),
    to: `/safaris/types/${item.id}`,
    keywords: [item.bestFor, item.desc, ...(item.highlights || [])],
  }));

  const excursionItems = excursions.map((item) => ({
    title: item.title,
    category: categories.excursion,
    description: compactList([item.duration, item.localizedCategory, item.description]),
    to: `/excursions/${item.id}`,
    keywords: [item.localizedCategory, item.eyebrow, item.duration, item.from, item.group, item.description, ...(item.highlights || []), ...(item.facts || []).flat()],
  }));

  const combinationItems = combinations.map((item) => ({
    title: item.title,
    category: categories.excursionCombo,
    description: compactList([item.length, item.combo?.join(' + '), item.desc]),
    to: `/excursions/combinations/${item.id}`,
    keywords: [item.length, item.desc, ...(item.combo || []), ...(item.idealFor || [])],
  }));

  const transferItems = transfers.map((item) => ({
    title: item.title,
    category: item.category || categories.transfer,
    description: compactList([item.duration, item.priceSummary, item.description]),
    to: `/booking?type=transfer&item=${item.slug}#booking-details`,
    keywords: [item.duration, item.description, item.priceSummary, ...(item.pricing || []), ...(item.details || [])],
  }));

  return [
    ...pageItems,
    ...transferItems,
    ...packageItems,
    ...safariItems,
    ...safariTypeItems,
    ...excursionItems,
    ...combinationItems,
  ].map(normalizeSearchItem);
}

export function buildSiteSearchPopular(t) {
  return arrayFromTranslation(t('common:search.index.popular', { returnObjects: true, defaultValue: [] }));
}
