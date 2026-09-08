import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { DESTINATION_MAP_PINS } from '../../data/destinationMapPins.js';
import { isPrerender } from '../../utils/prerender.js';
import { ArrowIcon } from './Icons.jsx';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * @param {{
 *   tweaks?: any,
 *   PINS?: typeof DESTINATION_MAP_PINS,
 *   activePin?: string,
 *   setActivePin?: import('react').Dispatch<import('react').SetStateAction<string>>,
 *   islandPins?: typeof DESTINATION_MAP_PINS,
 *   mainlandPins?: typeof DESTINATION_MAP_PINS,
 *   ctaHref?: string,
 *   ctaLabel?: string,
 * }} props
 */
export default function MapSection({
  PINS: providedPins = undefined,
  activePin: providedActivePin = undefined,
  setActivePin: providedSetActivePin = undefined,
  islandPins: providedIslandPins = undefined,
  mainlandPins: providedMainlandPins = undefined,
  ctaHref = '#contact',
  ctaLabel,
}) {
  const { t, ready } = useTranslation(['home', 'explore']);
  // The homepage mounts this section lazily. Load the existing destination copy
  // with it, while keeping Explore's supplied pin data and selection intact.
  const pins = useMemo(() => providedPins ?? DESTINATION_MAP_PINS.map((pin) => ({
    ...pin,
    name: t(`pins.${pin.id}.name`, { ns: 'explore', defaultValue: pin.name }),
    desc: t(`pins.${pin.id}.desc`, { ns: 'explore', defaultValue: pin.desc }),
  })), [providedPins, t]);
  const [internalActivePin, setInternalActivePin] = useState('stone-town');
  const activePin = providedActivePin ?? internalActivePin;
  const setActivePin = providedSetActivePin ?? setInternalActivePin;
  const islandPins = providedIslandPins ?? pins.filter((pin) => pin.region === 'Zanzibar');
  const mainlandPins = providedMainlandPins ?? pins.filter((pin) => pin.region === 'Mainland');
  const resolvedCtaLabel = ctaLabel ?? t('map.cta_label');
  const mapElRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const mapApiRef = useRef(
    /** @type {{ map: any, markers: Record<string, any> } | null} */ (null),
  );

  // Build the map for the loaded pin set. Pin selection and page theme changes
  // keep the same map and standard OpenStreetMap tile layer.
  useEffect(() => {
    if (!ready) return undefined;
    const el = mapElRef.current;
    if (!el) return;
    // Skip live Leaflet during the build-time prerender crawl: a real map would
    // bake non-deterministic tile/marker DOM into the captured HTML and fire
    // tile requests. The static section markup (copy + pin list) still renders.
    if (isPrerender()) return undefined;

    if (mapApiRef.current) {
      try { mapApiRef.current.map.remove(); } catch { /* noop */ }
      mapApiRef.current = null;
    }
    const leafletEl = /** @type {{ _leaflet_id?: number }} */ (el);
    if (leafletEl._leaflet_id != null) delete leafletEl._leaflet_id;

    const map = L.map(el, {
      center: [-5.5, 37.0],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 14,
    }).addTo(map);

    const markers = {};
    pins.forEach((p, i) => {
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

    const invalidateTimer = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(invalidateTimer);
      try { map.remove(); } catch { /* noop */ }
      if (mapApiRef.current && mapApiRef.current.map === map) {
        mapApiRef.current = null;
      }
    };
  }, [ready, pins, setActivePin]);

  useEffect(() => {
    const r = mapApiRef.current;
    if (!r) return;
    const p = pins.find((x) => x.id === activePin);
    Object.entries(r.markers).forEach(([id, m]) => {
      if (m._icon) m._icon.classList.toggle('is-active', id === activePin);
    });
    if (p) r.map.flyTo([p.lat, p.lng], p.region === 'Mainland' ? 7 : 10, { duration: 0.8 });
  }, [activePin, pins, ready]);

  if (!ready) return null;

  return (
    <section className="map-section reveal" id="map">
      <div className="map-wrap">
        <div className="map-copy">
          <span className="section-eyebrow">{t('map.eyebrow')}</span>
          <h2 className="section-title">{t('map.title')}</h2>
          <p>{t('map.lead')}</p>

          <div className="map-list-group">
            <div className="map-list-label">{t('map.island_label')}</div>
            <ul className="map-list">
              {islandPins.map((p) => {
                const i = pins.findIndex((x) => x.id === p.id);
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

            <div className="map-list-label">{t('map.mainland_label')}</div>
            <ul className="map-list">
              {mainlandPins.map((p) => {
                const i = pins.findIndex((x) => x.id === p.id);
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

          <a className="btn" href={ctaHref} style={{ alignSelf: 'flex-start' }}>{resolvedCtaLabel} <ArrowIcon size={15} /></a>
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
