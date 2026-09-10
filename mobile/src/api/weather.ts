import { ApiError, requestJson, type RequestOptions } from './client';
import { MOBILE_BACKEND_URL } from '../config/endpoints';

export const WEATHER_SOURCE_URL = 'https://developer.apple.com/weatherkit/data-source-attribution/';
export const WEATHER_TIMEZONE = 'Africa/Dar_es_Salaam';

export interface WeatherSnapshot {
  temperature: number;
  humidity: number | null;
  seaTemperature: number | null;
  sunrise: string | null;
  sunset: string | null;
  /** Visual category mapped from Apple's condition; never a claimed WMO observation. */
  weatherCode: number;
  isDay: boolean;
  description: string;
  observedAt: string;
  fetchedAt: string;
  source: 'Apple Weather';
  sourceUrl: string;
  marineUnavailable: boolean;
  marineObservedAt: string | null;
}

interface WeatherResponse {
  provider?: string;
  source?: string;
  current?: { asOf?: string; temperature?: number | null; humidity?: number | null; conditionCode?: string; daylight?: boolean | null; cloudCover?: number | null };
  daily?: { sunrise?: string | null; sunset?: string | null };
  attribution?: { legalUrl?: string };
}

function finite(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }
function timestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}
function clockTime(value?: string | null): string | null {
  if (!timestamp(value)) return null;
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: WEATHER_TIMEZONE }).format(new Date(value));
}

export function weatherDescription(code: string, isDay: boolean): string {
  if (code === 'Clear') return isDay ? 'Clear skies' : 'Clear night';
  if (code === 'MostlyClear') return isDay ? 'Mostly sunny' : 'Mostly clear';
  const known: Record<string, string> = {
    BlowingDust: 'Blowing dust', BlowingSnow: 'Blowing snow', Blizzard: 'Blizzard', Breezy: 'Breezy', Cloudy: 'Overcast', Drizzle: 'Drizzle', Flurries: 'Snow flurries', Foggy: 'Fog', FreezingDrizzle: 'Freezing drizzle', FreezingRain: 'Freezing rain', Frigid: 'Very cold', Hail: 'Hail', Haze: 'Haze', HeavyRain: 'Heavy rain', HeavySnow: 'Heavy snow', Hot: 'Hot', Hurricane: 'Hurricane', IsolatedThunderstorms: 'Isolated thunderstorms', MostlyCloudy: 'Mostly cloudy', PartlyCloudy: 'Partly cloudy', Rain: 'Rain', ScatteredThunderstorms: 'Scattered thunderstorms', Sleet: 'Sleet', Smoky: 'Smoky', Snow: 'Snow', StrongStorms: 'Strong thunderstorms', SunFlurries: 'Sun and snow flurries', SunShowers: 'Sun showers', Thunderstorms: 'Thunderstorms', TropicalStorm: 'Tropical storm', Windy: 'Windy', WintryMix: 'Wintry mix',
  };
  return known[code] || 'Weather update';
}

/** Reuse approved scene shapes only where Apple's condition supports them. */
export function weatherVisualCode(code: string, daylight: boolean | null, cloudCover?: number | null): number {
  const categories: Record<string, number> = {
    Clear: 0, MostlyClear: 1, PartlyCloudy: 2, MostlyCloudy: 3, Cloudy: 3,
    Foggy: 45, Drizzle: 51, FreezingDrizzle: 56, Rain: 63, HeavyRain: 65, FreezingRain: 66, SunShowers: 80,
    Flurries: 71, Snow: 73, HeavySnow: 75, Blizzard: 75, BlowingSnow: 73, SunFlurries: 85,
    IsolatedThunderstorms: 95, ScatteredThunderstorms: 95, StrongStorms: 95, Thunderstorms: 95,
  };
  const visual = categories[code];
  // Avoid an invented sun or moon when Apple and the daily feed omit daylight.
  if (visual !== undefined) return visual <= 2 && daylight === null ? -1 : visual;
  if (['Breezy', 'Windy', 'Hot', 'Frigid'].includes(code) && finite(cloudCover)) {
    if (cloudCover >= 0.75) return 3;
    if (daylight === null) return -1;
    return cloudCover >= 0.3 ? 2 : cloudCover >= 0.1 ? 1 : 0;
  }
  return -1;
}

export function parseWeather(response: WeatherResponse, now = new Date()): WeatherSnapshot {
  const current = response?.current;
  if (response?.provider !== 'weatherkit' || response.source !== 'Apple Weather'
    || response.attribution?.legalUrl !== WEATHER_SOURCE_URL || !current || !finite(current.temperature)
    || !timestamp(current.asOf) || typeof current.conditionCode !== 'string') {
    throw new ApiError('Current weather is unavailable. Please try again later.', 502, 'INVALID_RESPONSE');
  }
  const daylight = typeof current.daylight === 'boolean' ? current.daylight : null;
  const isDay = daylight === true;
  return {
    temperature: Math.round(current.temperature),
    humidity: finite(current.humidity) && current.humidity >= 0 && current.humidity <= 1 ? Math.round(current.humidity * 100) : null,
    seaTemperature: null, marineObservedAt: null, marineUnavailable: true,
    sunrise: clockTime(response.daily?.sunrise), sunset: clockTime(response.daily?.sunset),
    weatherCode: weatherVisualCode(current.conditionCode, daylight, current.cloudCover), isDay,
    description: daylight === null && ['Clear', 'MostlyClear'].includes(current.conditionCode) ? (current.conditionCode === 'Clear' ? 'Clear' : 'Mostly clear') : weatherDescription(current.conditionCode, isDay),
    observedAt: current.asOf, fetchedAt: now.toISOString(), source: 'Apple Weather', sourceUrl: WEATHER_SOURCE_URL,
  };
}

/** Apple credentials stay on the server. No public Open-Meteo fallback. */
export async function fetchWeather(options: RequestOptions = {}): Promise<WeatherSnapshot> {
  const browser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  const endpoint = browser ? '/api/weather' : process.env.EXPO_PUBLIC_WEATHER_FORECAST_URL || `${MOBILE_BACKEND_URL}/api/weather`;
  const response = await requestJson<WeatherResponse>(endpoint, {}, { ...options, timeoutMs: options.timeoutMs ?? 12_000 });
  return parseWeather(response);
}
