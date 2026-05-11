#!/usr/bin/env node
/**
 * Scans every .webp under public/assets/images, reads intrinsic dimensions
 * from the WebP header (no third-party deps), and writes a manifest of
 *   { "/assets/images/.../foo.webp": { w, h, has600w } }
 * to src/data/imageManifest.json.
 *
 * Used by <ResponsiveImage> to declare accurate srcset widths and explicit
 * width/height attributes — fixes the Lighthouse "Properly size images"
 * audit and reduces CLS.
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const IMAGES_ROOT = join(REPO_ROOT, 'public', 'assets', 'images');
const OUTPUT = join(REPO_ROOT, 'src', 'data', 'imageManifest.json');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.isFile() && entry.name.endsWith('.webp')) yield path;
  }
}

function readWebpDimensions(buf, path) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`Not a WebP: ${path}`);
  }
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    const w = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1;
    const h = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1;
    return { w, h };
  }
  if (chunk === 'VP8 ') {
    const w = ((buf[27] << 8) | buf[26]) & 0x3fff;
    const h = ((buf[29] << 8) | buf[28]) & 0x3fff;
    return { w, h };
  }
  if (chunk === 'VP8L') {
    const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
    const w = (b0 | ((b1 & 0x3f) << 8)) + 1;
    const h = (((b1 >> 6) | (b2 << 2) | ((b3 & 0xf) << 10))) + 1;
    return { w, h };
  }
  throw new Error(`Unknown WebP chunk "${chunk}" in ${path}`);
}

const exists = (p) => stat(p).then(() => true, () => false);

const manifest = {};
for await (const file of walk(IMAGES_ROOT)) {
  const rel = '/' + relative(join(REPO_ROOT, 'public'), file).split(sep).join('/');
  if (rel.endsWith('-600w.webp')) continue;
  const buf = await readFile(file);
  const { w, h } = readWebpDimensions(buf, file);
  const variantPath = file.replace(/\.webp$/, '-600w.webp');
  let smallW = 0;
  if (await exists(variantPath)) {
    const smallBuf = await readFile(variantPath);
    smallW = readWebpDimensions(smallBuf, variantPath).w;
  }
  manifest[rel] = smallW ? { w, h, smallW } : { w, h };
}

const sorted = Object.fromEntries(
  Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))
);

await writeFile(OUTPUT, JSON.stringify(sorted, null, 2) + '\n');
console.log(`Wrote ${Object.keys(sorted).length} entries → ${relative(REPO_ROOT, OUTPUT)}`);
