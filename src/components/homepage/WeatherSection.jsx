export default function WeatherSection({ MONTHS, SCORES, NOW_MONTH }) {
  return (
    <section className="weather reveal">
      <div className="weather-card">
        <div className="weather__hero">
          <div className="weather__place">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            Stone Town, Zanzibar · Live
          </div>
          <div className="weather__row">
            <div className="weather__icon">
              <svg width="90" height="90" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="32" cy="32" r="11" fill="rgba(255,111,97,.2)" />
                <path d="M32 8v6M32 50v6M12 32H6M58 32h-6M17 17l-4-4M51 51l-4-4M17 47l-4 4M51 13l-4 4" />
              </svg>
            </div>
            <div className="weather__temp">29<sup>°</sup></div>
          </div>
          <p className="weather__desc">Mostly sunny with a soft Indian Ocean breeze. The long rains are easing — mornings are clear, and the reef visibility holds through early afternoon.</p>
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
              <div className="weather-fact__value">27°C</div>
            </div>
            <div className="weather-fact">
              <div className="weather-fact__head">
                <svg className="weather-fact__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                <div className="weather-fact__label">Humidity</div>
              </div>
              <div className="weather-fact__value">74%</div>
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
              <div className="weather-fact__value">06:24</div>
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
              <div className="weather-fact__value">18:36</div>
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
