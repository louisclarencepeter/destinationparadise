import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '../locales/en/common.json';
import enNav from '../locales/en/nav.json';
import enFooter from '../locales/en/footer.json';
import enHome from '../locales/en/home.json';
import enExcursions from '../locales/en/excursions.json';
import enSafaris from '../locales/en/safaris.json';
import plCommon from '../locales/pl/common.json';
import plNav from '../locales/pl/nav.json';
import plFooter from '../locales/pl/footer.json';
import plHome from '../locales/pl/home.json';
import plExcursions from '../locales/pl/excursions.json';
import plSafaris from '../locales/pl/safaris.json';
import deCommon from '../locales/de/common.json';
import deNav from '../locales/de/nav.json';
import deFooter from '../locales/de/footer.json';
import deHome from '../locales/de/home.json';
import deExcursions from '../locales/de/excursions.json';
import deSafaris from '../locales/de/safaris.json';

export const SUPPORTED_LANGUAGES = ['en', 'pl', 'de'];
export const DEFAULT_LANGUAGE = 'en';
export const STORAGE_KEY = 'dp_lang';

const localeLoaders = {
  ...import.meta.glob('../locales/*/about.json'),
  ...import.meta.glob('../locales/*/booking.json'),
  ...import.meta.glob('../locales/*/explore.json'),
  ...import.meta.glob('../locales/*/packages.json'),
  ...import.meta.glob('../locales/*/transfers.json'),
  ...import.meta.glob('../locales/*/tripPlanner.json'),
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
      .then((module) => callback(null, module.default || module))
      .catch((error) => callback(error, false));
  },
};

i18n
  .use(LanguageDetector)
  .use(localeBackend)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, nav: enNav, footer: enFooter, home: enHome, excursions: enExcursions, safaris: enSafaris },
      pl: { common: plCommon, nav: plNav, footer: plFooter, home: plHome, excursions: plExcursions, safaris: plSafaris },
      de: { common: deCommon, nav: deNav, footer: deFooter, home: deHome, excursions: deExcursions, safaris: deSafaris },
    },
    partialBundledLanguages: true,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: ['common', 'nav', 'footer', 'home', 'excursions', 'safaris'],
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

export default i18n;
