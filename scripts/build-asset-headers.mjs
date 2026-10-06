// Only files present in this deployment can be cached immutably. A broad
// /assets/:file rule also gave missing chunks a one-year browser cache lifetime
// after a deployment replaced them. Exact paths leave those 404s revalidating.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIST = fileURLToPath(new URL('../dist', import.meta.url));
const GENERATED_START = '# BEGIN GENERATED ASSET CACHE HEADERS';
const GENERATED_END = '# END GENERATED ASSET CACHE HEADERS';
const GENERATED_BLOCK = /# BEGIN GENERATED ASSET CACHE HEADERS\n[\s\S]*?# END GENERATED ASSET CACHE HEADERS\n?/g;
// Vite's default root-level JS/CSS outputs have an eight-character URL-safe hash.
// Do not pin public files, source maps, nested image/font directories, or sw.js.
const HASHED_BUNDLE = /^[A-Za-z0-9._-]+-[A-Za-z0-9_-]{8}\.(?:js|css)$/;

export async function buildAssetHeaders(distDir = DEFAULT_DIST) {
  const headersPath = join(distDir, '_headers');
  const [headers, entries] = await Promise.all([
    readFile(headersPath, 'utf8'),
    readdir(join(distDir, 'assets'), { withFileTypes: true }),
  ]);
  const assets = entries
    .filter((entry) => entry.isFile() && HASHED_BUNDLE.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const rules = assets.map((name) =>
    `/assets/${name}\n  Cache-Control: public, max-age=31536000, immutable\n`,
  ).join('\n');
  const preservedHeaders = headers.replace(GENERATED_BLOCK, '').trimEnd();

  await writeFile(headersPath,
    `${preservedHeaders}\n\n${GENERATED_START}\n${rules}${GENERATED_END}\n`,
    'utf8');
  return assets.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = await buildAssetHeaders();
  console.log(`[asset-headers] wrote immutable cache rules for ${count} emitted bundles`);
}
