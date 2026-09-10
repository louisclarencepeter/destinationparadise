import { generateKeyPairSync, verify } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { createWeatherKitToken, handleWeatherRequest, weatherKitPayload } from '../../netlify/functions/_weather_proxy.mjs';
import { config as forecastConfig } from '../../netlify/functions/weather.mjs';
import { config as marineConfig } from '../../netlify/functions/marine.mjs';

const keyPair = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const signing = {
  teamId: 'TEAM123456', serviceId: 'com.example.weather-test', keyId: 'KEY1234567',
  privateKey: keyPair.privateKey.export({ type: 'pkcs8', format: 'pem' }),
};
const forecast = {
  currentWeather: { asOf: '2026-09-05T19:15:00Z', temperature: 25.1, humidity: 0.76, conditionCode: 'Clear', daylight: false, cloudCover: 0.05 },
  forecastDaily: { days: [
    { forecastStart: '2026-09-03T21:00:00Z', sunrise: '2026-09-04T03:20:00Z', sunset: '2026-09-04T15:20:00Z' },
    { forecastStart: '2026-09-04T21:00:00Z', sunrise: '2026-09-05T03:20:00Z', sunset: '2026-09-05T15:21:00Z' },
  ] },
};
const request = (path = '/api/weather', init) => new Request('https://yournexttriptoparadise.com' + path, init);
const options = (fetchImpl) => ({ fetchImpl, getCredentials: () => signing });
const decode = (part) => JSON.parse(Buffer.from(part, 'base64url').toString());

describe('WeatherKit server authorization', () => {
  it('signs Apple exact ES256 claims with the JWT R||S encoding', () => {
    const token = createWeatherKitToken(signing, 1_800_000_000_000);
    const [header, payload, signature] = token.split('.');
    expect(decode(header)).toEqual({ alg: 'ES256', kid: signing.keyId, id: signing.teamId + '.' + signing.serviceId });
    expect(decode(payload)).toEqual({ iss: signing.teamId, iat: 1_800_000_000, exp: 1_800_000_600, sub: signing.serviceId });
    expect(Buffer.from(signature, 'base64url').length).toBe(64);
    expect(verify('sha256', Buffer.from(header + '.' + payload), { key: keyPair.publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(signature, 'base64url'))).toBe(true);
  });

  it('accepts escaped PEM newlines from server environment configuration', () => {
    expect(createWeatherKitToken({ ...signing, privateKey: signing.privateKey.replace(/\n/g, '\\n') }).split('.')).toHaveLength(3);
  });

  it('rejects incomplete credentials and a key using a different curve', () => {
    expect(() => createWeatherKitToken({ ...signing, keyId: '' })).toThrow();
    const other = generateKeyPairSync('ec', { namedCurve: 'secp384r1' }).privateKey.export({ type: 'pkcs8', format: 'pem' });
    expect(() => createWeatherKitToken({ ...signing, privateKey: other })).toThrow(/P-256/);
  });
});

describe('WeatherKit weather proxy', () => {
  it('keeps the canonical routes', () => {
    expect(forecastConfig.path).toBe('/api/weather');
    expect(marineConfig.path).toBe('/api/marine');
  });

  it('fails closed when WeatherKit credentials are not configured', async () => {
    const fetchImpl = vi.fn();
    const result = await handleWeatherRequest(request(), 'forecast', { fetchImpl, getCredentials: () => ({}) });
    expect(result.status).toBe(503);
    expect(await result.json()).toMatchObject({ code: 'WEATHER_NOT_CONFIGURED' });
    expect(result.headers.get('Cache-Control')).toBe('no-store');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each(['forecast', 'marine'])('canonicalizes %s query variants without provider calls', async (kind) => {
    const fetchImpl = vi.fn();
    const path = kind === 'marine' ? '/api/marine' : '/api/weather';
    const result = await handleWeatherRequest(request(path + '?latitude=0&url=https://example.com&apikey=attacker'), kind, options(fetchImpl));
    expect(result.status).toBe(308);
    expect(result.headers.get('Location')).toBe('https://yournexttriptoparadise.com' + path);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('only requests Apple current/daily data for Zanzibar with a server Bearer token', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ ...forecast, privateKey: 'secret', debugUrl: 'secret' }, { headers: { 'X-Secret': 'secret' } }));
    const result = await handleWeatherRequest(request(), 'forecast', options(fetchImpl));
    expect(result.status).toBe(200);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url.origin).toBe('https://weatherkit.apple.com');
    expect(url.pathname).toBe('/api/v1/weather/en/-6.222/39.224');
    expect(Object.fromEntries(url.searchParams)).toEqual({ dataSets: 'currentWeather,forecastDaily', timezone: 'Africa/Dar_es_Salaam' });
    expect(init.headers.Authorization).toMatch(/^Bearer ey/);
    expect(init.redirect).toBe('error');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(result.headers.get('Netlify-CDN-Cache-Control')).toContain('durable, max-age=600');
    expect(result.headers.get('X-Secret')).toBeNull();
    const payload = await result.json();
    expect(payload.current).toEqual(forecast.currentWeather);
    expect(payload.daily.sunrise).toBe('2026-09-05T03:20:00Z');
    expect(payload.source).toBe('Apple Weather');
    expect(JSON.stringify(payload)).not.toMatch(/secret|Bearer/);
  });

  it('selects sunrise/sunset by the current Zanzibar date and preserves source asOf', () => {
    const payload = weatherKitPayload(forecast);
    expect(payload.current.asOf).toBe(forecast.currentWeather.asOf);
    expect(payload.daily).toEqual({ sunrise: '2026-09-05T03:20:00Z', sunset: '2026-09-05T15:21:00Z' });
  });

  it('uses actual sunrise/sunset to derive missing daylight, with no invented fallback', () => {
    const currentWeather = { ...forecast.currentWeather, daylight: undefined };
    expect(weatherKitPayload({ ...forecast, currentWeather }).current.daylight).toBe(false);
    const payload = weatherKitPayload({ currentWeather, forecastDaily: { days: [forecast.forecastDaily.days[0]] } });
    expect(payload.current.daylight).toBeNull();
    expect(payload.daily).toEqual({ sunrise: null, sunset: null });
  });

  it('does not claim unsupported humidity values or marine observations', async () => {
    expect(weatherKitPayload({ ...forecast, currentWeather: { ...forecast.currentWeather, humidity: 76 } }).current.humidity).toBeNull();
    const fetchImpl = vi.fn();
    const result = await handleWeatherRequest(request('/api/marine'), 'marine', options(fetchImpl));
    expect(result.status).toBe(200);
    expect(await result.json()).toMatchObject({ seaTemperature: null, marineObservedAt: null, marineUnavailable: true });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    { ...forecast, currentWeather: { ...forecast.currentWeather, asOf: 'not-time' } },
    { ...forecast, currentWeather: { ...forecast.currentWeather, temperature: null } },
    { ...forecast, currentWeather: { ...forecast.currentWeather, conditionCode: '<bad>' } },
  ])('does not cache malformed Apple data', async (body) => {
    const result = await handleWeatherRequest(request(), 'forecast', options(async () => Response.json(body)));
    expect(result.status).toBe(502);
    expect(result.headers.get('Netlify-CDN-Cache-Control')).toBe('no-store');
  });

  it('does not forward provider error bodies or attempt a fallback service', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ reason: 'invalid Bearer token secret' }, { status: 401 }));
    const result = await handleWeatherRequest(request(), 'forecast', options(fetchImpl));
    expect(result.status).toBe(502);
    expect(await result.text()).not.toMatch(/Bearer|secret/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not leak token-bearing exception messages', async () => {
    const result = await handleWeatherRequest(request(), 'forecast', options(async () => { throw new Error('Bearer secret'); }));
    expect(result.status).toBe(502);
    expect(await result.text()).not.toMatch(/Bearer|secret/);
  });

  it('aborts a slow provider request and returns an uncached timeout', async () => {
    const fetchImpl = vi.fn((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    }));
    const result = await handleWeatherRequest(request(), 'forecast', { ...options(fetchImpl), timeoutMs: 5 });
    expect(result.status).toBe(504);
    expect((await result.json()).code).toBe('WEATHER_TIMEOUT');
    expect(result.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rejects mutation methods without requesting weather', async () => {
    const fetchImpl = vi.fn();
    const result = await handleWeatherRequest(request('/api/weather', { method: 'POST', body: '{}' }), 'forecast', options(fetchImpl));
    expect(result.status).toBe(405);
    expect(result.headers.get('Allow')).toBe('GET');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
