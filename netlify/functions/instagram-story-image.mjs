import { readFile } from 'node:fs/promises';

import opentype from 'opentype.js';
import sharp from 'sharp';

import {
  INSTAGRAM_STORY_ALLOWED_SOURCE as ALLOWED_SOURCE,
  INSTAGRAM_STORY_CARD_BY_ID,
} from '../../data/instagramStoryCards.mjs';

const SITE_ORIGIN = 'https://yournexttriptoparadise.com';
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
  const slug = source.split('/').at(-1).replace(/\.webp$/, '').replace(/-\d+w$/, '');
  return slug
    .split('-')
    .map((word) => NAME_OVERRIDES.get(word) || `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ')
    .replace('Sup', 'SUP');
}

function sourceNumber(source) {
  return [...source].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
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

function textWidth(text, font, fontSize) {
  const scale = fontSize / font.unitsPerEm;
  let width = 0;
  let previousGlyph;
  for (const character of text) {
    const glyph = font.charToGlyph(character);
    if (previousGlyph) width += font.getKerningValue(previousGlyph, glyph) * scale;
    width += (glyph.advanceWidth || font.unitsPerEm) * scale;
    previousGlyph = glyph;
  }
  return width;
}

function svgPath(text, { x = 88, y, fontSize, weight = 400, fill = '#fff', anchor = 'start' }) {
  const selectedFont = weight >= 700 ? boldFont : regularFont;
  const scale = fontSize / selectedFont.unitsPerEm;
  const width = textWidth(text, selectedFont, fontSize);
  let cursor = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
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

function svgTextLines(lines, { x, startY, lineHeight, fontSize, fontWeight = 400, anchor = 'start' }) {
  return lines
    .map(
      (line, index) =>
        svgPath(line, {
          x,
          y: startY + index * lineHeight,
          fontSize,
          weight: fontWeight,
          anchor,
        }),
    )
    .join('');
}

function createOverlay(card) {
  const sourceSeed = sourceNumber(card.id);
  const style = [
    {
      accent: '#f1c56d',
      anchor: 'start',
      gradient: '#07111b',
      textX: 88,
      titleY: 1425,
      titleSize: 66,
      decoration: '<rect x="88" y="276" width="112" height="5" rx="2.5" fill="#f1c56d" />',
    },
    {
      accent: '#77e0d2',
      anchor: 'middle',
      gradient: '#061b2a',
      textX: 540,
      titleY: 1370,
      titleSize: 62,
      decoration: '<circle cx="540" cy="279" r="5" fill="#77e0d2" /><rect x="492" y="277" width="34" height="4" rx="2" fill="#77e0d2" /><rect x="554" y="277" width="34" height="4" rx="2" fill="#77e0d2" />',
    },
    {
      accent: '#ffad82',
      anchor: 'end',
      gradient: '#231019',
      textX: 992,
      titleY: 1390,
      titleSize: 64,
      decoration: '<rect x="824" y="276" width="168" height="5" rx="2.5" fill="#ffad82" />',
    },
    {
      accent: '#f4d678',
      anchor: 'start',
      gradient: '#11180f',
      textX: 104,
      titleY: 1375,
      titleSize: 60,
      decoration: '<rect x="64" y="1260" width="952" height="590" rx="28" fill="#07111b" fill-opacity="0.18" stroke="#f4d678" stroke-opacity="0.75" stroke-width="3" />',
    },
  ][sourceSeed % 4];
  const title = card.title || titleFromSource(card.source);
  const titleLines = wrapText(title, style.anchor === 'middle' ? 25 : 23).slice(0, 2);
  const copyLines = wrapText(card.caption, style.anchor === 'middle' ? 46 : 42).slice(0, 3);
  const titleStart = style.titleY - (titleLines.length - 1) * 34;
  const copyStart = titleStart + titleLines.length * 78 + 34;
  const headerX = style.anchor === 'end' ? 992 : style.anchor === 'middle' ? 540 : 88;

  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#07111b" stop-opacity="0" />
          <stop offset="48%" stop-color="#07111b" stop-opacity="0.08" />
          <stop offset="100%" stop-color="${style.gradient}" stop-opacity="0.94" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.45" />
        </filter>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#shade)" />
      ${style.decoration}
      <g filter="url(#shadow)">
        ${svgPath('DESTINATION PARADISE', { x: headerX, y: 248, fontSize: 30, weight: 700, anchor: style.anchor })}
        ${svgTextLines(titleLines, { x: style.textX, startY: titleStart, lineHeight: 74, fontSize: style.titleSize, fontWeight: 700, anchor: style.anchor })}
        ${svgTextLines(copyLines, { x: style.textX, startY: copyStart, lineHeight: 50, fontSize: 38, anchor: style.anchor })}
        ${svgPath('@yournexttriptoparadise', { x: style.textX, y: 1818, fontSize: 29, weight: 700, fill: style.accent, anchor: style.anchor })}
      </g>
    </svg>
  `);
}

export default async (request) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  const url = new URL(request.url);
  const source = url.searchParams.get('src') || '';
  const card = INSTAGRAM_STORY_CARD_BY_ID.get(url.searchParams.get('card'));
  if (!ALLOWED_SOURCE.test(source) || !card || card.source !== source) {
    return new Response('Invalid image source', { status: 400 });
  }

  const sourceResponse = await fetch(new URL(source, SITE_ORIGIN));
  if (!sourceResponse.ok) {
    return new Response('Source image unavailable', { status: 502 });
  }

  const sourceImage = Buffer.from(await sourceResponse.arrayBuffer());
  const storyImage = await sharp(sourceImage)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .composite([{ input: createOverlay(card), top: 0, left: 0 }])
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
