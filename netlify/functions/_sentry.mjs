import * as Sentry from '@sentry/node';

function readSampleRate(value, fallback) {
  const parsed = Number.parseFloat(value);
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed;
  return fallback;
}

function truncate(value, maxLength = 1000) {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

const sentryDsn = (process.env.SENTRY_DSN || process.env.NETLIFY_SENTRY_DSN || '').trim();

export const isFunctionSentryEnabled = Boolean(sentryDsn);

if (isFunctionSentryEnabled) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.CONTEXT || process.env.NODE_ENV || 'production',
    release: process.env.SENTRY_RELEASE || process.env.COMMIT_REF || undefined,
    sendDefaultPii: false,
    tracesSampleRate: readSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.1),
  });
}

function requestContext(req) {
  if (!req) return undefined;

  try {
    const url = new URL(req.url);
    return {
      method: req.method,
      path: url.pathname,
      contentType: req.headers.get('content-type') || undefined,
    };
  } catch {
    return { method: req.method };
  }
}

function applyContext(scope, { functionName, req, extra } = {}) {
  if (functionName) scope.setTag('netlify.function', functionName);

  const request = requestContext(req);
  if (request) scope.setContext('request', request);

  if (extra) {
    scope.setContext('netlify_function', {
      ...extra,
      errorBody: extra.errorBody ? truncate(extra.errorBody) : undefined,
    });
  }
}

export async function captureFunctionException(error, context) {
  if (!isFunctionSentryEnabled) return;

  Sentry.withScope((scope) => {
    applyContext(scope, context);
    Sentry.captureException(error);
  });
  await Sentry.flush(2000);
}

export async function captureFunctionMessage(message, context) {
  if (!isFunctionSentryEnabled) return;

  Sentry.withScope((scope) => {
    applyContext(scope, context);
    scope.setLevel(context?.level || 'error');
    Sentry.captureMessage(message);
  });
  await Sentry.flush(2000);
}
