// Generates public/sitemap.xml from the shared route table (scripts/routes.mjs).
// Run as part of `npm run build` (before `vite build`, so Vite copies it into dist/).
// robots.txt advertises /sitemap.xml, so this keeps that promise with real XML.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { getAllRoutes } from './routes.mjs';

const SITE_URL = 'https://yournexttriptoparadise.com';
const here = dirname(fileURLToPath(import.meta.url));

const routes = await getAllRoutes();
const lastmod = new Date().toISOString().slice(0, 10);
const sitemapPath = (path) => (path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`);

const body = routes
  .map(
    (r) =>
      `  <url>\n` +
      `    <loc>${SITE_URL}${sitemapPath(r.path)}</loc>\n` +
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
