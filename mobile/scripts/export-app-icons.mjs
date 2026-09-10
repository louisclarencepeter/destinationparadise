import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const mobile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const review = path.join(mobile, 'release/icon-review');
export const approvedIconSource = path.join(review, 'full-logo-navy-candidate.png');
export const approvedIconSha256 = 'b1e8e1625f0ff36a66613afa5905af38d01b881a786136d74a297b04dec72b1d';
export const iconBackground = '#031C32';
export const iconProvenance = 'Mechanical size export of the owner-approved full-logo navy candidate. The candidate was AI-assisted; this export preserves its entire artwork without redrawing or recoloring.';
export const iconAiDeclaration = 'Created or edited using AI: owner-approved navy full-logo image. Mechanical platform export; not a native screenshot.';

const hash = async (filename) => createHash('sha256').update(await fs.readFile(filename)).digest('hex');
const pngOptions = { compressionLevel: 9, palette: false };

async function verifySource() {
  const meta = await sharp(approvedIconSource).metadata();
  if (await hash(approvedIconSource) !== approvedIconSha256 || meta.width !== 1254 || meta.height !== 1254 || meta.hasAlpha) {
    throw new Error('The approved icon source has changed; review a new source before exporting.');
  }
}

export async function exportPlayStoreIcon(target) {
  await verifySource();
  await sharp(approvedIconSource).resize(512, 512, { kernel: 'lanczos3' }).toColourspace('srgb').ensureAlpha(1).png(pngOptions).toFile(target);
}

async function artworkBounds(filename) {
  const { data, info } = await sharp(filename).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1, maxRadius = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const offset = (y * info.width + x) * info.channels;
      // The approved navy's red/green channels remain below 48. This threshold
      // measures its ivory/coral motifs, including antialiasing, without editing them.
      if (Math.max(data[offset], data[offset + 1]) <= 48) continue;
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
      maxRadius = Math.max(maxRadius, Math.hypot(x - (info.width - 1) / 2, y - (info.height - 1) / 2));
    }
  }
  return { left, top, right, bottom, width: right - left + 1, height: bottom - top + 1, maxRadiusFromCanvasCentre: maxRadius, threshold: 'max(red, green) > 48' };
}

async function main() {
  await verifySource();
  const assets = path.join(mobile, 'assets');
  const outputs = [
    ['icon.png', 1024],
    ['splash-icon.png', 512],
    ['favicon.png', 48],
  ];
  for (const [filename, size] of outputs) {
    await sharp(approvedIconSource).resize(size, size, { kernel: 'lanczos3' }).toColourspace('srgb').removeAlpha().png(pngOptions).toFile(path.join(assets, filename));
  }

  // Keep the complete approved square. Centre its measured visible artwork
  // (source bounds x66..1120/y64..1035), not the unequal empty navy margins.
  // At 696px the entire motif fits the Android 66/108 guaranteed central circle.
  const androidSquare = await sharp(approvedIconSource).resize(696, 696, { kernel: 'lanczos3' }).removeAlpha().png(pngOptions).toBuffer();
  const foreground = path.join(assets, 'android-icon-foreground.png');
  // Copy only the boundary navy pixels outward. This mechanical padding avoids
  // a visible flat-color rectangle around the candidate's slightly varied navy.
  await sharp(androidSquare).extend({ left: 182, right: 146, top: 207, bottom: 121, extendWith: 'copy' })
    .removeAlpha().png(pngOptions).toFile(foreground);

  const playIcon = path.join(mobile, 'release/assets/google-play-icon-512.png');
  await exportPlayStoreIcon(playIcon);
  const entries = [
    ...outputs.map(([filename, size]) => ({ filename: path.join(assets, filename), size, alpha: false })),
    { filename: foreground, size: 1024, alpha: false },
    { filename: playIcon, size: 512, alpha: true },
  ];
  const files = [];
  for (const entry of entries) {
    const meta = await sharp(entry.filename).metadata();
    const bytes = (await fs.stat(entry.filename)).size;
    if (meta.width !== entry.size || meta.height !== entry.size || meta.hasAlpha !== entry.alpha || meta.space !== 'srgb') throw new Error(`Unexpected export format: ${entry.filename}`);
    if (entry.filename === playIcon && bytes > 1024 * 1024) throw new Error('Google Play icon exceeds 1MB');
    files.push({ file: path.relative(mobile, entry.filename), width: meta.width, height: meta.height, channels: meta.channels, alphaChannel: meta.hasAlpha, colorSpace: meta.space, bytes, sha256: await hash(entry.filename) });
  }
  const androidBounds = await artworkBounds(foreground);
  const safeRadius = 1024 * 66 / 108 / 2;
  if (androidBounds.maxRadiusFromCanvasCentre >= safeRadius) throw new Error('Android artwork exceeds the guaranteed adaptive safe area');
  const manifest = {
    source: path.relative(mobile, approvedIconSource), sourceSha256: approvedIconSha256,
    approval: 'Owner selected the full-logo navy candidate for the next app build.',
    state: 'Applied locally; native builds and provider uploads are separate steps.',
    generator: 'scripts/export-app-icons.mjs', provenance: iconProvenance,
    aiAssetDeclaration: iconAiDeclaration, backingColor: iconBackground,
    backgroundNote: 'The approved raster has subtle navy variation. #031C32 approximates its corner colors; the approved pixels are unchanged apart from resizing.',
    android: { canvas: 1024, approvedSquareSize: 696, placement: { left: 182, top: 207 }, padding: 'Boundary navy pixels extended with copy; no artwork altered or cropped.', artworkBounds: androidBounds, guaranteedSafeRadius: safeRadius, allMeasuredArtworkInsideSafeCircle: true },
    files,
  };
  await fs.writeFile(path.join(review, 'icon-export-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const playManifestPath = path.join(mobile, 'release/assets/play-promotional-assets.json');
  const playManifest = JSON.parse(await fs.readFile(playManifestPath, 'utf8'));
  const playFile = files.find((file) => file.file.endsWith('google-play-icon-512.png'));
  const playEntry = playManifest.files.find((file) => file.file === 'google-play-icon-512.png');
  Object.assign(playEntry, {
    sha256: playFile.sha256, bytes: playFile.bytes,
    source: 'mobile/release/icon-review/full-logo-navy-candidate.png',
    sourceSha256: approvedIconSha256,
    altText: 'The complete Destination Paradise logo in ivory and coral on navy, including its wording, traveller, palms, sailboat and rays.',
    provenance: iconProvenance, aiAssetDeclaration: iconAiDeclaration,
    alpha: true, fullyOpaque: true,
  });
  playManifest.iconExportState = 'Owner-approved full-logo navy icon applied locally; replacement has not been uploaded to Google Play.';
  await fs.writeFile(playManifestPath, JSON.stringify(playManifest, null, 2) + '\n');
  console.log(JSON.stringify({ files, android: manifest.android }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
