import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipFunction } from '@netlify/zip-it-and-ship-it';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const OUT = path.join(HERE, 'build');
const SITE_ID = 'f0fa9f3a-0de9-4e62-9809-d64031c415a2';
const ORIGIN = 'https://destination-paradise-mobile.netlify.app';
const names = ['marine', 'planner-report', 'weather'];
const digest = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
const relative = (file) => path.relative(REPO, file).split(path.sep).join('/');
const allowedInputs = new Set([
  ...names.map((name) => `netlify/functions/${name}.mjs`),
  'netlify/functions/_shared.mjs', 'netlify/functions/_weather_proxy.mjs',
]);

const privacyPath = path.join(REPO, 'mobile/release/mobile-privacy.html');
const privacy = await fs.readFile(privacyPath);
assert.ok(privacy.toString().includes(`rel="canonical" href="${ORIGIN}/mobile-privacy.html"`), 'Privacy canonical URL must point to the standalone mobile backend');
const headersPath = path.join(HERE, 'headers.txt');
const headers = await fs.readFile(headersPath);

// Only our generated output is replaced. No website build or source writes.
await fs.rm(OUT, { force: true, recursive: true });
await fs.mkdir(path.join(OUT, 'public'), { recursive: true });
await fs.mkdir(path.join(OUT, 'functions'), { recursive: true });
await fs.writeFile(path.join(OUT, 'public/mobile-privacy.html'), privacy);
await fs.writeFile(path.join(OUT, 'public/_headers'), headers);

const sources = {
  [relative(privacyPath)]: digest(privacy),
  [relative(headersPath)]: digest(headers),
};
const functions = [];
for (const name of names) {
  const result = await zipFunction(path.join(REPO, `netlify/functions/${name}.mjs`), path.join(OUT, 'functions'), {
    basePath: REPO,
    repositoryRoot: REPO,
    config: { '*': { nodeVersion: '22', nodeBundler: 'esbuild' } },
  });
  assert.equal(result?.name, name);
  assert.equal(result.runtimeVersion, 'nodejs22.x');
  assert.equal(result.invocationMode, 'stream');
  assert.equal(result.routes?.length, 1);
  assert.equal(result.routes[0].literal, `/api/${name}`);
  for (const input of result.inputs) {
    const file = relative(input);
    assert.ok(allowedInputs.has(file), `Unexpected function input: ${file}`);
    sources[file] = digest(await fs.readFile(input));
  }
  const zip = await fs.readFile(result.path);
  functions.push({ name, path: `functions/${name}.zip`, sha256: digest(zip), size: zip.length,
    runtime: result.runtimeVersion, invocationMode: result.invocationMode,
    routes: result.routes, excludedRoutes: result.excludedRoutes, priority: result.priority });
}

const manifest = {
  siteId: SITE_ID,
  origin: ORIGIN,
  bundler: { name: '@netlify/zip-it-and-ship-it', version: '15.5.1' },
  sources: Object.fromEntries(Object.entries(sources).sort(([a], [b]) => a.localeCompare(b))),
  files: [
    { path: '/_headers', source: 'public/_headers', sha1: digest(headers, 'sha1'), size: headers.length },
    { path: '/mobile-privacy.html', source: 'public/mobile-privacy.html', sha1: digest(privacy, 'sha1'), size: privacy.length },
  ],
  functions,
};
await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ siteId: SITE_ID, directory: OUT, files: manifest.files.map((file) => file.path), functions: names, networkRequests: 0 }));
