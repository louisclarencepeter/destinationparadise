import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

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

if (isSentryEnabled) {
  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnvironment,
    release: sentryRelease,
    sendDefaultPii: false,
    tracesSampleRate: readSampleRate(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
      import.meta.env.PROD ? 0.1 : 1.0,
    ),
    tracePropagationTargets: [/^\//, /^https:\/\/(www\.)?yournexttriptoparadise\.com\/api/],
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
  });
}

export function captureSentryException(error, context) {
  if (!isSentryEnabled) return;
  Sentry.captureException(error, context);
}

export const SentryRoutes = Sentry.withSentryReactRouterV6Routing;
