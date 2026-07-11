import { readFile } from 'node:fs/promises';

import opentype from 'opentype.js';
import sharp from 'sharp';

const SITE_ORIGIN = 'https://yournexttriptoparadise.com';
const ALLOWED_SOURCE = /^\/assets\/images\/(home|excursions|safaris)\/[a-z0-9/-]+\.webp$/;
const WIDTH = 1080;
const HEIGHT = 1920;
async function loadFont(relativePath) {
  const buffer = await readFile(new URL(relativePath, import.meta.url));
  const data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  return opentype.parse(data);
}

const regularFont = await loadFont('./_assets/DejaVuSans.ttf');
const boldFont = await loadFont('./_assets/DejaVuSans-Bold.ttf');

const NAME_OVERRIDES = new Map([
  ['bwejuu', 'Bwejuu'],
  ['chumbe', 'Chumbe'],
  ['chwaka', 'Chwaka'],
  ['forodhani', 'Forodhani'],
  ['jozani', 'Jozani'],
  ['kizimkazi', 'Kizimkazi'],
  ['maalum', 'Ma’alum'],
  ['mafia', 'Mafia'],
  ['mizingani', 'Mizingani'],
  ['mnemba', 'Mnemba'],
  ['nakupenda', 'Nakupenda'],
  ['nungwi', 'Nungwi'],
  ['pange', 'Pange'],
  ['sauti', 'Sauti'],
  ['stone', 'Stone'],
  ['town', 'Town'],
  ['vip', 'VIP'],
  ['zanzibar', 'Zanzibar'],
  ['ziff', 'ZIFF'],
]);

function titleFromSource(source) {
  const slug = source.split('/').at(-1).replace(/\.webp$/, '');
  return slug
    .split('-')
    .map((word) => NAME_OVERRIDES.get(word) || `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ')
    .replace('Sup', 'SUP');
}

function copyForSource(source) {
  if (/sunset|dhow|harbor|waterfront/.test(source)) {
    return 'Golden light, warm ocean air, and Zanzibar moving at its own rhythm.';
  }
  if (/snorkel|reef|lagoon|sandbank|dolphin|diving|mnemba|kayak|marine|ocean/.test(source)) {
    return 'Clear water, coral worlds, and another unforgettable day in paradise.';
  }
  if (/spice|cooking|coffee|herbal|forodhani/.test(source)) {
    return 'Taste the stories, traditions, and unmistakable spirit of Zanzibar.';
  }
  if (/stone-town|hidden-alleys|ruins|baths|dhow-heritage|village/.test(source)) {
    return 'Go beyond the postcard and discover the stories that shaped the island.';
  }
  if (/safaris\//.test(source)) {
    return 'Wild landscapes, unforgettable encounters, and Tanzania at its most extraordinary.';
  }
  if (/home\//.test(source)) {
    return 'Your next journey to Zanzibar and Tanzania starts right here.';
  }
  return 'Experience Zanzibar beyond the postcard, thoughtfully planned from start to finish.';
}

function wrapText(text, maxCharacters) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function svgPath(text, { x = 88, y, fontSize, weight = 400, fill = '#fff' }) {
  const selectedFont = weight >= 700 ? boldFont : regularFont;
  const scale = fontSize / selectedFont.unitsPerEm;
  let cursor = x;
  let previousGlyph;
  let outline = '';

  for (const character of text) {
    const glyph = selectedFont.charToGlyph(character);
    if (previousGlyph) {
      cursor += selectedFont.getKerningValue(previousGlyph, glyph) * scale;
    }
    outline += glyph.getPath(cursor, y, fontSize).toPathData(2);
    cursor += (glyph.advanceWidth || selectedFont.unitsPerEm) * scale;
    previousGlyph = glyph;
  }

  return `<path d="${outline}" fill="${fill}" />`;
}

function svgTextLines(lines, { startY, lineHeight, fontSize, fontWeight = 400 }) {
  return lines
    .map(
      (line, index) =>
        svgPath(line, {
          y: startY + index * lineHeight,
          fontSize,
          weight: fontWeight,
        }),
    )
    .join('');
}

function createOverlay(source) {
  const title = titleFromSource(source);
  const titleLines = wrapText(title, 23).slice(0, 2);
  const copyLines = wrapText(copyForSource(source), 42).slice(0, 3);
  const titleStart = 1425 - (titleLines.length - 1) * 34;
  const copyStart = titleStart + titleLines.length * 78 + 34;

  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#07111b" stop-opacity="0" />
          <stop offset="48%" stop-color="#07111b" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#07111b" stop-opacity="0.92" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.45" />
        </filter>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#shade)" />
      <g filter="url(#shadow)">
        ${svgPath('DESTINATION PARADISE', { y: 120, fontSize: 30, weight: 700 })}
        <rect x="88" y="148" width="112" height="5" rx="2.5" fill="#f1c56d" />
        ${svgTextLines(titleLines, { startY: titleStart, lineHeight: 74, fontSize: 66, fontWeight: 700 })}
        ${svgTextLines(copyLines, { startY: copyStart, lineHeight: 50, fontSize: 38 })}
        ${svgPath('@yournexttriptoparadise', { y: 1818, fontSize: 29, weight: 700, fill: '#f1c56d' })}
      </g>
    </svg>
  `);
}

export default async (request) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  const source = new URL(request.url).searchParams.get('src') || '';
  if (!ALLOWED_SOURCE.test(source)) {
    return new Response('Invalid image source', { status: 400 });
  }

  const sourceResponse = await fetch(new URL(source, SITE_ORIGIN));
  if (!sourceResponse.ok) {
    return new Response('Source image unavailable', { status: 502 });
  }

  const sourceImage = Buffer.from(await sourceResponse.arrayBuffer());
  const storyImage = await sharp(sourceImage)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .composite([{ input: createOverlay(source), top: 0, left: 0 }])
    .jpeg({ quality: 86, chromaSubsampling: '4:4:4' })
    .toBuffer();

  return new Response(request.method === 'HEAD' ? null : storyImage, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable',
      'Content-Length': String(storyImage.length),
      'Content-Type': 'image/jpeg',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

export const config = {
  path: '/api/instagram-story-image',
};
