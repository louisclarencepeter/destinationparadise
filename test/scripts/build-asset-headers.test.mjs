import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildAssetHeaders } from '../../scripts/build-asset-headers.mjs';

const publicHeaders = await readFile(new URL('../../public/_headers', import.meta.url), 'utf8');
const fixtures = [];

async function makeDist(names, headers = publicHeaders) {
  const dist = await mkdtemp(join(tmpdir(), 'dp-asset-headers-'));
  fixtures.push(dist);
  await mkdir(join(dist, 'assets'));
  await writeFile(join(dist, '_headers'), headers);
  for (const name of names) await writeFile(join(dist, 'assets', name), 'bundle');
  return dist;
}

// Resolve cache headers from the actual generated file, including wildcard
// rules, so a broad policy cannot accidentally return alongside exact rules.
function cacheHeadersFor(headers, requestPath) {
  let matches = false;
  const values = [];
  for (const line of headers.split('\n')) {
    if (line.startsWith('/')) {
      const pattern = line.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replaceAll('*', '.*').replace(/:\w+/g, '[^/]+');
      matches = new RegExp(`^${pattern}$`).test(requestPath);
    } else if (matches && /^\s+Cache-Control:/i.test(line)) {
      values.push(line.trim().slice('Cache-Control:'.length).trim());
    }
  }
  return values;
}

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((dist) => rm(dist, { recursive: true, force: true })));
});

describe('built asset cache headers', () => {
  it('pins only present hashed bundles, leaving missing chunks and HTML revalidating', async () => {
    const dist = await makeDist([
      'index-AbC_12-3.js', 'TripPlanner-XyZ12345.css', 'plain.js', 'styles.css',
      'index-AbC_12-3.js.map', 'logo-XyZ12345.png',
    ]);
    // Neither a nested public asset nor a directory that resembles a chunk is
    // generated bundle output.
    await mkdir(join(dist, 'assets', 'images'));
    await writeFile(join(dist, 'assets', 'images', 'photo-XyZ12345.js'), 'public asset');
    await mkdir(join(dist, 'assets', 'directory-XyZ12345.js'));

    expect(await buildAssetHeaders(dist)).toBe(2);
    const headers = await readFile(join(dist, '_headers'), 'utf8');
    for (const path of ['/assets/index-AbC_12-3.js', '/assets/TripPlanner-XyZ12345.css']) {
      expect(cacheHeadersFor(headers, path)).toEqual(['public, max-age=31536000, immutable']);
    }
    for (const path of [
      '/assets/old-AbC_12-3.js', '/assets/missing-XyZ12345.css', '/assets/plain.js',
      '/assets/styles.css', '/assets/index-AbC_12-3.js.map', '/assets/logo-XyZ12345.png',
      '/assets/directory-XyZ12345.js', '/', '/trip-planner/', '/index.html', '/sw.js',
    ]) {
      expect(cacheHeadersFor(headers, path), path).toEqual([]);
    }
    expect(headers.startsWith(publicHeaders.trimEnd())).toBe(true);
    expect(cacheHeadersFor(headers, '/assets/images/photo.webp'))
      .toEqual(['public, max-age=86400, stale-while-revalidate=604800']);
    expect(cacheHeadersFor(headers, '/assets/brand/logo.svg'))
      .toEqual(['public, max-age=86400, stale-while-revalidate=604800']);
    expect(cacheHeadersFor(headers, '/assets/fonts/font.woff2'))
      .toEqual(['public, max-age=31536000, immutable']);
    for (const path of ['/store/checkout', '/store/checkout/', '/store/order/private-token']) {
      expect(cacheHeadersFor(headers, path)).toEqual(['no-store']);
    }
  });

  it('is idempotent and removes stale generated paths while preserving staging and security rules', async () => {
    const dist = await makeDist(['old-AbC_12-3.js']);
    await buildAssetHeaders(dist);
    const headersPath = join(dist, '_headers');
    const first = await readFile(headersPath, 'utf8');
    await buildAssetHeaders(dist);
    expect(await readFile(headersPath, 'utf8')).toBe(first);

    const staging = '\n# Non-production deploy (branch-deploy): never index staging.\n/*\n  X-Robots-Tag: noindex\n';
    await writeFile(headersPath, `${first}${staging}`);
    await rm(join(dist, 'assets', 'old-AbC_12-3.js'));
    await writeFile(join(dist, 'assets', 'new-XyZ12345.js'), 'new bundle');
    expect(await buildAssetHeaders(dist)).toBe(1);

    const updated = await readFile(headersPath, 'utf8');
    expect(updated).not.toContain('/assets/old-AbC_12-3.js');
    expect(cacheHeadersFor(updated, '/assets/new-XyZ12345.js'))
      .toEqual(['public, max-age=31536000, immutable']);
    expect(updated).toContain(staging.trim());
    expect(updated.startsWith(publicHeaders.trimEnd())).toBe(true);
    await buildAssetHeaders(dist);
    expect(await readFile(headersPath, 'utf8')).toBe(updated);
  });

  it('runs after prerender and before staging robots headers in the production build', async () => {
    const { scripts } = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
    const steps = scripts.build.split(' && ');
    const position = steps.indexOf('node scripts/build-asset-headers.mjs');
    expect(position).toBeGreaterThan(steps.indexOf('node scripts/prerender.mjs'));
    expect(position).toBeLessThan(steps.indexOf('node scripts/build-staging-headers.mjs'));
  });
});
