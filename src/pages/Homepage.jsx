import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/homepage.css';
import { SAFARI_TRIPS } from '../data/safariAssets.js';
import { EXCURSIONS } from '../data/excursionsData.js';
import PlannerSection from '../components/homepage/PlannerSection.jsx';
import ContactSection from '../components/homepage/ContactSection.jsx';
import NewsletterSection from '../components/homepage/NewsletterSection.jsx';

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
  <PlannerSection initialPrompt={plannerPrompt} />

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

              <div className="map-list-label">Mainland safari</div>
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
