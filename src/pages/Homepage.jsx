import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import { EXCURSIONS } from '../data/excursionsData.js';
import { DESTINATION_MAP_PINS } from '../data/destinationMapPins.js';
import DeferredMount from '../components/DeferredMount.jsx';
import HeroSection from '../components/homepage/HeroSection.jsx';
import ExcursionsSection from '../components/homepage/ExcursionsSection.jsx';
import SafarisSection from '../components/homepage/SafarisSection.jsx';
import PackagesSection from '../components/homepage/PackagesSection.jsx';
import WhySection from '../components/homepage/WhySection.jsx';
import WeatherSection from '../components/homepage/WeatherSection.jsx';
import GallerySection from '../components/homepage/GallerySection.jsx';
import TestimonialsSection from '../components/homepage/TestimonialsSection.jsx';

const MapSection = lazy(() => import('../components/homepage/MapSection.jsx'));
const PlannerSection = lazy(() => import('../components/homepage/PlannerSection.jsx'));
import ContactSection from '../components/homepage/ContactSection.jsx';
import NewsletterSection from '../components/homepage/NewsletterSection.jsx';
import { readStoredTheme, readStoredThemeMode, readStoredTweaks } from '../utils/theme.js';

const PINS = DESTINATION_MAP_PINS;

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

const TWEAKS_DEFAULTS = { hero: 'photo', layout: '3up', theme: 'light', themeMode: 'auto' };
const BEST_SELLING_EXCURSION_IDS = ['safari-blue', 'mnemba', 'spice-tour'];

function loadTweaks() {
  const theme = readStoredTheme();
  const themeMode = readStoredThemeMode();
  const saved = readStoredTweaks();
  if (saved) return { ...TWEAKS_DEFAULTS, ...saved, theme, themeMode };
  return { ...TWEAKS_DEFAULTS, theme, themeMode };
}

export default function Homepage() {
  const [tweaks, setTweaks] = useState(loadTweaks);
  const [activePin, setActivePin] = useState('stone-town');
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaksGearVisible, setTweaksGearVisible] = useState(false);
  const [plannerPrompt, setPlannerPrompt] = useState(null);

  useEffect(() => {
    document.title = 'Destination Paradise · Zanzibar & Tanzania Tours';
  }, []);

  // Persist design-preview tweaks. The active theme is managed globally.
  useEffect(() => {
    try { localStorage.setItem('dp_tweaks', JSON.stringify(tweaks)); } catch (e) { /* noop */ }
  }, [tweaks]);

  useEffect(() => {
    const onThemeChange = (event) => {
      const theme = event.detail?.theme;
      const themeMode = event.detail?.mode;
      if (theme) {
        setTweaks((current) => (
          current.theme === theme && (!themeMode || current.themeMode === themeMode)
            ? current
            : { ...current, theme, ...(themeMode ? { themeMode } : {}) }
        ));
      }
    };
    window.addEventListener('dp-theme-change', onThemeChange);
    return () => window.removeEventListener('dp-theme-change', onThemeChange);
  }, []);

  // Reveal-on-scroll
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    const observeReveal = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches('.reveal:not(.is-visible)')) io.observe(node);
      node.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => io.observe(el));
    };

    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => io.observe(el));

    const root = document.getElementById('root') || document.body;
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(observeReveal);
      });
    });
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      io.disconnect();
    };
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

  const bestSellingExcursions = BEST_SELLING_EXCURSION_IDS
    .map((id) => EXCURSIONS.find((trip) => trip.id === id))
    .filter(Boolean);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    const readStringField = (name, fallback = '') => {
      const value = fields.get(name);
      return typeof value === 'string' && value.trim() ? value : fallback;
    };

    const excursion = readStringField('excursion', 'Any package, excursion, or safari');
    const date = readStringField('date', '');
    const guests = readStringField('guests', '2 guests');
    const genericSelections = new Set(['Any experience', 'Any trip or safari', 'Any package, excursion, or safari']);
    const experienceText = genericSelections.has(excursion)
      ? 'a recommended Zanzibar package, excursion, or Tanzania safari'
      : excursion;
    const dateText = date ? ` on ${date}` : ' on flexible dates';

    setPlannerPrompt({
      id: Date.now(),
      text: `I'm looking for ${experienceText}${dateText} for ${guests}. Can you suggest the best fit and ask me anything else you need?`,
    });
    const target = document.getElementById('planner-chat') || document.getElementById('planner');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const islandPins = PINS.filter((p) => p.region === 'Zanzibar');
  const mainlandPins = PINS.filter((p) => p.region === 'Mainland');

  return (
    <>
      <HeroSection tweaks={tweaks} handleHeroSearch={handleHeroSearch} />
      <ExcursionsSection tweaks={tweaks} excursions={bestSellingExcursions} />
      <SafarisSection />
      <PackagesSection />
      <DeferredMount minHeight="640px">
        <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
          <PlannerSection initialPrompt={plannerPrompt} />
        </Suspense>
      </DeferredMount>
      <WhySection />
      <DeferredMount minHeight="520px">
        <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
          <MapSection
            tweaks={tweaks}
            PINS={PINS}
            activePin={activePin}
            setActivePin={setActivePin}
            islandPins={islandPins}
            mainlandPins={mainlandPins}
            ctaHref="/explore"
            ctaLabel="Explore the full map"
          />
        </Suspense>
      </DeferredMount>
      <WeatherSection MONTHS={MONTHS} SCORES={SCORES} NOW_MONTH={NOW_MONTH} />
      <GallerySection />
      <TestimonialsSection />
      <ContactSection />
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
