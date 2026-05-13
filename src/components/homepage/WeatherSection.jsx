import { useEffect, useState } from 'react';

const ZANZIBAR_LAT = -6.1357;
const ZANZIBAR_LON = 39.3621;
const TIMEZONE = 'Africa/Dar_es_Salaam';

const FALLBACK = {
  temp: 29,
  humidity: 74,
  seaTemp: 27,
  sunrise: '06:24',
  sunset: '18:36',
  code: 1,
  isDay: 1,
  description:
    'Mostly sunny with a soft Indian Ocean breeze. The long rains are easing — mornings are clear, and the reef visibility holds through early afternoon.',
};

const describe = (code, isDay) => {
  const nightClear = 'Clear night over the channel — warm air, gentle breeze off the reef.';
  if (code === 0) return isDay ? 'Clear skies and steady Indian Ocean breeze — ideal beach and snorkeling conditions.' : nightClear;
  if (code === 1) return isDay ? 'Mostly sunny with high cloud — reef visibility holds through the afternoon.' : 'Mostly clear night with high cloud — warm and calm.';
  if (code === 2) return isDay ? 'Partly cloudy with warm trade winds — comfortable beach and dhow conditions.' : 'Partly cloudy night — soft trade winds and warm air.';
  if (code === 3) return isDay ? 'Overcast but warm — good light for island walks, spice farms, and culture stops.' : 'Overcast and warm tonight — calm seas expected by morning.';
  if (code === 45 || code === 48) return 'Coastal fog easing through the morning — clearer by midday.';
  if (code >= 51 && code <= 57) return 'Light drizzle drifting in from the channel — short, warm, and passing.';
  if (code >= 61 && code <= 67) return 'Rain showers passing through — typical of the long rains, mornings often clear.';
  if (code >= 80 && code <= 82) return 'Tropical showers between sunny spells — bring a light layer.';
  if (code >= 95) return 'Thunderstorms expected — best to plan indoor time, a slower lunch, or a spa stop.';
  return FALLBACK.description;
};

function WeatherIcon({ code, isDay }) {
  const common = {
    width: 90,
    height: 90,
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  const fillSoft = 'rgba(255,111,97,.2)';
  const fillMoon = 'rgba(207, 225, 238, .25)';

  const clearDay = (
    <svg {...common} className="wx-icon wx-icon--sun">
      <g className="wx-sun-rays">
        <path d="M32 8v6M32 50v6M12 32H6M58 32h-6M17 17l-4-4M51 51l-4-4M17 47l-4 4M51 13l-4 4" />
      </g>
      <circle className="wx-sun-disc" cx="32" cy="32" r="11" fill={fillSoft} />
    </svg>
  );
  const clearNight = (
    <svg {...common} className="wx-icon wx-icon--moon">
      <path className="wx-moon" d="M44 36a16 16 0 1 1-16-22 12 12 0 0 0 16 16c0 2-.05 4-.05 6Z" fill={fillMoon} />
      <circle className="wx-star wx-star--1" cx="50" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle className="wx-star wx-star--2" cx="14" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle className="wx-star wx-star--3" cx="56" cy="32" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
  const partlyDay = (
    <svg {...common} className="wx-icon wx-icon--partly-day">
      <g className="wx-sun-rays">
        <path d="M22 10v4M10 24H6M14 14l-3-3M30 14l3-3" />
      </g>
      <circle className="wx-sun-disc" cx="22" cy="24" r="8" fill={fillSoft} />
      <path className="wx-cloud" d="M26 40a8 8 0 0 1 15-3 6 6 0 0 1 1 12H28a6 6 0 0 1-2-9Z" fill="rgba(207,225,238,.15)" />
    </svg>
  );
  const partlyNight = (
    <svg {...common} className="wx-icon wx-icon--partly-night">
      <path className="wx-moon" d="M30 22a10 10 0 1 1-10-14 8 8 0 0 0 10 10v4Z" fill={fillMoon} />
      <path className="wx-cloud" d="M26 40a8 8 0 0 1 15-3 6 6 0 0 1 1 12H28a6 6 0 0 1-2-9Z" fill="rgba(207,225,238,.15)" />
    </svg>
  );
  const cloudy = (
    <svg {...common} className="wx-icon wx-icon--cloud">
      <path className="wx-cloud wx-cloud--solo" d="M18 40a10 10 0 0 1 19-4 8 8 0 0 1 1 16H20a8 8 0 0 1-2-12Z" fill="rgba(207,225,238,.18)" />
    </svg>
  );
  const fog = (
    <svg {...common} className="wx-icon wx-icon--fog">
      <path className="wx-cloud wx-cloud--solo" d="M18 32a10 10 0 0 1 19-4 8 8 0 0 1 1 16H20a8 8 0 0 1-2-12Z" fill="rgba(207,225,238,.18)" />
      <path className="wx-fog-line wx-fog-line--1" d="M14 48h36" />
      <path className="wx-fog-line wx-fog-line--2" d="M18 54h28" />
    </svg>
  );
  const rain = (
    <svg {...common} className="wx-icon wx-icon--rain">
      <path className="wx-cloud wx-cloud--solo" d="M18 32a10 10 0 0 1 19-4 8 8 0 0 1 1 16H20a8 8 0 0 1-2-12Z" fill="rgba(207,225,238,.2)" />
      <path className="wx-drop wx-drop--1" d="M22 50l-2 6" />
      <path className="wx-drop wx-drop--2" d="M32 50l-2 6" />
      <path className="wx-drop wx-drop--3" d="M42 50l-2 6" />
    </svg>
  );
  const storm = (
    <svg {...common} className="wx-icon wx-icon--storm">
      <path className="wx-cloud wx-cloud--solo" d="M18 30a10 10 0 0 1 19-4 8 8 0 0 1 1 16H20a8 8 0 0 1-2-12Z" fill="rgba(255,111,97,.18)" />
      <path className="wx-bolt" d="M30 44l-4 8h6l-3 8" />
    </svg>
  );

  if (code === 0) return isDay ? clearDay : clearNight;
  if (code === 1) return isDay ? clearDay : clearNight;
  if (code === 2) return isDay ? partlyDay : partlyNight;
  if (code === 3) return cloudy;
  if (code === 45 || code === 48) return fog;
  if (code >= 51 && code <= 67) return rain;
  if (code >= 80 && code <= 82) return rain;
  if (code >= 95) return storm;
  return isDay ? clearDay : clearNight;
}

const formatTime = (iso) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TIMEZONE,
  }).format(date);
};

export default function WeatherSection({ MONTHS, SCORES, NOW_MONTH }) {
  const [weather, setWeather] = useState(FALLBACK);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${ZANZIBAR_LAT}&longitude=${ZANZIBAR_LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day&daily=sunrise,sunset&timezone=${encodeURIComponent(TIMEZONE)}`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${ZANZIBAR_LAT}&longitude=${ZANZIBAR_LON}&hourly=sea_surface_temperature&timezone=${encodeURIComponent(TIMEZONE)}`;

    Promise.all([
      fetch(forecastUrl).then((r) => (r.ok ? r.json() : Promise.reject(new Error('forecast')))),
      fetch(marineUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([forecast, marine]) => {
        if (cancelled || !forecast?.current) return;
        const current = forecast.current;
        const daily = forecast.daily || {};
        const nowHour = new Date().getHours();
        const seaSeries = marine?.hourly?.sea_surface_temperature;
        const seaTempRaw = Array.isArray(seaSeries) ? seaSeries[nowHour] : null;

        const isDay = current.is_day === 1 ? 1 : 0;
        const tempSource = typeof current.apparent_temperature === 'number'
          ? current.apparent_temperature
          : current.temperature_2m;
        setWeather({
          temp: Math.round(tempSource),
          humidity: Math.round(current.relative_humidity_2m),
          seaTemp: typeof seaTempRaw === 'number' ? Math.round(seaTempRaw) : FALLBACK.seaTemp,
          sunrise: formatTime(daily.sunrise?.[0]) || FALLBACK.sunrise,
          sunset: formatTime(daily.sunset?.[0]) || FALLBACK.sunset,
          code: current.weather_code,
          isDay,
          description: describe(current.weather_code, isDay),
        });
        setIsLive(true);
      })
      .catch(() => {
        /* keep fallback */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="weather reveal" id="weather">
      <div className="weather-card">
        <div className="weather__hero">
          <div className="weather__place">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            Zanzibar{isLive ? ' · Live' : ''}
          </div>
          <div className="weather__row">
            <div className="weather__icon">
              <WeatherIcon code={weather.code} isDay={weather.isDay} />
            </div>
            <div className="weather__temp">{weather.temp}<sup>°</sup></div>
          </div>
          <p className="weather__desc">{weather.description}</p>
          <div className="weather__facts">
            <div className="weather-fact">
              <div className="weather-fact__head">
                <svg className="weather-fact__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
                  <path d="M2 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
                  <path d="M2 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
                </svg>
                <div className="weather-fact__label">Sea temp</div>
              </div>
              <div className="weather-fact__value">{weather.seaTemp}°C</div>
            </div>
            <div className="weather-fact">
              <div className="weather-fact__head">
                <svg className="weather-fact__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                <div className="weather-fact__label">Humidity</div>
              </div>
              <div className="weather-fact__value">{weather.humidity}%</div>
            </div>
            <div className="weather-fact">
              <div className="weather-fact__head">
                <svg className="weather-fact__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 18a5 5 0 0 0-10 0" />
                  <line x1="12" y1="2" x2="12" y2="9" />
                  <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
                  <line x1="1" y1="18" x2="3" y2="18" />
                  <line x1="21" y1="18" x2="23" y2="18" />
                  <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
                  <line x1="23" y1="22" x2="1" y2="22" />
                  <polyline points="8 6 12 2 16 6" />
                </svg>
                <div className="weather-fact__label">Sunrise</div>
              </div>
              <div className="weather-fact__value">{weather.sunrise}</div>
            </div>
            <div className="weather-fact">
              <div className="weather-fact__head">
                <svg className="weather-fact__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 18a5 5 0 0 0-10 0" />
                  <line x1="12" y1="9" x2="12" y2="2" />
                  <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
                  <line x1="1" y1="18" x2="3" y2="18" />
                  <line x1="21" y1="18" x2="23" y2="18" />
                  <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
                  <line x1="23" y1="22" x2="1" y2="22" />
                  <polyline points="16 5 12 9 8 5" />
                </svg>
                <div className="weather-fact__label">Sunset</div>
              </div>
              <div className="weather-fact__value">{weather.sunset}</div>
            </div>
          </div>
        </div>
        <div className="weather__side">
          <div className="weather__side-title">Best time to visit</div>
          <div className="weather__months">
            {MONTHS.map((m, i) => (
              <div key={m.m} className={`weather-month weather-month--${m.season}${i === NOW_MONTH ? ' is-now' : ''}`}>
                <span className="weather-month__m">
                  <span className="weather-month__dot" aria-hidden="true"></span>
                  {m.m}
                </span>
                <span className="weather-month__bar"><span className="weather-month__bar-fill" style={{ width: `${SCORES[i]}%` }}></span></span>
                <span className="weather-month__season">
                  {m.season === 'peak' ? 'Peak' : m.season === 'high' ? 'High' : 'Low'}
                </span>
                <span className="weather-month__score">{m.t}°</span>
              </div>
            ))}
          </div>
          <div className="weather__legend" aria-label="Hotel season key">
            <div className="weather__legend-title">Hotel season</div>
            <span className="weather__legend-item"><span className="weather__legend-dot weather__legend-dot--peak"></span> <strong>Peak</strong> — festive &amp; European summer (Dec–Jan, Jul–Aug). Premium rates, book early.</span>
            <span className="weather__legend-item"><span className="weather__legend-dot weather__legend-dot--high"></span> <strong>High</strong> — busy dry months (Feb, Jun, Sep–Oct). Standard high-season rates.</span>
            <span className="weather__legend-item"><span className="weather__legend-dot weather__legend-dot--low"></span> <strong>Low</strong> — rainy season (Mar–May, Nov). Best deals; some hotels close in Apr–May.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
