import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n/index.js';

const LABELS = {
  en: { short: 'EN', long: 'English' },
  pl: { short: 'PL', long: 'Polski' },
};

export default function LanguageSwitcher({ className = '' }) {
  const { i18n, t } = useTranslation();
  const active = SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : 'en';

  const choose = (lang) => {
    if (lang === active) return;
    i18n.changeLanguage(lang);
  };

  return (
    <div
      className={`lang-switcher${className ? ` ${className}` : ''}`}
      role="group"
      aria-label={t('language.switcher_label')}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = lang === active;
        return (
          <button
            key={lang}
            type="button"
            className={`lang-switcher__btn${isActive ? ' is-active' : ''}`}
            onClick={() => choose(lang)}
            aria-pressed={isActive}
            aria-label={t(lang === 'en' ? 'language.switch_to_english' : 'language.switch_to_polish')}
            lang={lang}
          >
            {LABELS[lang].short}
          </button>
        );
      })}
    </div>
  );
}
