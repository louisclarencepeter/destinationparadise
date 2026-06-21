// Build-time prerendering.
//
// Runs after `vite build`. Drives the built single-page app in headless Chromium
// and captures fully-rendered HTML for each indexable route, writing it to a
// nested dist/<route>/index.html. Because the real app runs, each page ships with
// its own <title>, meta description, canonical, Open Graph / Twitter card, and
// per-product JSON-LD — so social scrapers and non-JS crawlers see real content
// instead of the generic index.html defaults.
//
// Browser-only work that would pollute the captured HTML or hit the network is
// guarded off via window.__PRERENDER__ (see src/utils/prerender.js): Leaflet,
// the i18n language detector + geo lookup, and the currency FX fetch.
//
// Degrades gracefully: if puppeteer/Chromium can't launch — or PRERENDER=false —
// the build still ships the working SPA with client-side meta. Disable with:
//   PRERENDER=false npm run build
import http from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname, normalize } from 'node:path';
import { getPrerenderPaths } from './routes.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '../dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

async function tryFile(p) {
  try {
    const s = await stat(p);
    return s.isFile() ? p : null;
  } catch {
    return null;
  }
}

// Serve dist/ with a SPA fallback to the freshly-built shell. During the crawl the
// nested per-route index.html files don't exist yet, so app routes fall through to
// the shell and the client renders the right route from the URL.
function createServer(indexHtml) {
  return http.createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url || '/', 'http://localhost');
      const decoded = decodeURIComponent(pathname);
      const safe = normalize(join(distDir, decoded));
      if (safe !== distDir && !safe.startsWith(distDir)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      let file = await tryFile(safe);
      if (!file && decoded.endsWith('/')) file = await tryFile(join(safe, 'index.html'));
      if (file) {
        res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
        res.end(await readFile(file));
        return;
      }
      if (extname(decoded)) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });
}

async function renderRoute(browser, port, path) {
  const page = await browser.newPage();
  try {
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.evaluateOnNewDocument(() => {
      window.__PRERENDER__ = true;
    });
    await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait until the route has mounted AND usePageMeta has applied this page's head
    // (meta / canonical / JSON-LD), signalled by window.__DP_META_APPLIED__.
    await page.waitForFunction(
      () =>
        window.__DP_META_APPLIED__ > 0 &&
        !!document.getElementById('root') &&
        document.getElementById('root').childElementCount > 0,
      { timeout: 30000 },
    );
    // Nudge DeferredMount sections (homepage) to mount so below-the-fold content
    // is captured too, then let lazy chunks / images settle.
    await page.evaluate(() => {
      window.dispatchEvent(new Event('pointermove'));
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 6000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
    return await page.evaluate(() => `<!doctype html>\n${document.documentElement.outerHTML}`);
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  if (process.env.PRERENDER === 'false') {
    console.log('[prerender] PRERENDER=false — skipping.');
    return;
  }

  const shellPath = await tryFile(join(distDir, 'index.html'));
  if (!shellPath) {
    console.warn('[prerender] dist/index.html not found — run `vite build` first. Skipping.');
    return;
  }
  const indexHtml = await readFile(shellPath, 'utf8');

  let puppeteer;
  try {
    ({ default: puppeteer } = await import('puppeteer'));
  } catch {
    console.warn('[prerender] ⚠ puppeteer not installed — skipping (SPA ships with client-side meta).');
    return;
  }

  const paths = await getPrerenderPaths();
  const server = createServer(indexHtml);
  await new Promise((r) => server.listen(0, r));
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  } catch (err) {
    console.warn(
      `\n[prerender] ⚠ Could not launch Chromium — skipping prerender. ` +
        `SPA ships with client-side meta only.\n  ${err.message}\n`,
    );
    server.close();
    return;
  }

  // Render with a small concurrency pool — there can be 100+ product routes, and
  // a shared browser handles several pages at once comfortably.
  const concurrency = Math.max(1, Number(process.env.PRERENDER_CONCURRENCY || 4));
  const results = [];
  let failed = 0;
  let next = 0;
  const worker = async () => {
    while (next < paths.length) {
      const path = paths[next++];
      try {
        const html = await renderRoute(browser, port, path);
        results.push({ path, html });
        console.log(`[prerender] ✓ ${path}`);
      } catch (err) {
        failed += 1;
        console.warn(`[prerender] ✗ ${path} — ${err.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, paths.length) }, worker));

  await browser.close().catch(() => {});
  server.close();

  // Flush after the crawl so the base shell isn't mutated mid-crawl (the SPA
  // fallback keeps serving the original index.html while we render).
  for (const { path, html } of results) {
    const outDir = path === '/' ? distDir : join(distDir, path);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), html, 'utf8');
  }

  console.log(
    `[prerender] wrote ${results.length}/${paths.length} routes${failed ? ` (${failed} failed)` : ''}.`,
  );
}

main().catch((err) => {
  // Never fail the production build because of prerendering.
  console.warn(`[prerender] ⚠ Unexpected error — skipping. ${err?.stack || err}`);
});
