import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowIcon } from './Icons.jsx';

export default function MapSection({ tweaks, PINS, activePin, setActivePin, islandPins, mainlandPins, ctaHref = '#contact', ctaLabel = 'Build a custom itinerary' }) {
  const mapElRef = useRef(null);
  const mapApiRef = useRef(null);
  const isDark = tweaks.theme === 'dark';

  useEffect(() => {
    const el = mapElRef.current;
    if (!el) return;

    if (mapApiRef.current) {
      try { mapApiRef.current.map.remove(); } catch { /* noop */ }
      mapApiRef.current = null;
    }
    if (el._leaflet_id != null) delete el._leaflet_id;

    const map = L.map(el, {
      center: [-5.5, 37.0],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 14,
    }).addTo(map);

    const markers = {};
    PINS.forEach((p, i) => {
      const icon = L.divIcon({
        className: 'dp-leaflet-pin',
        html:
          `<span class="map-pin__ping"></span>` +
          `<span class="map-pin__label">${p.name}</span>` +
          `<span class="map-pin__dot">${i + 1}</span>` +
          `<span class="map-pin__tail"></span>`,
        iconSize: [34, 50],
        iconAnchor: [17, 50],
      });
      const m = L.marker([p.lat, p.lng], { icon, riseOnHover: true })
        .addTo(map)
        .on('click', () => setActivePin(p.id));
      markers[p.id] = m;
    });

    mapApiRef.current = { map, markers };

    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(t);
      try { map.remove(); } catch { /* noop */ }
      if (mapApiRef.current && mapApiRef.current.map === map) {
        mapApiRef.current = null;
      }
    };
  }, [isDark, PINS, setActivePin]);

  useEffect(() => {
    const r = mapApiRef.current;
    if (!r) return;
    const p = PINS.find((x) => x.id === activePin);
    Object.entries(r.markers).forEach(([id, m]) => {
      if (m._icon) m._icon.classList.toggle('is-active', id === activePin);
    });
    if (p) r.map.flyTo([p.lat, p.lng], p.region === 'Mainland' ? 7 : 10, { duration: 0.8 });
  }, [activePin, PINS]);

  return (
    <section className="map-section reveal" id="map">
      <div className="map-wrap">
        <div className="map-copy">
          <span className="section-eyebrow">The Region</span>
          <h2 className="section-title">Zanzibar &amp; Tanzania at a glance</h2>
          <p>One country, two worlds. The island gives you Stone Town's heritage, dhows on the reef, beaches, culture, and ocean days. Cross to the mainland for northern icons, southern wilderness, western chimp routes, quick fly-ins, mountain days, and cultural stops.</p>
          
          <div className="map-list-group">
            <div className="map-list-label">Zanzibar</div>
            <ul className="map-list">
              {islandPins.map((p) => {
                const i = PINS.findIndex((x) => x.id === p.id);
                return (
                  <li key={p.id} className={p.id === activePin ? 'is-active' : ''}>
                    <button
                      type="button"
                      className="map-list__button"
                      aria-pressed={p.id === activePin}
                      onClick={() => setActivePin(p.id)}
                    >
                      <span className="num">{i + 1}</span>
                      <span>{p.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{p.desc}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="map-list-label">Mainland Tanzania</div>
            <ul className="map-list">
              {mainlandPins.map((p) => {
                const i = PINS.findIndex((x) => x.id === p.id);
                return (
                  <li key={p.id} className={p.id === activePin ? 'is-active' : ''}>
                    <button
                      type="button"
                      className="map-list__button"
                      aria-pressed={p.id === activePin}
                      onClick={() => setActivePin(p.id)}
                    >
                      <span className="num">{i + 1}</span>
                      <span>{p.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{p.desc}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <a className="btn" href={ctaHref} style={{ alignSelf: 'flex-start' }}>{ctaLabel} <ArrowIcon size={15} /></a>
        </div>
        <div className="map-stage">
          <div ref={mapElRef} className="map-leaflet" />
          <div className="map-compass">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
