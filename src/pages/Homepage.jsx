import { useEffect, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/homepage.css';
import DeferredMount from '../components/DeferredMount.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import HeroSection from '../components/homepage/HeroSection.jsx';
import SectionCompass from '../components/homepage/SectionCompass.jsx';

const ExcursionsSection = lazy(() => import('../components/homepage/ExcursionsSection.jsx'));
const SafarisSection = lazy(() => import('../components/homepage/SafarisSection.jsx'));
const PackagesSection = lazy(() => import('../components/homepage/PackagesSection.jsx'));
const TransfersSection = lazy(() => import('../components/homepage/TransfersSection.jsx'));
const MapSection = lazy(() => import('../components/homepage/MapSection.jsx'));
const PlannerSection = lazy(() => import('../components/homepage/PlannerSection.jsx'));
const WhySection = lazy(() => import('../components/homepage/WhySection.jsx'));
const WeatherSection = lazy(() => import('../components/homepage/WeatherSection.jsx'));
const GallerySection = lazy(() => import('../components/homepage/GallerySection.jsx'));
const TestimonialsSection = lazy(() => import('../components/homepage/TestimonialsSection.jsx'));
const AboutSection = lazy(() => import('../components/homepage/AboutSection.jsx'));
const ContactSection = lazy(() => import('../components/homepage/ContactSection.jsx'));
const NewsletterSection = lazy(() => import('../components/homepage/NewsletterSection.jsx'));
import { readStoredTheme, readStoredThemeMode, readStoredTweaks } from '../utils/theme.js';
import { preferredScrollBehavior } from '../utils/motion.js';

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
function loadTweaks() {
  const theme = readStoredTheme();
  const themeMode = readStoredThemeMode();
  const saved = readStoredTweaks();
  if (saved) return { ...TWEAKS_DEFAULTS, ...saved, theme, themeMode };
  return { ...TWEAKS_DEFAULTS, theme, themeMode };
}

export default function Homepage() {
  const { t } = useTranslation('home');
  const [tweaks, setTweaks] = useState(loadTweaks);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaksGearVisible, setTweaksGearVisible] = useState(false);
  const [plannerPrompt, setPlannerPrompt] = useState(
    /** @type {{ id: number, text: string } | null} */ (null),
  );

  usePageMeta({
    title: 'Destination Paradise · Zanzibar & Tanzania Tours',
    description:
      'Bespoke Zanzibar excursions, luxury Tanzania safaris, and complete travel packages — plus an AI trip planner and door-to-door transfers. Plan your trip to paradise.',
  });

  // Persist design-preview tweaks. The active theme is managed globally.
  useEffect(() => {
    try { localStorage.setItem('dp_tweaks', JSON.stringify(tweaks)); } catch { /* noop */ }
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

  useEffect(() => {
    if (!plannerPrompt) return undefined;

    let frameId;
    let attempts = 0;
    const scrollWhenReady = () => {
      const target = document.getElementById('planner-chat') || document.getElementById('planner');
      if (target) {
        target.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < 600) frameId = window.requestAnimationFrame(scrollWhenReady);
    };

    frameId = window.requestAnimationFrame(scrollWhenReady);
    return () => window.cancelAnimationFrame(frameId);
  }, [plannerPrompt]);

  // Reveal-on-scroll
  useEffect(() => {
    const io = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io?.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    const revealOrObserve = (element) => {
      if (io) io.observe(element);
      else {
        // Offscreen content-visibility can pause entrance animations at opacity
        // zero. The fallback exposes late sections without waiting on motion.
        element.style.animation = 'none';
        element.classList.add('is-visible');
      }
    };

    const observeReveal = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches('.reveal:not(.is-visible)')) revealOrObserve(node);
      node.querySelectorAll('.reveal:not(.is-visible)').forEach(revealOrObserve);
    };

    document.querySelectorAll('.reveal:not(.is-visible)').forEach(revealOrObserve);

    const root = document.getElementById('root') || document.body;
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(observeReveal);
      });
    });
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      io?.disconnect();
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
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch { /* noop */ }
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const setTweak = (key, val) => setTweaks((s) => ({ ...s, [key]: val }));

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
    document.querySelector('[data-deferred-anchor="planner"]')
      ?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
  };

  return (
    <>
      <main>
      <HeroSection tweaks={tweaks} handleHeroSearch={handleHeroSearch} />
      <DeferredMount anchorId="excursions" minHeight="900px">
        <Suspense fallback={<div style={{ minHeight: '900px' }} />}>
          <ExcursionsSection tweaks={tweaks} />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="safaris" minHeight="860px">
        <Suspense fallback={<div style={{ minHeight: '860px' }} />}>
          <SafarisSection />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="packages" minHeight="980px">
        <Suspense fallback={<div style={{ minHeight: '980px' }} />}>
          <PackagesSection />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="transfers" minHeight="820px">
        <Suspense fallback={<div style={{ minHeight: '820px' }} />}>
          <TransfersSection />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="planner" force={Boolean(plannerPrompt)} minHeight="640px">
        <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
          <PlannerSection initialPrompt={plannerPrompt} />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="why" minHeight="520px">
        <Suspense fallback={<div style={{ minHeight: '360px' }} />}>
          <WhySection />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="map" minHeight="520px">
        <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
          <MapSection
            tweaks={tweaks}
            ctaHref="/explore"
            ctaLabel={t('map.cta_explore_full')}
          />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="weather" minHeight="520px">
        <Suspense fallback={<div style={{ minHeight: '360px' }} />}>
          <WeatherSection MONTHS={MONTHS} SCORES={SCORES} NOW_MONTH={NOW_MONTH} />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="gallery" minHeight="520px">
        <Suspense fallback={<div style={{ minHeight: '360px' }} />}>
          <GallerySection />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="reviews" minHeight="420px">
        <Suspense fallback={<div style={{ minHeight: '320px' }} />}>
          <TestimonialsSection />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="about-intro" minHeight="520px">
        <Suspense fallback={<div style={{ minHeight: '360px' }} />}>
          <AboutSection />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="contact" minHeight="520px">
        <Suspense fallback={<div style={{ minHeight: '360px' }} />}>
          <ContactSection />
        </Suspense>
      </DeferredMount>
      <DeferredMount anchorId="newsletter" minHeight="260px">
        <Suspense fallback={<div style={{ minHeight: '220px' }} />}>
          <NewsletterSection />
        </Suspense>
      </DeferredMount>
      </main>

      <SectionCompass />

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
