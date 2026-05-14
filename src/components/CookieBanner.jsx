import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
    /* Banner powinien się zamknąć nawet wtedy, gdy zapis jest niedostępny. */
  }

  window.dispatchEvent(new CustomEvent('dp-cookie-consent', { detail: payload }));
  return payload;
}

export default function CookieBanner() {
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
    <aside className="cookie-banner" aria-label="Zgoda na pliki cookie" aria-live="polite">
      <div className="cookie-banner__copy">
        <span className="cookie-banner__eyebrow">Ustawienia cookie</span>
        <h2>Wybierz, co strona może zapamiętać</h2>
        <p>
          Używamy niezbędnego zapisu, żeby strona działała poprawnie. Za Twoją zgodą analityka
          pomaga nam rozumieć odwiedziny i ulepszać planowanie podróży.
        </p>
        <Link className="cookie-banner__link" to="/cookies-policy">Przeczytaj politykę cookie</Link>
      </div>

      {isCustomizing && (
        <div className="cookie-banner__choices">
          <label className="cookie-choice cookie-choice--locked">
            <input type="checkbox" checked disabled />
            <span>
              <strong>Niezbędne</strong>
              <small>Potrzebne do preferencji motywu, formularzy i stabilności strony.</small>
            </span>
          </label>
          <label className="cookie-choice">
            <input
              type="checkbox"
              checked={choices.analytics}
              onChange={(event) => setChoices((current) => ({ ...current, analytics: event.target.checked }))}
            />
            <span>
              <strong>Analityka</strong>
              <small>Pomaga nam sprawdzać, które strony są przydatne i gdzie możemy poprawić planowanie.</small>
            </span>
          </label>
        </div>
      )}

      <div className="cookie-banner__actions">
        <button className="cookie-banner__btn cookie-banner__btn--ghost" type="button" onClick={() => saveChoices(defaultChoices)}>
          Tylko niezbędne
        </button>
        {isCustomizing ? (
          <button className="cookie-banner__btn" type="button" onClick={() => saveChoices(choices)}>
            Zapisz wybór
          </button>
        ) : (
          <button className="cookie-banner__btn cookie-banner__btn--ghost" type="button" onClick={() => setIsCustomizing(true)}>
            Dostosuj
          </button>
        )}
        <button className="cookie-banner__btn cookie-banner__btn--accent" type="button" onClick={() => saveChoices({ analytics: true })}>
          Akceptuję wszystko
        </button>
      </div>
    </aside>
  );
}
