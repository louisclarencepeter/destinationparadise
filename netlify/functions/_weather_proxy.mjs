import { createPrivateKey, sign } from 'node:crypto';

function json(body, status, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Netlify-CDN-Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

function credentials() {
  const env = globalThis.Netlify?.env;
  return {
    teamId: env?.get('WEATHERKIT_TEAM_ID'),
    serviceId: env?.get('WEATHERKIT_SERVICE_ID'),
    keyId: env?.get('WEATHERKIT_KEY_ID'),
    privateKey: env?.get('WEATHERKIT_PRIVATE_KEY'),
  };
}

/** Apple requires ES256 with exactly these header and payload claims. */
export function createWeatherKitToken({ teamId, serviceId, keyId, privateKey }, now = Date.now()) {
  if (!/^[A-Z0-9]{10}$/.test(teamId || '') || !/^[A-Z0-9]{10}$/.test(keyId || '')
    || !/^[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(serviceId || '') || !privateKey) {
    throw new Error('WeatherKit credentials are incomplete.');
  }
  const key = createPrivateKey(privateKey.replace(/\\n/g, '\n'));
  if (key.asymmetricKeyType !== 'ec' || key.asymmetricKeyDetails?.namedCurve !== 'prime256v1') {
    throw new Error('WeatherKit requires a P-256 signing key.');
  }
  const issuedAt = Math.floor(now / 1_000);
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId, id: teamId + '.' + serviceId })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: issuedAt, exp: issuedAt + 600, sub: serviceId })).toString('base64url');
  const input = header + '.' + payload;
  // JWT ECDSA signatures use the 64-byte R||S encoding, not ASN.1 DER.
  const signature = sign('sha256', Buffer.from(input), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  return input + '.' + signature;
}

function finite(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function timestamp(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value));
}

function localDate(value) {
  return new Date(Date.parse(value) + 3 * 60 * 60 * 1_000).toISOString().slice(0, 10);
}

// Forward only actual values used by the app. Never expose tokens, private
// keys, upstream headers, URLs or diagnostic bodies in the public response.
export function weatherKitPayload(data) {
  const current = data?.currentWeather;
  if (!current || !timestamp(current.asOf) || !finite(current.temperature)
    || typeof current.conditionCode !== 'string' || !/^[A-Za-z]{1,60}$/.test(current.conditionCode)) return null;
  const days = Array.isArray(data.forecastDaily?.days) ? data.forecastDaily.days : [];
  const today = days.find((day) => timestamp(day?.forecastStart) && localDate(day.forecastStart) === localDate(current.asOf));
  const sunrise = timestamp(today?.sunrise) ? today.sunrise : null;
  const sunset = timestamp(today?.sunset) ? today.sunset : null;
  const derivedDaylight = sunrise && sunset ? Date.parse(current.asOf) >= Date.parse(sunrise) && Date.parse(current.asOf) < Date.parse(sunset) : null;
  const daylight = typeof current.daylight === 'boolean' ? current.daylight : derivedDaylight;
  return {
    provider: 'weatherkit',
    source: 'Apple Weather',
    current: {
      asOf: current.asOf,
      temperature: current.temperature,
      humidity: finite(current.humidity) && current.humidity >= 0 && current.humidity <= 1 ? current.humidity : null,
      conditionCode: current.conditionCode,
      daylight,
      cloudCover: finite(current.cloudCover) && current.cloudCover >= 0 && current.cloudCover <= 1 ? current.cloudCover : null,
    },
    daily: { sunrise, sunset },
    attribution: { legalUrl: 'https://developer.apple.com/weatherkit/data-source-attribution/' },
  };
}

export async function handleWeatherRequest(request, kind = 'forecast', {
  fetchImpl = globalThis.fetch,
  getCredentials = credentials,
  now = Date.now,
  timeoutMs = 8_000,
} = {}) {
  if (kind !== 'forecast' && kind !== 'marine') return json({ error: 'Unknown weather feed.' }, 404);
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET' });

  // Canonicalize old query-bearing clients without accepting arbitrary target
  // locations or multiplying cached upstream requests.
  const incoming = new URL(request.url);
  if (incoming.search) {
    return new Response(null, { status: 308, headers: {
      Location: new URL(kind === 'marine' ? '/api/marine' : '/api/weather', incoming.origin).href,
      'Cache-Control': 'no-store',
      'Netlify-CDN-Cache-Control': 'no-store',
    } });
  }
  // WeatherKit has no sea surface temperature. Keep this old route honest and
  // free of provider calls; the current app only requests /api/weather.
  if (kind === 'marine') return json({ seaTemperature: null, marineObservedAt: null, marineUnavailable: true, reason: 'Sea temperature is not provided by Apple Weather.' }, 200);

  let token;
  try {
    token = createWeatherKitToken(getCredentials(), now());
  } catch {
    return json({ error: 'Live weather is not configured.', code: 'WEATHER_NOT_CONFIGURED' }, 503);
  }
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(timeoutMs)]);
  try {
    signal.throwIfAborted();
    const url = new URL('https://weatherkit.apple.com/api/v1/weather/en/-6.222/39.224');
    url.searchParams.set('dataSets', 'currentWeather,forecastDaily');
    url.searchParams.set('timezone', 'Africa/Dar_es_Salaam');
    const upstream = await fetchImpl(url, {
      method: 'GET', headers: { Accept: 'application/json', Authorization: 'Bearer ' + token }, signal, redirect: 'error',
    });
    if (!upstream.ok) return json({ error: 'Live weather is temporarily unavailable.', code: 'WEATHER_UPSTREAM_ERROR' }, 502);
    const payload = weatherKitPayload(await upstream.json());
    if (!payload) return json({ error: 'Live weather is temporarily unavailable.', code: 'WEATHER_INVALID_RESPONSE' }, 502);
    return json(payload, 200, {
      'Cache-Control': 'public, max-age=60',
      'Netlify-CDN-Cache-Control': 'public, durable, max-age=600, stale-while-revalidate=60',
    });
  } catch {
    // Never log/forward fetch exceptions or fall back to an unlicensed service.
    return json({ error: 'Live weather is temporarily unavailable.', code: signal.aborted ? 'WEATHER_TIMEOUT' : 'WEATHER_UPSTREAM_ERROR' }, signal.aborted ? 504 : 502);
  }
}
