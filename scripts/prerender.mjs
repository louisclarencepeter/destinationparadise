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

// On Netlify/CI, puppeteer's bundled Chromium usually can't launch (it's skipped
// from download and/or the build image lacks the system libs it needs). There we
// drive @sparticuz/chromium — a self-contained Chromium built for serverless/CI —
// instead. Locally we keep using puppeteer's own Chromium (fast, already cached).
const ON_CI = !!(process.env.NETLIFY || process.env.CI);

// Use @sparticuz/chromium when on CI (override with PRERENDER_CHROMIUM=sparticuz|bundled).
const USE_SPARTICUZ = process.env.PRERENDER_CHROMIUM
  ? process.env.PRERENDER_CHROMIUM === 'sparticuz'
  : ON_CI;

// Strict mode fails the build instead of silently shipping a bare SPA shell when
// prerendering can't run — so missing SEO HTML can't regress unnoticed. On by
// default in CI; disable with PRERENDER_STRICT=false (or skip with PRERENDER=false).
const STRICT = process.env.PRERENDER_STRICT
  ? !['false', '0', 'no'].includes(process.env.PRERENDER_STRICT.toLowerCase())
  : ON_CI;
const ROUTE_RETRIES = Math.max(0, Number(process.env.PRERENDER_ROUTE_RETRIES || 1));

const BASE_ARGS = ['--no-sandbox', '--disable-setuid-sandbox'];

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

async function renderRouteWithRetry(browser, port, path) {
  let lastErr;

  for (let attempt = 0; attempt <= ROUTE_RETRIES; attempt += 1) {
    try {
      return await renderRoute(browser, port, path);
    } catch (err) {
      lastErr = err;
      if (attempt < ROUTE_RETRIES) {
        console.warn(`[prerender] retry ${attempt + 1}/${ROUTE_RETRIES} ${path} — ${err.message}`);
      }
    }
  }

  throw lastErr || new Error(`failed to prerender ${path}`);
}

// Launch Chromium, trying each viable strategy in order so a single broken
// environment doesn't silently skip the whole crawl. Returns a browser or throws
// the last error (the caller decides whether that's fatal — see STRICT).
async function launchBrowser(puppeteer) {
  const strategies = [];

  const explicit = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (explicit) {
    strategies.push({
      name: `executablePath (${explicit})`,
      opts: async () => ({ headless: true, executablePath: explicit, args: BASE_ARGS }),
    });
  }

  if (USE_SPARTICUZ) {
    strategies.push({
      name: '@sparticuz/chromium',
      opts: async () => {
        const { default: chromium } = await import('@sparticuz/chromium');
        return {
          headless: chromium.headless ?? true,
          args: [...chromium.args, ...BASE_ARGS],
          executablePath: await chromium.executablePath(),
          defaultViewport: chromium.defaultViewport,
        };
      },
    });
  }

  // puppeteer's own bundled Chromium — primary path locally, last-resort on CI.
  strategies.push({
    name: 'puppeteer bundled Chromium',
    opts: async () => ({ headless: true, args: BASE_ARGS }),
  });

  let lastErr;
  for (const s of strategies) {
    try {
      const browser = await puppeteer.launch(await s.opts());
      console.log(`[prerender] launched Chromium via ${s.name}.`);
      return browser;
    } catch (err) {
      lastErr = err;
      console.warn(`[prerender] launch via ${s.name} failed: ${err.message}`);
    }
  }
  throw lastErr || new Error('no Chromium launch strategy available');
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
    browser = await launchBrowser(puppeteer);
  } catch (err) {
    server.close();
    const msg = `Could not launch Chromium for prerender — ${err.message}`;
    if (STRICT) {
      throw new Error(
        `${msg}\n  Set PRERENDER=false to ship the SPA without prerendered SEO, ` +
          `or PRERENDER_STRICT=false to warn instead of failing.`,
      );
    }
    console.warn(`\n[prerender] ⚠ ${msg} — skipping. SPA ships with client-side meta only.\n`);
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
        const html = await renderRouteWithRetry(browser, port, path);
        results.push({ path, html });
        console.log(`[prerender] ✓ ${path}`);
      } catch (err) {
        failed += 1;
        console.warn(`[prerender] ✗ ${path} — ${err.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, paths.length) }, worker));

  let notFoundHtml = '';
  try {
    notFoundHtml = await renderRouteWithRetry(browser, port, '/404');
    console.log('[prerender] ✓ /404');
  } catch (err) {
    failed += 1;
    console.warn(`[prerender] ✗ /404 — ${err.message}`);
  }

  await browser.close().catch(() => {});
  server.close();

  // Flush after the crawl so the base shell isn't mutated mid-crawl (the SPA
  // fallback keeps serving the original index.html while we render).
  for (const { path, html } of results) {
    const outDir = path === '/' ? distDir : join(distDir, path);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), html, 'utf8');
  }
  if (notFoundHtml) {
    await writeFile(join(distDir, '404.html'), notFoundHtml, 'utf8');
  }

  console.log(
    `[prerender] wrote ${results.length}/${paths.length} routes${failed ? ` (${failed} failed)` : ''}.`,
  );

  // Chromium launched but every route failed — the build would ship a bare shell.
  // Treat that like a launch failure so it can't silently regress SEO.
  if (STRICT && results.length === 0 && paths.length > 0) {
    throw new Error(`prerendered 0/${paths.length} routes — refusing to ship a bare SPA shell.`);
  }
  if (STRICT && failed > 0) {
    throw new Error(`prerender failed for ${failed} route${failed === 1 ? '' : 's'} — refusing to ship partial SEO output.`);
  }
  if (STRICT && !notFoundHtml) {
    throw new Error('could not prerender 404.html — refusing to ship soft 404 fallback.');
  }
}

main().catch((err) => {
  if (STRICT) {
    // Fail the build loudly so missing prerendered HTML can't ship unnoticed.
    console.error(`\n[prerender] ✖ ${err?.message || err}\n`);
    process.exitCode = 1;
    return;
  }
  console.warn(`[prerender] ⚠ Unexpected error — skipping. ${err?.stack || err}`);
});
