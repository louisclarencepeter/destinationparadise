const COLORS = [
  ['#13384d', '#ff6b5f'],
  ['#173f48', '#e0b873'],
  ['#253552', '#7fb7aa'],
  ['#3b344a', '#ff8a65'],
  ['#0f3a3f', '#9fd3c7'],
  ['#20344f', '#d98b75'],
  ['#2d3f34', '#d9c27a'],
  ['#18364f', '#b7d7e8'],
];

function hashText(value) {
  return [...String(value)].reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function lineText(value, max = 26) {
  const words = String(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) lines.push(line);
  return lines.slice(0, 3);
}

export function productPlaceholderImage({ id, title, category, scope = 'Product' }) {
  const palette = COLORS[Math.abs(hashText(id || title)) % COLORS.length];
  const titleLines = lineText(title || 'Photo coming soon', 24);
  const categoryLabel = escapeXml(category || scope);
  const titleStartY = 278 - ((titleLines.length - 1) * 22);

  const titleMarkup = titleLines.map((line, index) => (
    `<text x="450" y="${titleStartY + index * 44}" fill="#f4f0e8" font-family="Georgia, serif" font-size="34" font-weight="700" text-anchor="middle">${escapeXml(line)}</text>`
  )).join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${palette[0]}"/>
          <stop offset="1" stop-color="#071f2c"/>
        </linearGradient>
        <radialGradient id="glow" cx="75%" cy="20%" r="60%">
          <stop offset="0" stop-color="${palette[1]}" stop-opacity=".52"/>
          <stop offset="1" stop-color="${palette[1]}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="620" fill="url(#bg)"/>
      <rect width="900" height="620" fill="url(#glow)"/>
      <path d="M-80 500 C 120 410, 245 545, 430 464 S 735 352, 980 456 L 980 700 L -80 700 Z" fill="#ffffff" opacity=".08"/>
      <path d="M286 128 C 386 86, 512 86, 614 128" fill="none" stroke="${palette[1]}" stroke-width="9" stroke-linecap="round" opacity=".55"/>
      <text x="450" y="154" fill="${palette[1]}" font-family="Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="8" text-anchor="middle">${escapeXml(scope.toUpperCase())}</text>
      <text x="450" y="206" fill="#b7c8d4" font-family="Arial, sans-serif" font-size="23" font-weight="700" letter-spacing="4" text-anchor="middle">PHOTO COMING SOON</text>
      ${titleMarkup}
      <text x="450" y="478" fill="#b7c8d4" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3" text-anchor="middle">${categoryLabel}</text>
    </svg>
  `.trim().replace(/\s+/g, ' ');

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function uniqueProductImages(products, { scope = 'Product', idKey = 'id', titleKey = 'title' } = {}) {
  const seen = new Set();

  return products.map((product) => {
    const image = product.image;
    if (!image || seen.has(image)) {
      return {
        ...product,
        originalImage: image || null,
        image: productPlaceholderImage({
          id: product[idKey] || product.slug || product[titleKey],
          title: product[titleKey],
          category: product.category || product.positioning,
          scope,
        }),
        imageNeeded: true,
        imageTBD: true,
      };
    }

    seen.add(image);
    return product;
  });
}
