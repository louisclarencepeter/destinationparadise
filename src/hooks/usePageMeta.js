import { useEffect } from 'react';
import { isPrerender } from '../utils/prerender.js';

export const SITE_URL = 'https://destinationparadisezanzibar.netlify.app';
export const SITE_NAME = 'Destination Paradise';
const DEFAULT_DESCRIPTION =
  'Destination Paradise offers bespoke excursions, luxury safaris, and unforgettable packages in Zanzibar & Tanzania.';
const DEFAULT_IMAGE = `${SITE_URL}/assets/brand/og-card.jpg`;

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (content == null) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Upsert a single per-page JSON-LD `<script>` (marked with data-dp-jsonld so it
 * never collides with the static Organization markup baked into index.html).
 * Passing an empty string removes it, keeping client-side navigation clean.
 */
function upsertJsonLd(jsonString) {
  let el = document.head.querySelector('script[data-dp-jsonld]');
  if (!jsonString) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-dp-jsonld', '');
    document.head.appendChild(el);
  }
  el.textContent = jsonString;
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function canonicalFor(pathname) {
  let path = pathname || '/';
  // Drop trailing slashes (keep root) so /booking and /booking/ canonicalize together.
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return `${SITE_URL}${path}`;
}

function absoluteImage(image) {
  if (!image) return DEFAULT_IMAGE;
  return /^https?:\/\//.test(image) ? image : `${SITE_URL}${image}`;
}

/** Collapse whitespace and clamp a body string to a meta-description-friendly length. */
export function clampDescription(text, max = 160) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

/**
 * Single source of truth for per-route head metadata.
 * Updates title, description, canonical, Open Graph, Twitter Card, and robots tags.
 *
 * NOTE: this runs client-side, so it is honored by JS-rendering crawlers (e.g. Googlebot)
 * and keeps in-app navigation / browser tabs correct. Non-JS social scrapers read the
 * static defaults baked into index.html. Per-route social cards require prerendering/SSR.
 *
 * @param {object|string} options - { title, description, image, type, canonical, noindex, jsonLd }.
 *   A string first arg is treated as the title (legacy `usePageMeta(title, description)`).
 *   `jsonLd` is an object/array serialized into a per-page schema.org `<script>`.
 * @param {string} [legacyDescription] - description when called in legacy positional form.
 */
export function usePageMeta(options = {}, legacyDescription) {
  const opts =
    typeof options === 'string' ? { title: options, description: legacyDescription } : options || {};
  const { title, description, image, type = 'website', canonical, noindex = false, jsonLd } = opts;
  // Serialize once so the effect's dependency is a stable primitive (object/array
  // literals are referentially unstable across renders).
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const desc = description || DEFAULT_DESCRIPTION;
    const img = absoluteImage(image);
    const url = canonical
      ? /^https?:\/\//.test(canonical)
        ? canonical
        : `${SITE_URL}${canonical}`
      : canonicalFor(window.location.pathname);
    const ogTitle = title || `${SITE_NAME} — your next trip to paradise`;

    if (title) document.title = title;

    upsertMeta('name', 'description', desc);
    upsertLink('canonical', url);

    upsertMeta('property', 'og:title', ogTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:image', img);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', ogTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', img);

    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    upsertJsonLd(jsonLdString);

    // Signal the build-time prerender crawler that this route's head (meta, OG,
    // canonical, JSON-LD) is fully applied and safe to capture.
    if (isPrerender()) {
      const w = /** @type {any} */ (window);
      w.__DP_META_APPLIED__ = (w.__DP_META_APPLIED__ || 0) + 1;
    }
  }, [title, description, image, type, canonical, noindex, jsonLdString]);
}

export default usePageMeta;
