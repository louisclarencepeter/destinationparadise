import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWeather, parseWeather, weatherVisualCode, WEATHER_SOURCE_URL } from '../src/api/weather';

const forecast = {
  provider: 'weatherkit', source: 'Apple Weather',
  current: { asOf: '2026-09-05T15:15:00Z', temperature: 27.4, humidity: 0.78, conditionCode: 'PartlyCloudy', daylight: false, cloudCover: 0.5 },
  daily: { sunrise: '2026-09-05T03:21:00Z', sunset: '2026-09-05T15:24:00Z' },
  attribution: { legalUrl: WEATHER_SOURCE_URL },
};

test('WeatherKit timestamps remain exact and solar times use Zanzibar regardless of device timezone', () => {
  const result = parseWeather(forecast, new Date('2026-09-05T15:20:00Z'));
  assert.equal(result.observedAt, '2026-09-05T15:15:00Z');
  assert.equal(result.sunrise, '06:21');
  assert.equal(result.sunset, '18:24');
  assert.equal(result.temperature, 27);
  assert.equal(result.humidity, 78);
  assert.equal(result.fetchedAt, '2026-09-05T15:20:00.000Z');
  assert.equal(result.source, 'Apple Weather');
  assert.equal(result.sourceUrl, WEATHER_SOURCE_URL);
});

test('one controlled request supplies live conditions and unsupported marine stays unavailable', async () => {
  const urls: string[] = [];
  const result = await fetchWeather({ fetchImpl: async (input) => { urls.push(String(input)); return Response.json(forecast); } });
  assert.deepEqual(urls, ['https://destination-paradise-mobile.netlify.app/api/weather']);
  assert.equal(result.seaTemperature, null);
  assert.equal(result.marineObservedAt, null);
  assert.equal(result.marineUnavailable, true);
});

test('unknown daylight cannot create a night claim or invented sun/moon', () => {
  const result = parseWeather({ ...forecast, current: { ...forecast.current, conditionCode: 'Clear', daylight: null } });
  assert.equal(result.weatherCode, -1);
  assert.equal(result.description, 'Clear');
});

test('weather scenes reflect Apple precipitation and unknown conditions stay neutral', () => {
  assert.equal(weatherVisualCode('Clear', false), 0);
  assert.equal(weatherVisualCode('Rain', true), 63);
  assert.equal(weatherVisualCode('Snow', false), 73);
  assert.equal(weatherVisualCode('Thunderstorms', true), 95);
  assert.equal(weatherVisualCode('Foggy', false), 45);
  assert.equal(weatherVisualCode('Windy', true, 0.8), 3);
  assert.equal(weatherVisualCode('UnrecognisedCondition', true), -1);
  assert.equal(weatherVisualCode('Hail', true), -1); // Never invent thunder for hail alone.
});

test('forecast outages and malformed responses remain errors without fake live defaults', async () => {
  await assert.rejects(() => fetchWeather({ fetchImpl: async () => Response.json({ error: 'Unavailable' }, { status: 503 }) }));
  assert.throws(() => parseWeather({ ...forecast, current: { ...forecast.current, temperature: null } }), /unavailable/);
  assert.throws(() => parseWeather({ ...forecast, current: { ...forecast.current, asOf: undefined } }), /unavailable/);
  assert.throws(() => parseWeather({ ...forecast, source: 'Open-Meteo' }), /unavailable/);
  assert.throws(() => parseWeather({ ...forecast, attribution: { legalUrl: 'https://example.com' } }), /unavailable/);
});

test('missing humidity and sunrise are not substituted', () => {
  const result = parseWeather({ ...forecast, current: { ...forecast.current, humidity: 78 }, daily: { sunrise: null, sunset: null } });
  assert.equal(result.humidity, null);
  assert.equal(result.sunrise, null);
  assert.equal(result.sunset, null);
});

test('pre-cancelled weather does not contact the backend', async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  await assert.rejects(() => fetchWeather({ signal: controller.signal, fetchImpl: async () => { calls += 1; return Response.json(forecast); } }), { name: 'AbortError' });
  assert.equal(calls, 0);
});
