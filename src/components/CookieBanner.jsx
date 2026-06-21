import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'dp_cookie_consent_v1';

const defaultChoices = {
  essential: true,
  analytics: false,
};

function readStoredConsent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredConsent(choices) {
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    choices: { ...defaultChoices, ...choices, essential: true },
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* Consent should still close even if storage is unavailable. */
  }

  window.dispatchEvent(new CustomEvent('dp-cookie-consent', { detail: payload }));
  return payload;
}

export default function CookieBanner() {
  const { t } = useTranslation('common');
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [choices, setChoices] = useState(defaultChoices);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored?.choices) {
      setChoices({ ...defaultChoices, ...stored.choices, essential: true });
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setIsReady(true);
  }, []);

  const saveChoices = (nextChoices) => {
    const saved = writeStoredConsent(nextChoices);
    setChoices(saved.choices);
    setIsVisible(false);
  };

  if (!isReady || !isVisible) return null;

  return (
    <aside className="cookie-banner" aria-label={t('cookies.aria_label')} aria-live="polite">
      <div className="cookie-banner__copy">
        <span className="cookie-banner__eyebrow">{t('cookies.eyebrow')}</span>
        <h2>{t('cookies.title')}</h2>
        <p>{t('cookies.body')}</p>
        <Link className="cookie-banner__link" to="/cookies-policy">{t('cookies.policy_link')}</Link>
      </div>

      {isCustomizing && (
        <div className="cookie-banner__choices">
          <label className="cookie-choice cookie-choice--locked">
            <input type="checkbox" checked disabled />
            <span>
              <strong>{t('cookies.essential_title')}</strong>
              <small>{t('cookies.essential_desc')}</small>
            </span>
          </label>
          <label className="cookie-choice">
            <input
              type="checkbox"
              checked={choices.analytics}
              onChange={(event) => setChoices((current) => ({ ...current, analytics: event.target.checked }))}
            />
            <span>
              <strong>{t('cookies.analytics_title')}</strong>
              <small>{t('cookies.analytics_desc')}</small>
            </span>
          </label>
        </div>
      )}

      <div className="cookie-banner__actions">
        <button className="cookie-banner__btn cookie-banner__btn--ghost" type="button" onClick={() => saveChoices(defaultChoices)}>
          {t('cookies.essential_only')}
        </button>
        {isCustomizing ? (
          <button className="cookie-banner__btn" type="button" onClick={() => saveChoices(choices)}>
            {t('cookies.save')}
          </button>
        ) : (
          <button className="cookie-banner__btn cookie-banner__btn--ghost" type="button" onClick={() => setIsCustomizing(true)}>
            {t('cookies.customize')}
          </button>
        )}
        <button className="cookie-banner__btn cookie-banner__btn--accent" type="button" onClick={() => saveChoices({ analytics: true })}>
          {t('cookies.accept_all')}
        </button>
      </div>
    </aside>
  );
}
