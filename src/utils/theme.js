export const THEME_STORAGE_KEY = 'dp_tweaks';

const THEMES = new Set(['light', 'dark']);

export function normalizeTheme(theme) {
  return THEMES.has(theme) ? theme : 'light';
}

export function readStoredTweaks() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || 'null');
    return saved && typeof saved === 'object' ? saved : null;
  } catch (e) {
    return null;
  }
}

export function readStoredTheme(fallback = 'light') {
  const saved = readStoredTweaks();
  if (saved?.theme) return normalizeTheme(saved.theme);
  return normalizeTheme(document.documentElement.getAttribute('data-theme') || fallback);
}

export function persistTheme(theme) {
  const nextTheme = normalizeTheme(theme);
  try {
    const saved = readStoredTweaks() || {};
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...saved, theme: nextTheme }));
  } catch (e) {
    /* noop */
  }
  return nextTheme;
}

export function applyTheme(theme) {
  const nextTheme = normalizeTheme(theme);
  document.documentElement.setAttribute('data-theme', nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
  return nextTheme;
}

export function announceTheme(theme) {
  window.dispatchEvent(new CustomEvent('dp-theme-change', { detail: { theme: normalizeTheme(theme) } }));
}
