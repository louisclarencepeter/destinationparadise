import { afterPageLoad } from './afterPageLoad.js';
import { isPrerender } from './prerender.js';
import { isPrivateOrderPath } from './analytics.js';

function privateOrderPage() {
  return typeof window !== 'undefined' && isPrivateOrderPath(window.location?.pathname);
}

function containsPrivateOrderRoute(value) {
  return /(?:^|\/)store\/order(?:\/|\?|#|$)/.test(String(value || ''));
}

function scrubTelemetry(value, seen = new WeakMap()) {
  if (typeof value === 'string') {
    if (containsPrivateOrderRoute(value) || /\/api\/store\/orders\//.test(value)) return '[private order]';
    return value.replace(/\bDP-\d{4}-\d{4,}\b/g, '[private order]')
      .replace(/\b[a-f0-9]{48}\b/gi, '[private token]')
      .replace(/([?&](?:t|token|accessToken)=)[^&#\s]*/gi, '$1[private token]');
  }
  if (value && typeof value === 'object') {
    if (seen.has(value)) return seen.get(value);
    const copy = Array.isArray(value) ? [] : {};
    seen.set(value, copy);
    Object.entries(value).forEach(([key, entry]) => {
      copy[key] = /^(?:token|accessToken|access_token|authorization)$/i.test(key)
        ? '[private token]' : scrubTelemetry(entry, seen);
    });
    return copy;
  }
  return value;
}

export function filterSentryEvent(event) {
  if (privateOrderPage() || containsPrivateOrderRoute(event?.request?.url) || containsPrivateOrderRoute(event?.transaction)) return null;
  return scrubTelemetry(event);
}

export function filterSentryBreadcrumb(breadcrumb) {
  if (privateOrderPage()) return null;
  return scrubTelemetry(breadcrumb);
}

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
  if (privateOrderPage()) return;
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
  if (!canInitialize || privateOrderPage()) return Promise.resolve(null);
  if (sentryPromise) return sentryPromise;

  sentryPromise = import('@sentry/react')
    .then(({ browserTracingIntegration, captureException, init }) => {
      if (privateOrderPage()) {
        sentryPromise = undefined;
        return null;
      }
      window.removeEventListener('error', onEarlyError);
      window.removeEventListener('unhandledrejection', onEarlyRejection);

      init({
        dsn: sentryDsn,
        environment: sentryEnvironment,
        release: sentryRelease,
        sendDefaultPii: false,
        beforeSend: filterSentryEvent,
        beforeSendTransaction: filterSentryEvent,
        beforeBreadcrumb: filterSentryBreadcrumb,
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
  if (!canInitialize || privateOrderPage()) return;
  void loadSentry().then((Sentry) => {
    Sentry?.captureException(error, context);
  });
}

export function scheduleSentryInit() {
  if (!canInitialize || privateOrderPage()) return;
  afterPageLoad(() => {
    void loadSentry();
  });
}
