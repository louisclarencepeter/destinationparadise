// Gives the client-only routes a real file on disk, so every indexable URL
// resolves to exactly one canonical address.
//
// Netlify normalizes any route it can serve from dist/<route>/index.html:
// /route answers 301 -> /route/, and /route/ answers 200. Prerendered routes get
// that for free, which is why their trailing-slash canonical (usePageMeta) and
// their trailing-slash <loc> (build-sitemap.mjs) line up with what is served.
//
// The routes in PRERENDER_EXCLUDE (booking form, AI planner) are skipped by the
// prerender crawl on purpose — driving them in headless Chromium would bake
// transient state into the HTML (e.g. Booking fetches /api/booking-challenge on
// mount and would capture its failure message). They were therefore served
// through `status = 200` rewrites in netlify.toml, which answered BOTH /route and
// /route/ with 200: two live URLs for one page and nothing redirecting between
// them. Search Console reported the sitemap's /trip-planner/ as "Duplicate,
// Google chose different canonical than user" as a result.
//
// Writing the untouched SPA shell to dist/<route>/index.html puts these routes
// back on the same normalization path as everything else without prerendering
// them. Visitors and Googlebot get the same client-rendered page as before — the
// shell boots the app, which applies the route's head via usePageMeta.
//
// MUST run after `vite build` and BEFORE `scripts/prerender.mjs`: the crawl
// overwrites dist/index.html with the rendered homepage at the end, and copying
// that would ship homepage markup at these URLs.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { getAllRoutes, getPrerenderPaths } from './routes.mjs';

const SITE_URL = 'https://yournexttriptoparadise.com';
const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '../dist');
const shellPath = join(distDir, 'index.html');

let shell;
try {
  shell = await readFile(shellPath, 'utf8');
} catch {
  console.warn('[spa-route-shells] dist/index.html not found — run `vite build` first. Skipped.');
  process.exit(0);
}

// A prerendered shell means this step ran in the wrong order; a homepage copy at
// /book-now/ would be worse than the duplicate URL it is meant to fix.
if (/<main[\s>]/.test(shell) || shell.includes('id="main-content"')) {
  throw new Error(
    'dist/index.html already contains rendered page markup — build-spa-route-shells.mjs must run before prerender.mjs.',
  );
}

// The shell carries index.html's static head, which points canonical and og:url
// at the homepage. Googlebot renders JS and picks up the route's real head from
// usePageMeta, but non-JS scrapers only ever see the static markup — so retarget
// those two tags at the route's own trailing-slash URL while copying.
function retargetShell(shellHtml, routePath) {
  const url = `${SITE_URL}${routePath}/`;
  let rewrote = 0;
  const bump = (open, close) => {
    rewrote += 1;
    return `${open}${url}${close}`;
  };

  let html = shellHtml
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, (m, open, close) => bump(open, close))
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, (m, open, close) => bump(open, close));

  if (rewrote < 2) {
    console.warn(
      `[spa-route-shells] ⚠ ${routePath}: retargeted ${rewrote}/2 head tags — check the canonical / og:url markup in index.html.`,
    );
  }
  return html;
}

const prerendered = new Set(await getPrerenderPaths());
const routes = (await getAllRoutes())
  .map((route) => route.path)
  .filter((path) => path !== '/' && !prerendered.has(path));

for (const path of routes) {
  const outDir = join(distDir, path);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'index.html'), retargetShell(shell, path), 'utf8');
  console.log(`[spa-route-shells] ✓ ${path}/`);
}

console.log(`[spa-route-shells] wrote ${routes.length} shell${routes.length === 1 ? '' : 's'}.`);
