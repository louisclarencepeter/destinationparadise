import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dp_language';
const SOURCE_LANGUAGE = 'pl';
const SUPPORTED_LANGUAGES = [
  { value: 'pl', label: 'PL', title: 'Polski' },
  { value: 'en', label: 'EN', title: 'English' },
];

function ensureGoogleTranslateMount() {
  let mount = document.getElementById('google_translate_element');
  if (mount) return mount;

  mount = document.createElement('div');
  mount.id = 'google_translate_element';
  mount.className = 'language-switcher__mount';
  mount.setAttribute('aria-hidden', 'true');
  document.body.appendChild(mount);
  return mount;
}

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.some((item) => item.value === stored)) return stored;
  } catch {
    /* no-op */
  }

  return document.cookie.includes('googtrans=/pl/en') ? 'en' : 'pl';
}

function writeTranslateCookie(lang) {
  const value = lang === SOURCE_LANGUAGE ? '' : `/${SOURCE_LANGUAGE}/${lang}`;
  const maxAge = value ? 60 * 60 * 24 * 365 : 0;
  const host = window.location.hostname;
  const cookie = `googtrans=${value};path=/;max-age=${maxAge};SameSite=Lax`;

  document.cookie = cookie;
  if (host.includes('.')) {
    document.cookie = `${cookie};domain=.${host}`;
  }
}

function loadGoogleTranslate() {
  ensureGoogleTranslateMount();
  if (window.google?.translate?.TranslateElement) return;

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) return;
    new window.google.translate.TranslateElement(
      {
        pageLanguage: SOURCE_LANGUAGE,
        includedLanguages: SUPPORTED_LANGUAGES.map((item) => item.value).join(','),
        autoDisplay: false,
      },
      'google_translate_element',
    );
  };

  if (document.querySelector('script[src*="translate_a/element.js"]')) return;

  const script = document.createElement('script');
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.head.appendChild(script);
}

export default function LanguageSwitcher({ className = '' }) {
  const [language, setLanguage] = useState('pl');

  useEffect(() => {
    const nextLanguage = readStoredLanguage();
    setLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage;
    loadGoogleTranslate();
  }, []);

  const selectLanguage = (nextLanguage) => {
    if (nextLanguage === language) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
      /* no-op */
    }

    document.documentElement.lang = nextLanguage;
    writeTranslateCookie(nextLanguage);
    setLanguage(nextLanguage);
    window.location.reload();
  };

  return (
    <div className={`language-switcher notranslate ${className}`.trim()} translate="no" aria-label="Wybór języka">
      {SUPPORTED_LANGUAGES.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`language-switcher__btn${language === item.value ? ' is-active' : ''}`}
          onClick={() => selectLanguage(item.value)}
          aria-pressed={language === item.value}
          title={item.title}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
