export const THEME_STORAGE_KEY = 'dp_tweaks';

const THEMES = new Set(['light', 'dark']);
const THEME_MODES = new Set(['auto', 'light', 'dark']);
const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 18;
const DARK_QUERY = '(prefers-color-scheme: dark)';
const LIGHT_QUERY = '(prefers-color-scheme: light)';

export function normalizeTheme(theme) {
  return THEMES.has(theme) ? theme : 'light';
}

export function normalizeThemeMode(mode) {
  return THEME_MODES.has(mode) ? mode : 'auto';
}

export function readStoredTweaks() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || 'null');
    return saved && typeof saved === 'object' ? saved : null;
  } catch (e) {
    return null;
  }
}

export function readStoredThemeMode() {
  const saved = readStoredTweaks();
  return normalizeThemeMode(saved?.themeMode);
}

export function readStoredTheme(fallback = 'light') {
  return resolveThemeForMode(readStoredThemeMode(), fallback);
}

export function persistTheme(theme) {
  return persistThemeMode(normalizeTheme(theme), theme).theme;
}

export function persistThemeMode(mode, theme = resolveThemeForMode(mode)) {
  const nextMode = normalizeThemeMode(mode);
  const nextTheme = normalizeTheme(theme);

  try {
    const saved = readStoredTweaks() || {};
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...saved, themeMode: nextMode, theme: nextTheme }));
  } catch (e) {
    /* noop */
  }

  return { mode: nextMode, theme: nextTheme };
}

function getThemeQuery(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  try {
    return window.matchMedia(query);
  } catch (e) {
    return null;
  }
}

export function readSystemThemePreference() {
  const darkQuery = getThemeQuery(DARK_QUERY);
  if (darkQuery?.matches) return 'dark';

  const lightQuery = getThemeQuery(LIGHT_QUERY);
  if (lightQuery?.matches) return 'light';

  return null;
}

export function resolveTimeTheme(date = new Date()) {
  const hour = date.getHours();
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'light' : 'dark';
}

export function resolveAutomaticTheme(fallback = 'light') {
  return readSystemThemePreference() || resolveTimeTheme(new Date()) || normalizeTheme(fallback);
}

export function resolveThemeForMode(mode = 'auto', fallback = 'light') {
  const nextMode = normalizeThemeMode(mode);
  return nextMode === 'auto' ? resolveAutomaticTheme(fallback) : normalizeTheme(nextMode);
}

function getNextTimeThemeChangeDelay(now = new Date()) {
  const next = new Date(now);
  const hour = now.getHours();

  if (hour < DAY_START_HOUR) {
    next.setHours(DAY_START_HOUR, 0, 0, 0);
  } else if (hour < NIGHT_START_HOUR) {
    next.setHours(NIGHT_START_HOUR, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(DAY_START_HOUR, 0, 0, 0);
  }

  return Math.max(1000, next.getTime() - now.getTime() + 1000);
}

function addThemeQueryListener(query, callback) {
  if (!query) return () => {};
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', callback);
    return () => query.removeEventListener('change', callback);
  }
  if (typeof query.addListener === 'function') {
    query.addListener(callback);
    return () => query.removeListener(callback);
  }
  return () => {};
}

export function watchAutomaticTheme(onThemeChange) {
  if (typeof window === 'undefined') return () => {};

  let timeoutId = 0;
  let disposed = false;

  const scheduleTimeFallback = () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = 0;

    if (readSystemThemePreference()) return;
    timeoutId = window.setTimeout(updateTheme, getNextTimeThemeChangeDelay());
  };

  const updateTheme = () => {
    if (disposed) return;
    onThemeChange(resolveAutomaticTheme());
    scheduleTimeFallback();
  };

  const stopDarkListener = addThemeQueryListener(getThemeQuery(DARK_QUERY), updateTheme);
  const stopLightListener = addThemeQueryListener(getThemeQuery(LIGHT_QUERY), updateTheme);
  updateTheme();

  return () => {
    disposed = true;
    if (timeoutId) window.clearTimeout(timeoutId);
    stopDarkListener();
    stopLightListener();
  };
}

export function applyTheme(theme) {
  const nextTheme = normalizeTheme(theme);
  document.documentElement.setAttribute('data-theme', nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
  return nextTheme;
}

export function announceTheme(theme, mode = readStoredThemeMode()) {
  window.dispatchEvent(new CustomEvent('dp-theme-change', {
    detail: {
      theme: normalizeTheme(theme),
      mode: normalizeThemeMode(mode),
    },
  }));
}
