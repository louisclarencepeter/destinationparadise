import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/homepage.css';
import { SAFARI_TRIPS } from '../data/safariAssets.js';
import { EXCURSIONS } from '../data/excursionsData.js';
import HeroSection from '../components/homepage/HeroSection.jsx';
import ExcursionsSection from '../components/homepage/ExcursionsSection.jsx';
import SafarisSection from '../components/homepage/SafarisSection.jsx';
import PackagesSection from '../components/homepage/PackagesSection.jsx';
import WhySection from '../components/homepage/WhySection.jsx';
import MapSection from '../components/homepage/MapSection.jsx';
import WeatherSection from '../components/homepage/WeatherSection.jsx';
import GallerySection from '../components/homepage/GallerySection.jsx';
import TestimonialsSection from '../components/homepage/TestimonialsSection.jsx';
import PlannerSection from '../components/homepage/PlannerSection.jsx';
import ContactSection from '../components/homepage/ContactSection.jsx';
import NewsletterSection from '../components/homepage/NewsletterSection.jsx';
import ScrollCue from '../components/homepage/ScrollCue.jsx';

const PINS = [
  // Zanzibar — the island
  { id: 'stone-town', region: 'Zanzibar', name: 'Stone Town',    lat: -6.1659, lng: 39.1985, desc: 'Heritage walk' },
  { id: 'fumba',      region: 'Zanzibar', name: 'Fumba',         lat: -6.3413, lng: 39.2900, desc: 'Safari Blue dhow' },
  { id: 'kizimkazi',  region: 'Zanzibar', name: 'Kizimkazi',     lat: -6.4434, lng: 39.4670, desc: 'Dolphin snorkel' },
  { id: 'jozani',     region: 'Zanzibar', name: 'Jozani Forest', lat: -6.2790, lng: 39.4130, desc: 'Red colobus' },
  { id: 'nungwi',     region: 'Zanzibar', name: 'Nungwi',        lat: -5.7260, lng: 39.2960, desc: 'Dream Dhow sunset' },
  { id: 'matemwe',    region: 'Zanzibar', name: 'Matemwe',       lat: -5.8660, lng: 39.3580, desc: 'Reef snorkel' },
  { id: 'paje',       region: 'Zanzibar', name: 'Paje',          lat: -6.2700, lng: 39.5470, desc: 'Kitesurf lagoon' },
  // Tanzania mainland — northern + southern circuits
  { id: 'serengeti',  region: 'Mainland', name: 'Serengeti',         lat: -2.3333, lng: 34.8333, desc: 'Migration safari' },
  { id: 'ngorongoro', region: 'Mainland', name: 'Ngorongoro',        lat: -3.2250, lng: 35.4880, desc: 'Crater Big Five' },
  { id: 'tarangire',  region: 'Mainland', name: 'Tarangire',         lat: -4.0000, lng: 36.0000, desc: 'Elephants & baobabs' },
  { id: 'selous',     region: 'Mainland', name: 'Nyerere (Selous)',  lat: -8.5000, lng: 38.0000, desc: 'Boat & walking safari' },
];

// season: hotel pricing band, not climate.
//   'peak' — festive holidays + European summer (most expensive, book months ahead)
//   'high' — busy dry months, premium rates
//   'low'  — long rains + short rains, deals & some closures
const MONTHS = [
  { m: 'Jan', t: 32, season: 'peak' },  // festive tail (1st – 4th especially)
  { m: 'Feb', t: 33, season: 'high' },
  { m: 'Mar', t: 32, season: 'low' },   // long rains start
  { m: 'Apr', t: 30, season: 'low' },   // peak long rains, many hotels close
  { m: 'May', t: 29, season: 'low' },
  { m: 'Jun', t: 28, season: 'high' },
  { m: 'Jul', t: 27, season: 'peak' },  // European summer
  { m: 'Aug', t: 27, season: 'peak' },  // European summer
  { m: 'Sep', t: 28, season: 'high' },
  { m: 'Oct', t: 29, season: 'high' },
  { m: 'Nov', t: 30, season: 'low' },   // short rains
  { m: 'Dec', t: 31, season: 'peak' },  // festive premium
];
const SCORES = [72, 78, 62, 42, 56, 82, 92, 95, 90, 80, 55, 68];
const NOW_MONTH = new Date().getMonth();

const TWEAKS_DEFAULTS = { hero: 'photo', layout: '3up', theme: 'light' };

const ArrowIcon = (p) => (
  <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

function loadTweaks() {
  try {
    const saved = JSON.parse(localStorage.getItem('dp_tweaks') || 'null');
    if (saved) return { ...TWEAKS_DEFAULTS, ...saved };
  } catch (e) { /* noop */ }
  return { ...TWEAKS_DEFAULTS };
}

export default function Homepage() {
  const [tweaks, setTweaks] = useState(loadTweaks);
  const [activeCat, setActiveCat] = useState('All');
  const [activePin, setActivePin] = useState('stone-town');
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaksGearVisible, setTweaksGearVisible] = useState(false);
  const [plannerPrompt, setPlannerPrompt] = useState(null);

  // Persist theme + tweaks
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    try { localStorage.setItem('dp_tweaks', JSON.stringify(tweaks)); } catch (e) { /* noop */ }
  }, [tweaks]);

  useEffect(() => {
    const onThemeChange = (event) => {
      const theme = event.detail?.theme;
      if (theme) setTweaks((current) => ({ ...current, theme }));
    };
    window.addEventListener('dp-theme-change', onThemeChange);
    return () => window.removeEventListener('dp-theme-change', onThemeChange);
  }, []);

  // Reveal-on-scroll
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Edit-mode iframe handshake (when running inside claude.ai design preview)
  useEffect(() => {
    const onMsg = (ev) => {
      const t = ev.data && ev.data.type;
      if (t === '__activate_edit_mode') {
        setTweaksGearVisible(true);
        setTweaksOpen(true);
      } else if (t === '__deactivate_edit_mode') {
        setTweaksGearVisible(false);
        setTweaksOpen(false);
      }
    };
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) { /* noop */ }
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const setTweak = (key, val) => setTweaks((s) => ({ ...s, [key]: val }));

  const filteredEx = EXCURSIONS.filter((t) => activeCat === 'All' || t.category === activeCat).slice(0, 6);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    const excursion = fields.get('excursion') || 'Any experience';
    const date = fields.get('date') || '';
    const guests = fields.get('guests') || '2 guests';
    const genericSelections = new Set(['Any experience', 'Any trip or safari']);
    const experienceText = genericSelections.has(excursion)
      ? 'a recommended Zanzibar trip or Tanzania safari'
      : excursion;
    const dateText = date ? ` on ${date}` : ' on flexible dates';

    setPlannerPrompt({
      id: Date.now(),
      text: `I'm looking for ${experienceText}${dateText} for ${guests}. Can you suggest the best fit and ask me anything else you need?`,
    });
    document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---- Leaflet map (Zanzibar + Tanzania mainland) ----
  const mapElRef = useRef(null);
  const mapApiRef = useRef(null);
  const isDark = tweaks.theme === 'dark';

  useEffect(() => {
    const el = mapElRef.current;
    if (!el) return;

    // Tear down any prior instance attached to this element (StrictMode double-mount,
    // Vite HMR, or theme-change re-init). map.remove() unstamps _leaflet_id; the
    // explicit delete is a belt-and-braces guard for HMR cases that bypass cleanup.
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

    // Leaflet sometimes mis-measures inside reveal-on-scroll containers
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(t);
      try { map.remove(); } catch { /* noop */ }
      if (mapApiRef.current && mapApiRef.current.map === map) {
        mapApiRef.current = null;
      }
    };
  }, [isDark]);

  // Fly to active pin + toggle .is-active class on its DOM node
  useEffect(() => {
    const r = mapApiRef.current;
    if (!r) return;
    const p = PINS.find((x) => x.id === activePin);
    Object.entries(r.markers).forEach(([id, m]) => {
      if (m._icon) m._icon.classList.toggle('is-active', id === activePin);
    });
    if (p) r.map.flyTo([p.lat, p.lng], p.region === 'Mainland' ? 7 : 10, { duration: 0.8 });
  }, [activePin]);

  const islandPins = PINS.filter((p) => p.region === 'Zanzibar');
  const mainlandPins = PINS.filter((p) => p.region === 'Mainland');

  return (
    <>
      <HeroSection tweaks={tweaks} handleHeroSearch={handleHeroSearch} />
      <ExcursionsSection tweaks={tweaks} activeCat={activeCat} setActiveCat={setActiveCat} filteredEx={filteredEx} />
      <ScrollCue to="safaris" label="Next" />
      <SafarisSection />
      <ScrollCue to="packages" label="Next" />
      <PackagesSection />
      <ScrollCue to="planner" label="Next" />
      <PlannerSection initialPrompt={plannerPrompt} />
      <ScrollCue to="why" label="Next" />
      <WhySection />
      <ScrollCue to="map" label="Next" />
      <MapSection 
        tweaks={tweaks} 
        PINS={PINS} 
        activePin={activePin} 
        setActivePin={setActivePin} 
        islandPins={islandPins} 
        mainlandPins={mainlandPins} 
      />
      <ScrollCue to="weather" label="Next" />
      <WeatherSection MONTHS={MONTHS} SCORES={SCORES} NOW_MONTH={NOW_MONTH} />
      <ScrollCue to="gallery" label="Next" />
      <GallerySection />
      <ScrollCue to="reviews" label="Next" />
      <TestimonialsSection />
      <ScrollCue to="contact" label="Next" />
      <ContactSection />
      <ScrollCue to="newsletter" label="Next" />
      <NewsletterSection />

      {/* ============ TWEAKS PANEL (claude.ai design preview only) ============ */}
      <button
        className="tweaks-gear"
        aria-label="Open tweaks"
        onClick={() => setTweaksOpen((v) => !v)}
        style={{ display: tweaksGearVisible ? 'inline-flex' : 'none' }}
      >⚙</button>
      <aside className={`tweaks${tweaksOpen ? ' tweaks--open' : ''}`} role="dialog" aria-label="Tweaks">
        <h4>Tweaks</h4>
        {[
          { key: 'hero', label: 'Hero variant', opts: [['photo', 'Photo'], ['split', 'Split'], ['video', 'Video']] },
          { key: 'layout', label: 'Excursion layout', opts: [['3up', '3-up'], ['2up', 'Feature'], ['carousel', 'Carousel']] },
          { key: 'theme', label: 'Theme', opts: [['light', 'Light'], ['dark', 'Dark']] },
        ].map((g) => (
          <div className="tweaks-group" key={g.key}>
            <label className="tweaks-group__label">{g.label}</label>
            <div className="tweaks-opts">
              {g.opts.map(([val, lbl]) => (
                <button
                  key={val}
                  className={tweaks[g.key] === val ? 'is-active' : ''}
                  onClick={() => setTweak(g.key, val)}
                >{lbl}</button>
              ))}
            </div>
          </div>
        ))}
      </aside>
    </>
  );
}
