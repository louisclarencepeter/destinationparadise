import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n/index.js';

const LABELS = {
  en: { short: 'EN', long: 'English' },
  pl: { short: 'PL', long: 'Polski' },
  de: { short: 'DE', long: 'Deutsch' },
};

const ARIA_KEYS = {
  en: 'language.switch_to_english',
  pl: 'language.switch_to_polish',
  de: 'language.switch_to_german',
};

const Chevron = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function LanguageSwitcher({ className = '' }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const resolvedLanguage = i18n.resolvedLanguage ?? 'en';
  const active = SUPPORTED_LANGUAGES.includes(resolvedLanguage) ? resolvedLanguage : 'en';

  const choose = (lang) => {
    setOpen(false);
    if (lang === active) return;
    i18n.changeLanguage(lang);
  };

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`lang-switcher${open ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
    >
      <button
        type="button"
        className="lang-switcher__toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language.switcher_label')}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="lang-switcher__current">{LABELS[active].short}</span>
        <Chevron />
      </button>

      {open && (
        <ul
          className="lang-switcher__menu"
          role="listbox"
          aria-label={t('language.switcher_label')}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = lang === active;
            return (
              <li key={lang} role="presentation">
                <button
                  type="button"
                  className={`lang-switcher__option${isActive ? ' is-active' : ''}`}
                  role="option"
                  aria-selected={isActive}
                  aria-label={t(ARIA_KEYS[lang])}
                  onClick={() => choose(lang)}
                  lang={lang}
                >
                  <span className="lang-switcher__option-code">{LABELS[lang].short}</span>
                  <span className="lang-switcher__option-name">{LABELS[lang].long}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
