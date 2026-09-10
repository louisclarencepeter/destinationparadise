import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { isPrerender } from '../utils/prerender.js';

import enCommon from '../locales/en/common.json';
import enNav from '../locales/en/nav.json';
import enFooter from '../locales/en/footer.json';
import enHome from '../locales/en/home.json';
import enPolicy from '../locales/en/policy.json';
import plCommon from '../locales/pl/common.json';
import plNav from '../locales/pl/nav.json';
import plFooter from '../locales/pl/footer.json';
import plHome from '../locales/pl/home.json';
import deCommon from '../locales/de/common.json';
import deNav from '../locales/de/nav.json';
import deFooter from '../locales/de/footer.json';
import deHome from '../locales/de/home.json';

export const SUPPORTED_LANGUAGES = ['en', 'pl', 'de'];
export const DEFAULT_LANGUAGE = 'en';
export const STORAGE_KEY = 'dp_lang';

const localeLoaders = {
  ...import.meta.glob([
    '../locales/*/about.json',
    '../locales/*/booking.json',
    '../locales/*/catalog.json',
    '../locales/*/excursions.json',
    '../locales/*/explore.json',
    '../locales/*/packages.json',
    '../locales/de/policy.json',
    '../locales/pl/policy.json',
    '../locales/*/retreats.json',
    '../locales/*/safaris.json',
    '../locales/*/store.json',
    '../locales/*/transfers.json',
    '../locales/*/tripPlanner.json',
  ]),
};

const localeBackend = {
  type: 'backend',
  read(language, namespace, callback) {
    const baseLanguage = language.split('-')[0];
    const loader = localeLoaders[`../locales/${baseLanguage}/${namespace}.json`];

    if (!loader) {
      callback(new Error(`Missing locale namespace: ${baseLanguage}/${namespace}`), false);
      return;
    }

    loader()
      .then((module) => {
        const loaded = /** @type {{ default?: unknown }} */ (module);
        callback(null, loaded.default || module);
      })
      .catch((error) => callback(error, false));
  },
};

// During the build-time prerender crawl we want deterministic English HTML, so
// we skip the browser language detector and pin the language to the default.
const prerendering = isPrerender();
const i18nChain = prerendering ? i18n : i18n.use(LanguageDetector);

i18nChain
  .use(/** @type {import('i18next').BackendModule} */ (localeBackend))
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, nav: enNav, footer: enFooter, home: enHome, policy: enPolicy },
      pl: { common: plCommon, nav: plNav, footer: plFooter, home: plHome },
      de: { common: deCommon, nav: deNav, footer: deFooter, home: deHome },
    },
    partialBundledLanguages: true,
    ...(prerendering ? { lng: DEFAULT_LANGUAGE } : {}),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: ['common', 'nav', 'footer', 'home'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnNull: false,
  });

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined' && SUPPORTED_LANGUAGES.includes(lng)) {
    document.documentElement.lang = lng;
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.resolvedLanguage || DEFAULT_LANGUAGE;
}

const COUNTRY_TO_LANG = { DE: 'de', PL: 'pl' };

async function applyGeoLanguage() {
  if (typeof window === 'undefined' || isPrerender()) return;
  try {
    if (window.localStorage.getItem(STORAGE_KEY)) return;
  } catch {
    return;
  }
  try {
    const res = await fetch('/api/geo', { credentials: 'omit' });
    if (!res.ok) return;
    const { country } = await res.json();
    const lang = COUNTRY_TO_LANG[country];
    if (lang && lang !== i18n.resolvedLanguage) {
      await i18n.changeLanguage(lang);
    }
  } catch {
    // ignore – fall back to whatever the detector chose
  }
}

applyGeoLanguage();

export default i18n;
