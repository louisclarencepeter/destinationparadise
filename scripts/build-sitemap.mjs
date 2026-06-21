// Generates public/sitemap.xml from the route table + product data.
// Run as part of `npm run build` (before `vite build`, so Vite copies it into dist/).
// robots.txt advertises /sitemap.xml, so this keeps that promise with real XML.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SITE_URL = 'https://destinationparadisezanzibar.netlify.app';
const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '../src/data');

const { EXCURSIONS } = await import(resolve(dataDir, 'excursionsData.js'));
const { EXCURSION_COMBINATIONS } = await import(resolve(dataDir, 'excursionCombinations.js'));
const { ALL_SAFARI_PRODUCTS, SAFARI_TYPES } = await import(resolve(dataDir, 'safariPageData.js'));
const { destinationParadisePackages } = await import(resolve(dataDir, 'destinationParadisePackages.js'));

// Static, indexable routes. Excludes /booking (canonicalizes to /book-now) and the 404.
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/excursions', priority: '0.9', changefreq: 'weekly' },
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

const idOf = (item) => item.id || item.slug;
const dynamicRoutes = [
  ...EXCURSIONS.map((e) => ({ path: `/excursions/${idOf(e)}`, priority: '0.7', changefreq: 'monthly' })),
  ...EXCURSION_COMBINATIONS.map((c) => ({ path: `/excursions/combinations/${idOf(c)}`, priority: '0.6', changefreq: 'monthly' })),
  ...ALL_SAFARI_PRODUCTS.map((s) => ({ path: `/safaris/${idOf(s)}`, priority: '0.7', changefreq: 'monthly' })),
  ...SAFARI_TYPES.map((t) => ({ path: `/safaris/types/${idOf(t)}`, priority: '0.6', changefreq: 'monthly' })),
  ...destinationParadisePackages.map((p) => ({ path: `/packages/${idOf(p)}`, priority: '0.7', changefreq: 'monthly' })),
];

const routes = [...staticRoutes, ...dynamicRoutes].filter((r) => r.path && !r.path.includes('undefined'));
const lastmod = new Date().toISOString().slice(0, 10);

const body = routes
  .map(
    (r) =>
      `  <url>\n` +
      `    <loc>${SITE_URL}${r.path}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${r.changefreq}</changefreq>\n` +
      `    <priority>${r.priority}</priority>\n` +
      `  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

const out = resolve(here, '../public/sitemap.xml');
writeFileSync(out, xml, 'utf8');
console.log(`[build-sitemap] wrote ${routes.length} urls to public/sitemap.xml`);
