import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/homepage.css';
import { SAFARI_TRIPS } from '../data/safariAssets.js';

const EXCURSIONS = [
  { id: 'safari-blue', title: 'Safari Blue Dhow & Snorkel', category: 'Water', description: 'A full day aboard traditional sailing dhows — mangrove swims, sandbank picnics, snorkel reefs off Kwale island.', image: '/assets/images/excursions/safari-blue-sandbank.jpg', duration: 'Full Day', price: 95, group: 'Up to 8', from: 'Fumba' },
  { id: 'stone-town', title: 'Stone Town Heritage Walk', category: 'Culture', description: "A journey through timeless alleys where history resonates — carved doors, the Old Fort, spice markets and Freddie Mercury's birthplace.", image: '/assets/images/excursions/stone-town-old-fort.jpg', duration: 'Half Day', price: 55, group: 'Up to 6', from: 'Stone Town' },
  { id: 'spice-tour', title: 'Spice & Culture Tour', category: 'Culture', description: 'A half-day journey through Central Zanzibar — cloves, nutmeg, cinnamon and the stories shaped by the Spice Islands.', image: '/assets/images/excursions/spice-tour-nutmeg.webp', duration: 'Half Day', price: 45, group: 'Up to 8', from: 'Stone Town' },
  { id: 'dream-dhow', title: 'Dream Dhow Sunset Cruise', category: 'Water', description: 'Two hours on the Indian Ocean at golden hour. Fresh fruit, traditional dhow, a swim if the mood strikes.', image: '/assets/images/excursions/dream-dhow-sunset.jpeg', duration: 'Evening', price: 60, group: 'Up to 10', from: 'Nungwi' },
  { id: 'dolphins', title: 'Dolphin Snorkeling', category: 'Water', description: 'An early morning in Kizimkazi with bottlenose pods, followed by lunch at a beachfront local spot.', image: '/assets/images/excursions/dolphin-snorkeling.jpg', duration: 'Half Day', price: 70, group: 'Up to 6', from: 'Kizimkazi' },
  { id: 'prison-island', title: 'Prison Island & Giant Tortoises', category: 'Nature', description: 'A short crossing to Changuu — Aldabra tortoises over a century old, coral pools and a quiet beach.', image: '/assets/images/excursions/prison-island-tortoise.webp', duration: 'Half Day', price: 50, group: 'Up to 8', from: 'Stone Town' },
];

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
const PLANNER_TITLE = 'Tell me about your dream trip';

const ArrowIcon = (p) => (
  <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const renderInlineFormatting = (text) => {
  const parts = [];
  const pattern = /(\*\*([^*\n]+)\*\*|\*([^*\n]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={`strong-${match.index}`}>{match[2]}</strong>);
    } else {
      parts.push(<em key={`em-${match.index}`}>{match[3]}</em>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const renderFormattedText = (text) =>
  (text || '')
    .split(/\n\n+/)
    .map((paragraph, paragraphIndex) => (
      <p key={paragraphIndex}>
        {paragraph.split('\n').map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {renderInlineFormatting(line)}
          </Fragment>
        ))}
      </p>
    ));

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
  const [navOpen, setNavOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaksGearVisible, setTweaksGearVisible] = useState(false);
  const [plannerPrompt, setPlannerPrompt] = useState(null);

  // Persist theme + tweaks
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    try { localStorage.setItem('dp_tweaks', JSON.stringify(tweaks)); } catch (e) { /* noop */ }
  }, [tweaks]);

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
    const experienceText = excursion === 'Any experience' ? 'a recommended Zanzibar experience' : excursion;
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
      {/* ============ NAV ============ */}
      <nav className="nav" id="top">
        <a className="nav__logo" href="#top">
          <img src="/assets/brand/destination-paradise-logo.png" alt="Destination Paradise" />
          <span className="nav__logo-text">Destination Paradise<small>Zanzibar Island</small></span>
        </a>
        <ul className={`nav__menu${navOpen ? ' nav__menu--open' : ''}`} id="navMenu" onClick={(e) => { if (e.target.tagName === 'A') setNavOpen(false); }}>
          <li className="nav__item"><a href="#excursions">Excursions</a></li>
          <li className="nav__item"><a href="#safaris">Safaris</a></li>
          <li className="nav__item"><a href="#packages">Packages</a></li>
          <li className="nav__item"><a href="#planner">Trip Planner</a></li>
          <li className="nav__item"><a href="#map">Explore</a></li>
        </ul>
        <div className="nav__right">
          <button
            className="theme-toggle"
            aria-label="Toggle theme"
            onClick={() => setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark')}
          >
            {tweaks.theme === 'dark' ? (
              <svg className="i-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg className="i-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
          <a className="btn nav__cta" href="#contact">
            <span className="nav__cta-text">Book Now</span> <ArrowIcon size={16} />
          </a>
          <button className="nav__burger" aria-label="Menu" onClick={() => setNavOpen((v) => !v)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className={`hero hero--${tweaks.hero}`} id="hero">
        <div className="hero__bg"><img src="/assets/images/home/aerial-boats-turquoise-water.jpg" alt="" /></div>
        <div className="hero__content">
          <span className="hero__eyebrow">Guided excursions · Since 2015</span>
          <h1 className="hero__title">Destination Paradise</h1>
          <h2 className="hero__motto"><i>your next trip to paradise…</i></h2>
          <p className="hero__desc">Welcome to your gateway to the enchanting Zanzibar Island. Imagine a place where each day is an adventure, and every horizon promises new discoveries.</p>
          <div className="hero__cta-row">
            <a className="btn" href="#excursions">Browse excursions <ArrowIcon size={18} /></a>
            <a className="btn btn--ghost" href="#map">Explore the island</a>
          </div>
          <form className="hero__search" onSubmit={handleHeroSearch}>
            <div className="hero__search-field">
              <label>Excursion</label>
              <select name="excursion" defaultValue="Any experience">
                <option>Any experience</option>
                <option>Stone Town Heritage Walk</option>
                <option>Safari Blue Dhow</option>
                <option>Spice &amp; Culture Tour</option>
                <option>Dream Dhow Sunset</option>
                <option>Dolphin Snorkeling</option>
              </select>
            </div>
            <div className="hero__search-field">
              <label>Date</label>
              <input type="date" name="date" defaultValue="2026-05-12" />
            </div>
            <div className="hero__search-field">
              <label>Guests</label>
              <select name="guests" defaultValue="2 guests">
                <option>1 guest</option>
                <option>2 guests</option>
                <option>3 guests</option>
                <option>4 guests</option>
                <option>5+ guests</option>
              </select>
            </div>
            <button className="hero__search-submit" type="submit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              Find trips
            </button>
          </form>
        </div>
        <div className="hero__scroll"><span>Scroll</span><div className="hero__scroll-line"></div></div>
      </section>

      {/* ============ EXCURSIONS ============ */}
      <section className="excursions reveal" id="excursions" data-layout={tweaks.layout}>
        <header className="excursions__head">
          <span className="section-eyebrow">Roaming Retreats</span>
          <h2 className="section-title">Excursions crafted by locals</h2>
          <p className="section-lead">Hand-built itineraries — small groups, traditional boats, guides who grew up on these shores.</p>
          <div className="excursions__tabs" role="tablist">
            {['All', 'Water', 'Culture', 'Nature'].map((cat) => (
              <button
                key={cat}
                className={`excursions__tab${cat === activeCat ? ' is-active' : ''}`}
                aria-selected={cat === activeCat}
                onClick={() => setActiveCat(cat)}
              >{cat}</button>
            ))}
          </div>
        </header>
        <div className="excursions__grid">
          {filteredEx.map((t) => (
            <Link className="ex-card" key={t.id} to={`/excursions/${t.id}`} aria-label={`Explore ${t.title}`}>
              <div className="ex-card__img">
                <img src={t.image} alt={t.title} />
                <span className="ex-card__badge">{t.duration}</span>
                <div className="ex-card__price">
                  <div className="ex-card__price-from">From</div>
                  <div className="ex-card__price-num">${t.price}</div>
                </div>
              </div>
              <div className="ex-card__body">
                <div className="ex-card__meta">
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" />
                    </svg> {t.from}
                  </span>
                  <span className="dot"></span>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg> {t.group}
                  </span>
                </div>
                <h3 className="ex-card__title">{t.title}</h3>
                <p className="ex-card__text">{t.description}</p>
                <span className="ex-card__link">Explore this trip <ArrowIcon size={15} /></span>
              </div>
            </Link>
          ))}
        </div>
        <div className="excursions__more">
          <Link className="btn btn--on-light" to="/excursions">View all 14 excursions <ArrowIcon size={16} /></Link>
        </div>
      </section>

      {/* ============ SAFARIS ============ */}
      <section className="safaris reveal" id="safaris">
        <header className="safaris__head">
          <span className="section-eyebrow">Northern &amp; Southern Circuits</span>
          <h2 className="section-title">Safaris in Tanzania</h2>
          <p className="section-lead">Three ways in: book a dedicated safari and fly straight to Kilimanjaro or Dar; grab a last-minute trip while you're already on Zanzibar; or roll one into a multi-stop package. We handle bush flights, lodges and rangers — you bring binoculars.</p>
          <ul className="safaris__modes">
            <li><span className="safaris__mode-tag">Standalone</span> Fly in from anywhere — northern or southern circuit.</li>
            <li><span className="safaris__mode-tag safaris__mode-tag--accent">Last-minute</span> Already on Zanzibar? We'll piece a 3–5 night trip together fast.</li>
            <li><span className="safaris__mode-tag">In a package</span> Bundled with hotels and excursions — see Packages below.</li>
          </ul>
        </header>
        <div className="safaris__grid">
          {SAFARI_TRIPS.map((trip) => (
            <article className={`safari-card${trip.featured ? ' safari-card--feature' : ''}`} key={trip.id}>
              <div className="safari-card__img">
                <img src={trip.image} alt={trip.imageAlt} loading="lazy" />
                <span className="safari-card__nights">{trip.nights}</span>
              </div>
              <div className="safari-card__body">
                <h3>{trip.title}</h3>
                <p>{trip.description}</p>
                <div className="safari-card__foot">
                  <span className="safari-card__from">From <strong>{trip.price}</strong> pp</span>
                  <Link className="ex-card__link" to="/safaris">View itinerary <ArrowIcon size={14} /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ============ PACKAGES ============ */}
      <section className="packages reveal" id="packages">
        <header className="packages__head">
          <span className="section-eyebrow">All-in-One</span>
          <h2 className="section-title">Curated packages — hotels, safaris &amp; excursions</h2>
          <p className="section-lead">A single price, every transfer covered. We pair a hand-picked hotel with safaris on the mainland and excursions on the island.</p>
        </header>
        <div className="packages__grid">
          <article className="pkg-card">
            <div className="pkg-card__rib">Most popular</div>
            <div className="pkg-card__head">
              <span className="pkg-card__nights">7 nights</span>
              <h3>Island Essentials</h3>
              <p className="pkg-card__lead">Stone Town heritage, beach days in Matemwe, one full-day Safari Blue dhow.</p>
            </div>
            <ul className="pkg-card__list">
              <li><span className="pkg-tag pkg-tag--hotel">Hotel</span> Park Hyatt Stone Town · 2 nts</li>
              <li><span className="pkg-tag pkg-tag--hotel">Hotel</span> Zuri Zanzibar Matemwe · 5 nts</li>
              <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Stone Town Heritage Walk</li>
              <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Safari Blue Dhow &amp; Snorkel</li>
              <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Spice &amp; Culture Tour</li>
              <li><span className="pkg-tag pkg-tag--inc">Included</span> Airport pickup, all transfers</li>
            </ul>
            <div className="pkg-card__foot">
              <div><span className="pkg-card__from">From</span><span className="pkg-card__price">$2,490</span><span className="pkg-card__pp">per person</span></div>
              <a className="btn" href="#contact">Build this trip <ArrowIcon size={14} /></a>
            </div>
          </article>
          <article className="pkg-card pkg-card--feature">
            <div className="pkg-card__rib pkg-card__rib--gold">Signature</div>
            <div className="pkg-card__head">
              <span className="pkg-card__nights">10 nights</span>
              <h3>Bush &amp; Beach</h3>
              <p className="pkg-card__lead">Three nights on safari in the Serengeti, then unwind on a private Matemwe beachfront villa.</p>
            </div>
            <ul className="pkg-card__list">
              <li><span className="pkg-tag pkg-tag--saf">Safari</span> Serengeti — Sayari Camp · 3 nts</li>
              <li><span className="pkg-tag pkg-tag--saf">Safari</span> Ngorongoro — &amp;Beyond · 2 nts</li>
              <li><span className="pkg-tag pkg-tag--hotel">Hotel</span> Zanzibar White Sand Villas · 5 nts</li>
              <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Dream Dhow Sunset Cruise</li>
              <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Dolphin Snorkeling</li>
              <li><span className="pkg-tag pkg-tag--inc">Included</span> Bush flights, ranger fees, all meals</li>
            </ul>
            <div className="pkg-card__foot">
              <div><span className="pkg-card__from">From</span><span className="pkg-card__price">$5,790</span><span className="pkg-card__pp">per person</span></div>
              <a className="btn" href="#contact">Build this trip <ArrowIcon size={14} /></a>
            </div>
          </article>
          <article className="pkg-card">
            <div className="pkg-card__head">
              <span className="pkg-card__nights">5 nights</span>
              <h3>Honeymoon Hideaway</h3>
              <p className="pkg-card__lead">A quiet northern villa, two private excursions, and a candle-lit dhow dinner for two.</p>
            </div>
            <ul className="pkg-card__list">
              <li><span className="pkg-tag pkg-tag--hotel">Hotel</span> The Residence Zanzibar · 5 nts</li>
              <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Private Dream Dhow at sunset</li>
              <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Mnemba Atoll snorkel — private</li>
              <li><span className="pkg-tag pkg-tag--inc">Included</span> Couples spa, bush picnic, transfers</li>
            </ul>
            <div className="pkg-card__foot">
              <div><span className="pkg-card__from">From</span><span className="pkg-card__price">$3,180</span><span className="pkg-card__pp">per person</span></div>
              <a className="btn" href="#contact">Build this trip <ArrowIcon size={14} /></a>
            </div>
          </article>
        </div>
        <div className="packages__note">Every package is a starting point — message us and we'll adjust nights, hotels, and routes around your dates.</div>
      </section>

      {/* ============ TRIP PLANNER ============ */}
      <TripPlanner initialPrompt={plannerPrompt} />

      {/* ============ WHY ============ */}
      <section className="why reveal" id="why">
        <div className="why__head">
          <span className="section-eyebrow">Why Destination Paradise</span>
          <h2 className="section-title">Local, flexible, and genuinely yours</h2>
        </div>
        <div className="why__grid">
          <article className="why-card">
            <span className="why-card__num">01</span>
            <span className="why-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </span>
            <h3 className="why-card__title">Locally rooted</h3>
            <p className="why-card__text">Guides who grew up between Zanzibar's alleys and the Tanzanian bush. Every reef, recipe and ranger trail comes with a story you won't find in a guidebook.</p>
          </article>
          <article className="why-card">
            <span className="why-card__num">02</span>
            <span className="why-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 4 13c0-4 3-9 9-11 0 6 0 10-2 14-1 2-3 4-5 5z" transform="translate(2 0)" />
                <path d="M2 22c4-4 7-6 12-8" />
              </svg>
            </span>
            <h3 className="why-card__title">Group or private</h3>
            <p className="why-card__text">Shared dhow days with new friends, or a private tour, package or safari built around just your group. Same care, your pace.</p>
          </article>
          <article className="why-card">
            <span className="why-card__num">03</span>
            <span className="why-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.2.6-.6.5-1.1z" /></svg>
            </span>
            <h3 className="why-card__title">Everything handled</h3>
            <p className="why-card__text">Airport pickup, hotel transfers, dietary needs, last-minute changes. Message us and it's already sorted.</p>
          </article>
        </div>
      </section>

      {/* ============ MAP ============ */}
      <section className="map-section reveal" id="map">
        <div className="map-wrap">
          <div className="map-copy">
            <span className="section-eyebrow">The Region</span>
            <h2 className="section-title">Zanzibar &amp; Tanzania at a glance</h2>
            <p>One country, two worlds. The island gives you Stone Town's heritage, dhows on the reef, and dolphins in the south. Cross to the mainland for the great migration in the Serengeti, the crater at Ngorongoro, and the boats and walking safaris of Selous.</p>

            <div className="map-list-group">
              <div className="map-list-label">Zanzibar</div>
              <ul className="map-list">
                {islandPins.map((p) => {
                  const i = PINS.findIndex((x) => x.id === p.id);
                  return (
                    <li
                      key={p.id}
                      className={p.id === activePin ? 'is-active' : ''}
                      onClick={() => setActivePin(p.id)}
                    >
                      <span className="num">{i + 1}</span>
                      <span>{p.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{p.desc}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="map-list-label">Mainland safari</div>
              <ul className="map-list">
                {mainlandPins.map((p) => {
                  const i = PINS.findIndex((x) => x.id === p.id);
                  return (
                    <li
                      key={p.id}
                      className={p.id === activePin ? 'is-active' : ''}
                      onClick={() => setActivePin(p.id)}
                    >
                      <span className="num">{i + 1}</span>
                      <span>{p.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{p.desc}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <a className="btn" href="#contact" style={{ alignSelf: 'flex-start' }}>Build a custom itinerary <ArrowIcon size={15} /></a>
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

      {/* ============ WEATHER ============ */}
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

      {/* ============ GALLERY ============ */}
      <section className="gallery-section reveal">
        <div className="gallery-head">
          <span className="section-eyebrow">A Glimpse</span>
          <h2 className="section-title">Moments from the shore</h2>
          <p className="section-lead">Real photos from recent trips. No stock, no filters — just the island as we found it.</p>
        </div>
        <div className="gallery-strip">
          <figure className="gallery-tile gallery-tile--tall"><img src="/assets/images/excursions/dream-dhow-sunset.jpeg" alt="" /><figcaption className="gallery-tile__caption">Dream Dhow sunset</figcaption></figure>
          <figure className="gallery-tile"><img src="/assets/images/excursions/stone-town-old-fort.jpg" alt="" /><figcaption className="gallery-tile__caption">Stone Town Old Fort</figcaption></figure>
          <figure className="gallery-tile gallery-tile--wide"><img src="/assets/images/excursions/dolphin-snorkeling.jpg" alt="" /><figcaption className="gallery-tile__caption">Dolphin snorkel</figcaption></figure>
          <figure className="gallery-tile"><img src="/assets/images/home/mizingani-waterfront.jpg" alt="" /><figcaption className="gallery-tile__caption">Mizingani morning</figcaption></figure>
          <figure className="gallery-tile gallery-tile--tall"><img src="/assets/images/excursions/safari-blue-sandbank.jpg" alt="" /><figcaption className="gallery-tile__caption">Safari Blue sandbank</figcaption></figure>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="testimonials reveal" id="reviews">
        <div className="testimonials__head">
          <span className="section-eyebrow">Voices from the Shore</span>
          <h2 className="section-title">What guests take home</h2>
        </div>
        <div className="testimonials__grid">
          <figure className="tm">
            <div className="tm__mark">"</div>
            <blockquote className="tm__quote">You can walk the mangroves and enjoy the best sunset ever. Thanks to the team — the warmth and care were unreal.</blockquote>
            <div className="tm__foot"><img className="tm__avatar" src="/assets/images/testimonials/isa.jpg" alt="" /><div><div className="tm__name">Isa Jua</div><div className="tm__trip">Mangroves &amp; Sunset</div></div><div className="tm__stars">★★★★★</div></div>
          </figure>
          <figure className="tm">
            <div className="tm__mark">"</div>
            <blockquote className="tm__quote">Our guide was knowledgeable, upbeat and friendly. The dhow was beautiful, the lagoon unforgettable. Booked again before leaving.</blockquote>
            <div className="tm__foot"><img className="tm__avatar" src="/assets/images/testimonials/arturo.jpg" alt="" /><div><div className="tm__name">Arturo García</div><div className="tm__trip">Safari Blue Dhow</div></div><div className="tm__stars">★★★★★</div></div>
          </figure>
          <figure className="tm">
            <div className="tm__mark">"</div>
            <blockquote className="tm__quote">We smelled every spice, asked a hundred questions, and the team went above and beyond to answer them all. Best day of our trip.</blockquote>
            <div className="tm__foot"><img className="tm__avatar" src="/assets/images/testimonials/coleman.jpg" alt="" /><div><div className="tm__name">Coleman Reid</div><div className="tm__trip">Spice &amp; Culture Tour</div></div><div className="tm__stars">★★★★★</div></div>
          </figure>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <ContactSection />

      {/* ============ NEWSLETTER ============ */}
      <NewsletterSection />

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo">
              <img src="/assets/brand/destination-paradise-logo.png" alt="Destination Paradise" />
              <span className="footer__logo-text">Destination Paradise<small>Zanzibar Island</small></span>
            </div>
            <p>A small, local travel company on the shores of Zanzibar. Unhurried days, traditional boats, and guides who grew up here.</p>
            <p className="footer__script">your next trip to paradise…</p>
            <div className="footer__socials">
              <a href="https://wa.me/message/YCOQDKJSDMXFD1" target="_blank" rel="noreferrer" aria-label="WhatsApp"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" /></svg></a>
              <a href="https://www.instagram.com/yournexttriptoparadise/" target="_blank" rel="noreferrer" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" /></svg></a>
              <a href="https://www.facebook.com/yournexttriptoparadise/" target="_blank" rel="noreferrer" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></a>
              <a href="https://www.youtube.com/@destinationparadisezanzibar" target="_blank" rel="noreferrer" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></a>
              <a href="https://x.com/destinationxpar" target="_blank" rel="noreferrer" aria-label="X"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg></a>
            </div>
          </div>
          <div className="footer__col"><h4>Excursions</h4><ul><li><Link to="/excursions/safari-blue">Safari Blue Dhow</Link></li><li><Link to="/excursions/stone-town">Stone Town Walk</Link></li><li><Link to="/excursions/spice-tour">Spice Tour</Link></li><li><Link to="/excursions/dream-dhow">Dream Dhow Sunset</Link></li><li><Link to="/excursions/dolphins">Dolphin Snorkel</Link></li><li><Link to="/excursions/prison-island">Prison Island</Link></li></ul></div>
          <div className="footer__col"><h4>Company</h4><ul><li><Link to="/aboutus">Our story</Link></li><li><Link to="/aboutus">Guides</Link></li><li><Link to="/aboutus">Sustainability</Link></li><li><Link to="/aboutus">Press</Link></li><li><Link to="/aboutus">Careers</Link></li></ul></div>
          <div className="footer__col"><h4>Get in touch</h4><ul><li><a href="mailto:info@yournexttriptoparadise.com">info@yournexttriptoparadise.com</a></li><li><a href="tel:+255768779517">+255 768 779 517</a></li><li><a href="tel:+255748352657">+255 748 352 657</a></li><li><a href="#contact">Zanzibar, Tanzania</a></li><li><a href="https://wa.me/message/YCOQDKJSDMXFD1" target="_blank" rel="noreferrer">WhatsApp us</a></li></ul></div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Destination Paradise · Zanzibar, Tanzania</span>
          <span><Link to="/privacy-policy">Privacy</Link> <Link to="/terms-of-service">Terms</Link> <Link to="/cookies-policy">Cookies</Link></span>
        </div>
      </footer>

      <a className="whatsapp-fab" href="https://wa.me/message/YCOQDKJSDMXFD1" target="_blank" rel="noreferrer" aria-label="Chat with the team on WhatsApp">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" /></svg>
        <span className="whatsapp-fab__dot" aria-hidden="true"></span>
        <span className="whatsapp-fab__label">Chat with the team</span>
      </a>

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

/* ============ TRIP PLANNER ============ */
function TripPlanner({ initialPrompt }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [typedTitle, setTypedTitle] = useState(PLANNER_TITLE);
  const [titleTyping, setTitleTyping] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const handledPromptRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [history, sending]);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setTypedTitle(PLANNER_TITLE);
      setTitleTyping(false);
      return undefined;
    }

    let timeoutId;
    let index = 0;
    setTypedTitle('');
    setTitleTyping(true);

    const typeNext = () => {
      index += 1;
      setTypedTitle(PLANNER_TITLE.slice(0, index));

      if (index >= PLANNER_TITLE.length) {
        setTitleTyping(false);
        return;
      }

      const char = PLANNER_TITLE[index - 1];
      const nextChar = PLANNER_TITLE[index];
      const pause = char === ' ' || nextChar === ' ' ? 94 : 42 + ((index % 5) * 13);
      timeoutId = window.setTimeout(typeNext, pause);
    };

    timeoutId = window.setTimeout(typeNext, 360);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function send(text) {
    if (!text || sending) return;
    const next = [...history, { role: 'user', content: text }];
    setHistory(next);
    setInput('');
    setSending(true);
    if (inputRef.current) inputRef.current.style.height = 'auto';
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ history: next }),
      });
      const data = await res.json();
      const reply = data.reply || "Hmm, I lost my train of thought. Could you say that again?";
      setHistory((h) => [...h, { role: 'assistant', content: reply }]);
    } catch (err) {
      setHistory((h) => [...h, { role: 'assistant', content: "Pole sana — I couldn't reach the planner just now. Try again in a moment, or message the team directly via the WhatsApp button." }]);
    } finally {
      setSending(false);
      if (inputRef.current) inputRef.current.focus();
    }
  }

  useEffect(() => {
    if (!initialPrompt || handledPromptRef.current === initialPrompt.id || sending) return;
    handledPromptRef.current = initialPrompt.id;
    send(initialPrompt.text);
  }, [initialPrompt, sending]);

  return (
    <section className="planner reveal" id="planner">
      <div className="planner__wrap">
        <div className="planner__intro">
          <span className="section-eyebrow planner__eyebrow"><span className="planner__pulse"></span> AI Trip Planner</span>
          <h2 className="section-title planner__title" aria-label={PLANNER_TITLE}>
            <span className="planner__typing" aria-hidden="true">{typedTitle}</span>
            <span className={`planner__cursor${titleTyping ? ' planner__cursor--typing' : ''}`} aria-hidden="true"></span>
          </h2>
          <p className="planner__lead">Chat with our AI planner — built on years of routes the team has walked. It'll ask the right questions and sketch a day-by-day itinerary you can hand to us to book.</p>
          <ul className="planner__bullets">
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Asks about you</strong> — pace, budget, water vs. wildlife, kids in tow, special dates.</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Builds a draft</strong> — nights per place, recommended hotels, excursion pacing.</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Hands it to a human</strong> — our team reviews, prices, and confirms with real availability.</span></li>
          </ul>
          <div className="planner__suggestions">
            <span className="planner__suggestions-label">Try:</span>
            <button className="planner__suggest" onClick={() => send("We're a couple, 8 nights in October. We want a mix of beach, dhow sailing, and one big experience. Mid-range hotels.")}>Couple, 8 nights, beach + dhow</button>
            <button className="planner__suggest" onClick={() => send('Family of four with kids 9 and 12. Two weeks in July. We want a few days of safari then unwind on a beach. Budget around $4k pp.')}>Family with kids, safari + beach</button>
            <button className="planner__suggest" onClick={() => send('Solo traveler, 5 nights in February. Love spice markets, history, snorkeling. Boutique hotel under $200/night.')}>Solo, history + snorkel</button>
          </div>
        </div>

        <div className="planner__chat" key={resetKey}>
          <header className="planner__header">
            <div className="planner__avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <div className="planner__header-text">
              <strong>Paradise Planner</strong>
              <span><span className="planner__online"></span> Powered by Claude · usually replies instantly</span>
            </div>
            <button
              className="planner__reset"
              title="Start over"
              onClick={() => { setHistory([]); setResetKey((k) => k + 1); }}
            >↻</button>
          </header>
          <div className="planner__log" ref={logRef} role="log" aria-live="polite">
            <div className="planner__msg planner__msg--bot">
              <div className="planner__bubble">
                <p>Karibu! 👋 I'm the Destination Paradise planner — let's sketch your trip together.</p>
                <p>To start, what kind of pace are you after? <em>Beach &amp; chill, mainland safari, deep cultural dive,</em> or a mix?</p>
              </div>
            </div>
            {history.map((m, i) => (
              <div key={i} className={`planner__msg planner__msg--${m.role === 'user' ? 'user' : 'bot'}`}>
                <div className="planner__bubble">{renderFormattedText(m.content)}</div>
              </div>
            ))}
            {sending && (
              <div className="planner__msg planner__msg--bot planner__msg--typing">
                <div className="planner__bubble">
                  <span className="planner__dot"></span>
                  <span className="planner__dot"></span>
                  <span className="planner__dot"></span>
                </div>
              </div>
            )}
          </div>
          <form
            className="planner__form"
            onSubmit={(e) => { e.preventDefault(); send(input.trim()); }}
          >
            <textarea
              ref={inputRef}
              className="planner__input"
              rows={1}
              placeholder="Tell me what you're dreaming of…"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input.trim());
                }
              }}
              required
            />
            <button className="planner__send" type="submit" aria-label="Send" disabled={sending || !input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
          <footer className="planner__foot">
            <span>Itineraries are drafts. A human reviews and prices everything before you book.</span>
            <a className="planner__handoff" href="#contact">Send draft to the team →</a>
          </footer>
        </div>
      </div>
    </section>
  );
}

/* ============ NETLIFY FORMS HELPER ============ */
const encodeForm = (data) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');

async function postNetlifyForm(formName, fields) {
  return fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeForm({ 'form-name': formName, ...fields }),
  });
}

/* ============ NEWSLETTER ============ */
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pending || done) return;
    setPending(true);
    setError(false);
    try {
      const res = await postNetlifyForm('newsletter', { email });
      if (!res.ok) throw new Error('newsletter-submit-failed');
      setDone(true);
      setEmail('');
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="newsletter reveal" id="newsletter">
      <div>
        <span className="newsletter__eyebrow">Stay in the loop</span>
        <h3 className="newsletter__title">Sea stories and sunsets, every month</h3>
        <p className="newsletter__desc">Hand-written notes from the team — trip openings, shoulder-season deals, and the occasional spice recipe. One email a month. Never anything else.</p>
      </div>
      <form
        className="newsletter__form"
        name="newsletter"
        method="POST"
        data-netlify="true"
        onSubmit={onSubmit}
      >
        <input type="hidden" name="form-name" value="newsletter" />
        <input
          className="newsletter__input"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={done ? "✓ You're on the list" : 'you@example.com'}
          required={!done}
          disabled={done}
        />
        <button type="submit" className="newsletter__submit" disabled={pending || done}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 4h16v16H4z" /><path d="M4 6l8 7 8-7" />
          </svg>
          <span>{done ? 'Sent' : pending ? 'Sending…' : 'Subscribe'}</span>
        </button>
      </form>
      {error && (
        <p className="newsletter__note newsletter__note--error" role="status">
          That did not go through. Please try again in a moment.
        </p>
      )}
    </section>
  );
}

/* ============ CONTACT ============ */
function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const update = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    setStatus('sending');
    try {
      const res = await postNetlifyForm('contact', form);
      if (!res.ok) throw new Error('http');
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="contact reveal" id="contact">
      <header className="contact__head">
        <span className="section-eyebrow">Get in touch</span>
        <h2 className="section-title">Send us an email</h2>
        <p className="section-lead">Tell us about the trip you're dreaming of — group size, rough dates, what you're hoping to see. We'll come back to you within a day with ideas, dates, and a price.</p>
      </header>

      <div className="contact__grid">
        <aside className="contact__details">
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email
            </span>
            <a className="contact__detail-value" href="mailto:info@yournexttriptoparadise.com">info@yournexttriptoparadise.com</a>
          </div>
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Phone
            </span>
            <a className="contact__detail-value" href="tel:+255768779517">+255 768 779 517</a>
            <a className="contact__detail-value" href="tel:+255748352657">+255 748 352 657</a>
          </div>
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
              </svg>
              WhatsApp
            </span>
            <a className="contact__detail-value" href="https://wa.me/message/YCOQDKJSDMXFD1" target="_blank" rel="noreferrer">Message us on WhatsApp</a>
          </div>
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Find us
            </span>
            <span className="contact__detail-value">Zanzibar, Tanzania</span>
          </div>
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Hours
            </span>
            <span className="contact__detail-value">Daily · 8:00 – 19:00 EAT</span>
          </div>
        </aside>

        <form
          className="contact__form"
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={onSubmit}
        >
          <input type="hidden" name="form-name" value="contact" />
          <p hidden><label>Don't fill this out: <input name="bot-field" onChange={() => {}} /></label></p>

          <div className="contact__row">
            <label className="contact__field">
              <span>Your name</span>
              <input type="text" name="name" required value={form.name} onChange={update('name')} />
            </label>
            <label className="contact__field">
              <span>Email</span>
              <input type="email" name="email" required value={form.email} onChange={update('email')} />
            </label>
          </div>
          <label className="contact__field">
            <span>Subject</span>
            <input type="text" name="subject" placeholder="Trip dates, group size, anything specific" value={form.subject} onChange={update('subject')} />
          </label>
          <label className="contact__field">
            <span>Message</span>
            <textarea name="message" rows={5} required value={form.message} onChange={update('message')} />
          </label>

          {status === 'sent' && (
            <p className="contact__status contact__status--ok">✓ Asante — we got it. We'll come back to you within a day.</p>
          )}
          {status === 'error' && (
            <p className="contact__status contact__status--err">Pole sana — that didn't go through. Email us directly at info@yournexttriptoparadise.com or try again.</p>
          )}

          <button
            type="submit"
            className="btn contact__submit"
            disabled={status === 'sending' || status === 'sent'}
          >
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent' : 'Send message'}
            <ArrowIcon size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}
