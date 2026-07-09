import { useEffect, useRef, useState } from 'react';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise;

const getTurnstile = () => /** @type {any} */ (window).turnstile;

function loadTurnstileScript() {
  const loadedTurnstile = getTurnstile();
  if (loadedTurnstile) return Promise.resolve(loadedTurnstile);
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(getTurnstile()), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(getTurnstile());
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export default function TurnstileWidget({
  action = 'booking_request',
  onError,
  onExpire,
  onVerify,
  resetSignal = 0,
  siteKey,
}) {
  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!siteKey || !widgetRef.current) return undefined;

    let cancelled = false;

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !turnstile || !widgetRef.current || widgetIdRef.current) return;

        widgetIdRef.current = turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          action,
          callback: (token) => {
            setLoadFailed(false);
            onVerify(token);
          },
          'expired-callback': () => {
            onExpire();
          },
          'error-callback': () => {
            setLoadFailed(true);
            onError();
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
          onError();
        }
      });

    return () => {
      cancelled = true;
      const turnstile = getTurnstile();
      if (widgetIdRef.current && turnstile) {
        turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, onError, onExpire, onVerify, siteKey]);

  useEffect(() => {
    const turnstile = getTurnstile();
    if (widgetIdRef.current && turnstile) {
      turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  if (!siteKey) return null;

  return (
    <div className="booking-turnstile">
      <div ref={widgetRef} />
      {loadFailed && (
        <p className="booking-turnstile__error" role="alert">
          Verification could not load. Please refresh and try again.
        </p>
      )}
    </div>
  );
}
