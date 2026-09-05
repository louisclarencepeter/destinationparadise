export type WeatherSceneState = {
  kind: 'clear' | 'mostly-clear' | 'partly-cloudy' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunder' | 'unknown';
  celestial: 'sun' | 'moon' | 'none';
  clouds: 0 | 1 | 2;
  precipitation: 'none' | 'rain' | 'snow' | 'hail';
};

/** Exact WMO codes avoid displaying rain for snow, fog or an unknown provider value. */
export function weatherSceneState(code: number, isDay: boolean): WeatherSceneState {
  const celestial = isDay ? 'sun' : 'moon';
  if (code === 0) return { kind: 'clear', celestial, clouds: 0, precipitation: 'none' };
  if (code === 1) return { kind: 'mostly-clear', celestial, clouds: 1, precipitation: 'none' };
  if (code === 2) return { kind: 'partly-cloudy', celestial, clouds: 2, precipitation: 'none' };
  if (code === 3) return { kind: 'overcast', celestial: 'none', clouds: 2, precipitation: 'none' };
  if ([45, 48].includes(code)) return { kind: 'fog', celestial: 'none', clouds: 1, precipitation: 'none' };
  if ([51, 53, 55, 56, 57].includes(code)) return { kind: 'drizzle', celestial: 'none', clouds: 2, precipitation: 'rain' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { kind: 'rain', celestial: 'none', clouds: 2, precipitation: 'rain' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { kind: 'snow', celestial: 'none', clouds: 2, precipitation: 'snow' };
  if ([95, 96, 99].includes(code)) return { kind: 'thunder', celestial: 'none', clouds: 2, precipitation: code === 95 ? 'none' : 'hail' };
  return { kind: 'unknown', celestial: 'none', clouds: 0, precipitation: 'none' };
}
