// Prerender detection.
//
// The build-time prerender crawl (scripts/prerender.mjs) drives the real app in
// headless Chromium and sets `window.__PRERENDER__ = true` BEFORE the bundle
// runs. Browser-only code that is non-deterministic, network-bound, or that
// would bake live widget state into the captured HTML checks this flag and
// short-circuits, so the prerendered markup stays clean and reproducible:
//   - i18n: force the default language, skip the browser detector + geo lookup
//   - CurrencyContext: skip the mount-time FX fetch (fallback rates are fine)
//   - MapSection: skip Leaflet init (no live map DOM / tile network in output)
//
// At runtime in a normal browser the flag is undefined, so behaviour is unchanged.
export function isPrerender() {
  return typeof window !== 'undefined' && Boolean(/** @type {any} */ (window).__PRERENDER__);
}

export default isPrerender;
