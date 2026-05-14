import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '../locales/en/common.json';
import enNav from '../locales/en/nav.json';
import enFooter from '../locales/en/footer.json';
import enHome from '../locales/en/home.json';
import plCommon from '../locales/pl/common.json';
import plNav from '../locales/pl/nav.json';
import plFooter from '../locales/pl/footer.json';
import plHome from '../locales/pl/home.json';

export const SUPPORTED_LANGUAGES = ['en', 'pl'];
export const DEFAULT_LANGUAGE = 'en';
export const STORAGE_KEY = 'dp_lang';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, nav: enNav, footer: enFooter, home: enHome },
      pl: { common: plCommon, nav: plNav, footer: plFooter, home: plHome },
    },
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

export default i18n;
