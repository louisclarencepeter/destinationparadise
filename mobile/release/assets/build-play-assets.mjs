import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const output = path.dirname(fileURLToPath(import.meta.url));
const mobile = path.resolve(output, '../..');
const repo = path.resolve(mobile, '..');
const scriptFontPath = path.join(mobile, 'node_modules/@expo-google-fonts/kaushan-script/400Regular/KaushanScript_400Regular.ttf');
const sansFontPath = path.join(mobile, 'node_modules/@expo-google-fonts/montserrat/500Medium/Montserrat_500Medium.ttf');
const outlines = JSON.parse(execFileSync('python3', [path.join(output, 'font-outlines.py')], { encoding: 'utf8' }));
const ink = '#F7FAFC';
const coral = '#FF6F61';

const lettering = (key, color) => `<path fill="${color}" d="${outlines[key]}"/>`;

// Original vector composition. It is promotional illustration, not simulated app UI.
// The title and palette use the existing app's brand system. Outlined type makes
// the SVG self-contained and keeps exact lettering in every export environment.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500" role="img" aria-labelledby="title desc">
<title id="title">Destination Paradise — Zanzibar and Tanzania</title>
<desc id="desc">Destination Paradise lettering beside a sailboat, coral sun and ocean waves. Explore, Plan, Weather.</desc>
<defs>
  <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071C2B"/><stop offset="1" stop-color="#153C50"/></linearGradient>
  <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FF9587"/><stop offset="1" stop-color="#FF6F61"/></linearGradient>
</defs>
<rect width="1024" height="500" fill="url(#sea)"/>
<path d="M0 431 C164 380 273 402 429 432 S772 470 1024 390 V500 H0Z" fill="#163F52"/>
<path d="M0 467 C216 420 290 446 481 465 S833 487 1024 437 V500 H0Z" fill="#1D4A5E"/>
<path d="M607 98 C690 41 827 41 922 99" fill="none" stroke="#315D77" stroke-width="1.5" opacity=".48"/>
<path d="M616 115 C713 65 813 67 902 112" fill="none" stroke="#315D77" stroke-width="1.5" opacity=".28"/>
<circle cx="859" cy="165" r="49" fill="url(#sun)"/>
<path d="M789 152 C752 202 707 260 678 308 C714 318 752 322 784 317Z" fill="#F7F5EF"/>
<path d="M801 176 C823 232 839 271 865 308 L793 318Z" fill="#315D77"/>
<path d="M796 137 L789 334" stroke="#F7F5EF" stroke-width="5" stroke-linecap="round"/>
<path d="M794 140 L666 307" stroke="#96ADBC" stroke-width="1.6"/>
<path d="M666 329 C732 336 815 335 882 324 L858 350 C796 363 732 363 688 349Z" fill="#F7F5EF"/>
<path d="M694 349 C745 357 814 355 862 345 L858 350 C796 363 732 363 688 349Z" fill="${coral}"/>
<g fill="none" stroke-linecap="round">
  <path d="M626 379 C657 370 684 371 712 378 M739 377 C776 367 817 367 851 376 M876 371 L917 367" stroke="#6090A3" stroke-width="2"/>
  <path d="M650 400 C690 393 732 393 766 400 M792 398 C830 388 870 390 901 394" stroke="#315D77" stroke-width="2"/>
  <path d="M717 422 C758 416 802 416 840 420" stroke="#6090A3" stroke-width="1.5" opacity=".65"/>
</g>
<path d="M84 98H117" stroke="${coral}" stroke-width="3"/>
${lettering('region', coral)}
${lettering('destination', ink)}
${lettering('paradise', ink)}
${lettering('explore', '#C5D5DF')}
<circle cx="178" cy="342" r="2.5" fill="${coral}"/>
${lettering('plan', '#C5D5DF')}
<circle cx="254" cy="342" r="2.5" fill="${coral}"/>
${lettering('weather', '#C5D5DF')}
</svg>`;

await fs.mkdir(output, { recursive: true });
const featureSvg = path.join(output, 'google-play-feature-graphic.svg');
const featurePng = path.join(output, 'google-play-feature-graphic.png');
const iconPng = path.join(output, 'google-play-icon-512.png');
const iconSource = path.join(repo, 'public/assets/brand/destination-paradise-logo-512.png');
if (/NaN|undefined|Infinity/.test(svg)) throw new Error('Invalid SVG geometry');
await fs.writeFile(featureSvg, svg);
await sharp(Buffer.from(svg)).removeAlpha().png({ compressionLevel: 9, palette: false }).toFile(featurePng);
// This is an unchanged existing approved asset: no image editing or regeneration.
await fs.copyFile(iconSource, iconPng);

const hash = async (filename) => createHash('sha256').update(await fs.readFile(filename)).digest('hex');
const feature = await sharp(featurePng).metadata();
const icon = await sharp(iconPng).metadata();
if (feature.width !== 1024 || feature.height !== 500 || feature.channels !== 3 || feature.hasAlpha) throw new Error('Feature graphic format mismatch');
if (icon.width !== 512 || icon.height !== 512 || icon.channels !== 4 || icon.space !== 'srgb') throw new Error('Existing icon format mismatch');
if ((await fs.stat(iconPng)).size > 1024 * 1024) throw new Error('Play icon exceeds the upload limit');
if (await hash(iconPng) !== await hash(iconSource)) throw new Error('Approved icon must remain byte-for-byte unchanged');

const manifest = {
  createdAtUtc: new Date().toISOString(),
  scope: 'Local Google Play listing asset candidates; no upload or publication performed.',
  generator: 'build-play-assets.mjs',
  files: [
    {
      file: 'google-play-feature-graphic.png', width: 1024, height: 500, format: '24-bit RGB PNG', alpha: false,
      sha256: await hash(featurePng), bytes: (await fs.stat(featurePng)).size,
      source: 'google-play-feature-graphic.svg',
      altText: 'Destination Paradise: Zanzibar and Tanzania, with a sailboat, coral sun and waves. Explore, Plan, Weather.',
      provenance: 'New AI-assisted vector promotional illustration using the approved app palette and typefaces; no screenshots, photographs or generated raster imagery.',
      aiAssetDeclaration: 'Review as AI-assisted original vector artwork; do not represent this graphic as a native screenshot.',
    },
    {
      file: 'google-play-icon-512.png', width: 512, height: 512, format: '32-bit RGBA PNG', alpha: true,
      sha256: await hash(iconPng), bytes: (await fs.stat(iconPng)).size,
      source: 'public/assets/brand/destination-paradise-logo-512.png',
      altText: 'Destination Paradise circular logo with palm trees, a traveller and a sailboat.',
      provenance: 'Byte-for-byte copy of the existing approved 512px brand asset. No editing, recoloring, resizing or regeneration.',
      aiAssetDeclaration: 'Existing brand asset provenance remains with the owner; this export adds no generated or edited imagery.',
    },
  ],
  typography: [
    { name: 'Kaushan Script Regular', source: path.relative(repo, scriptFontPath), usage: 'Same brand title typeface used by the app; embedded as outlines in SVG.' },
    { name: 'Montserrat Medium', source: path.relative(repo, sansFontPath), usage: 'Same supporting typeface used by the app; embedded as outlines in SVG.' },
  ],
  sourceChecks: [
    'https://support.google.com/googleplay/android-developer/answer/9866151?hl=en',
    'https://developer.android.com/distribute/google-play/resources/icon-design-specifications',
  ],
};
await fs.writeFile(path.join(output, 'play-promotional-assets.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest.files.map(({ file, width, height, format, bytes }) => ({ file, width, height, format, bytes })), null, 2));
