import { captureSentryException } from './sentry.js';

// Manually register the vite-plugin-pwa service worker.
//
// Previously the plugin auto-injected a `registerSW.js` that called
// `navigator.serviceWorker.register()` with no error handling, so any
// registration failure (e.g. crawler / insecure-context environments such as
// Google-Read-Aloud) bubbled up as an unhandled promise rejection —
// Sentry DESTINATIONPARADISE-2. Registering here lets us catch that failure,
// report it as a *handled* exception, and keep it out of the noise.
//
// The `virtual:pwa-register` module is imported dynamically and guarded with a
// `.catch()` so a failure to even load the register helper can never produce an
// unhandled rejection either (and so it stays out of the test module graph).
export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({
        immediate: true,
        onRegisterError(error) {
          captureSentryException(error, {
            tags: { serviceWorker: 'register' },
          });
        },
      });
    })
    .catch((error) => {
      captureSentryException(error, {
        tags: { serviceWorker: 'register-import' },
      });
    });
}
