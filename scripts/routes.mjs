// Single source of truth for the site's route table, derived from the same
// product data the app uses. Shared by build-sitemap.mjs (sitemap.xml) and
// prerender.mjs (build-time prerender crawl) so the two never drift.
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '../src/data');

// The experiences store joins the sitemap/prerender only in launched builds
// (VITE_STORE_ENABLED=true at build time). Checkout and order confirmations
// stay private/noindex forever and are never listed here.
const STORE_LAUNCHED = process.env.VITE_STORE_ENABLED === 'true';

// Static, indexable routes. Excludes /booking (canonicalizes to /book-now) and the 404.
export const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/excursions', priority: '0.9', changefreq: 'weekly' },
  ...(STORE_LAUNCHED ? [{ path: '/store', priority: '0.9', changefreq: 'weekly' }] : []),
  { path: '/safaris', priority: '0.9', changefreq: 'weekly' },
  { path: '/packages', priority: '0.9', changefreq: 'weekly' },
  { path: '/retreats', priority: '0.8', changefreq: 'weekly' },
  { path: '/transfers', priority: '0.7', changefreq: 'monthly' },
  { path: '/explore', priority: '0.7', changefreq: 'monthly' },
  { path: '/trip-planner', priority: '0.7', changefreq: 'monthly' },
  { path: '/book-now', priority: '0.6', changefreq: 'monthly' },
  { path: '/aboutus', priority: '0.5', changefreq: 'monthly' },
  { path: '/cookies-policy', priority: '0.2', changefreq: 'yearly' },
  { path: '/privacy-policy', priority: '0.2', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.2', changefreq: 'yearly' },
];

// Routes that stay client-only by design (booking + AI planner): still listed in
// the sitemap, but skipped by the prerender crawl.
export const PRERENDER_EXCLUDE = new Set(['/book-now', '/booking', '/trip-planner']);

const idOf = (item) => item.id || item.slug;

// Per-product detail routes, read from the live data modules.
export async function getDynamicRoutes() {
  const { EXCURSIONS } = await import(resolve(dataDir, 'excursionsData.js'));
  const { EXCURSION_COMBINATIONS } = await import(resolve(dataDir, 'excursionCombinations.js'));
  const { ALL_SAFARI_PRODUCTS, SAFARI_TYPES } = await import(resolve(dataDir, 'safariPageData.js'));
  const { destinationParadisePackages } = await import(resolve(dataDir, 'destinationParadisePackages.js'));
  const { RETREAT_TEACHER_IDS } = await import(resolve(dataDir, 'retreatsPageData.js'));

  return [
    ...EXCURSIONS.map((e) => ({ path: `/excursions/${idOf(e)}`, priority: '0.7', changefreq: 'monthly' })),
    ...EXCURSION_COMBINATIONS.map((c) => ({ path: `/excursions/combinations/${idOf(c)}`, priority: '0.6', changefreq: 'monthly' })),
    ...ALL_SAFARI_PRODUCTS.map((s) => ({ path: `/safaris/${idOf(s)}`, priority: '0.7', changefreq: 'monthly' })),
    ...SAFARI_TYPES.map((t) => ({ path: `/safaris/types/${idOf(t)}`, priority: '0.6', changefreq: 'monthly' })),
    ...destinationParadisePackages.map((p) => ({ path: `/packages/${idOf(p)}`, priority: '0.7', changefreq: 'monthly' })),
    ...RETREAT_TEACHER_IDS.map((id) => ({ path: `/retreats/teachers/${id}`, priority: '0.6', changefreq: 'monthly' })),
  ];
}

// Every indexable route (static + dynamic), with undefined-id rows dropped.
export async function getAllRoutes() {
  const all = [...STATIC_ROUTES, ...(await getDynamicRoutes())];
  return all.filter((r) => r.path && !r.path.includes('undefined'));
}

// Paths the prerender crawl should render: every indexable route except the
// client-only booking/planner pages.
export async function getPrerenderPaths() {
  const all = await getAllRoutes();
  return all.map((r) => r.path).filter((p) => !PRERENDER_EXCLUDE.has(p));
}
