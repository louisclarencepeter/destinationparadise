import { afterPageLoad } from './afterPageLoad.js';
import { isPrerender } from './prerender.js';

function readSampleRate(value, fallback) {
  const parsed = Number.parseFloat(value);
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed;
  return fallback;
}

const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim();
const sentryEnvironment =
  import.meta.env.VITE_SENTRY_ENVIRONMENT ||
  (import.meta.env.PROD ? 'production' : import.meta.env.MODE);
const sentryRelease = import.meta.env.VITE_SENTRY_RELEASE || undefined;

export const isSentryEnabled = Boolean(sentryDsn);
const canInitialize =
  isSentryEnabled && typeof window !== 'undefined' && !isPrerender();

const earlyErrors = [];
let sentryPromise;

function rememberEarlyError(error) {
  if (earlyErrors.length < 5) earlyErrors.push(error);
}

function onEarlyError(event) {
  rememberEarlyError(
    event.error || new Error(event.message || 'Unknown browser error'),
  );
}

function onEarlyRejection(event) {
  rememberEarlyError(event.reason || new Error('Unhandled promise rejection'));
}

if (canInitialize) {
  window.addEventListener('error', onEarlyError);
  window.addEventListener('unhandledrejection', onEarlyRejection);
}

function loadSentry() {
  if (!canInitialize) return Promise.resolve(null);
  if (sentryPromise) return sentryPromise;

  sentryPromise = import('@sentry/react')
    .then(({ browserTracingIntegration, captureException, init }) => {
      window.removeEventListener('error', onEarlyError);
      window.removeEventListener('unhandledrejection', onEarlyRejection);

      init({
        dsn: sentryDsn,
        environment: sentryEnvironment,
        release: sentryRelease,
        sendDefaultPii: false,
        tracesSampleRate: readSampleRate(
          import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
          import.meta.env.PROD ? 0.1 : 1.0,
        ),
        tracePropagationTargets: [
          /^\//,
          /^https:\/\/(www\.)?yournexttriptoparadise\.com\/api/,
        ],
        integrations: [browserTracingIntegration()],
      });

      earlyErrors.splice(0).forEach((error) => {
        captureException(error, {
          tags: { capturedBeforeSentryInit: 'true' },
        });
      });

      return { captureException };
    })
    .catch(() => null);

  return sentryPromise;
}

export function captureSentryException(error, context) {
  if (!canInitialize) return;
  void loadSentry().then((Sentry) => {
    Sentry?.captureException(error, context);
  });
}

export function scheduleSentryInit() {
  if (!canInitialize) return;
  afterPageLoad(() => {
    void loadSentry();
  });
}
