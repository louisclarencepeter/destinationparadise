import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ExploreCta from '../components/explore/ExploreCta.jsx';
import ExploreDoorways from '../components/explore/ExploreDoorways.jsx';
import ExploreHero from '../components/explore/ExploreHero.jsx';
import ExploreHub from '../components/explore/ExploreHub.jsx';
import ExplorePaths from '../components/explore/ExplorePaths.jsx';
import MapSection from '../components/homepage/MapSection.jsx';
import { buildLocalizedExploreContent, plannerHrefForHub } from '../data/explorePageContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

export default function Explore() {
  const { t, ready } = useTranslation('explore');
  const location = useLocation();
  const pageRef = useRef(null);
  const [activePin, setActivePin] = useState('stone-town');
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
  const { pins, hubs, paths } = useMemo(() => buildLocalizedExploreContent(t), [t]);

  const { islandPins, mainlandPins } = useMemo(() => ({
    islandPins: pins.filter((pin) => pin.region === 'Zanzibar'),
    mainlandPins: pins.filter((pin) => pin.region === 'Mainland'),
  }), [pins]);

  const activeHub = hubs[activePin] || hubs['stone-town'];
  const activeHubPlannerHref = plannerHrefForHub(activeHub);

  usePageMeta(t('page_title'), t('page_description'));
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', ready ? 1 : 0, 0.08);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event.detail?.theme) setTheme(event.detail.theme);
    };
    window.addEventListener('dp-theme-change', handleThemeChange);
    return () => window.removeEventListener('dp-theme-change', handleThemeChange);
  }, []);

  useEffect(() => {
    if (!ready || !location.hash) return undefined;
    const timeout = window.setTimeout(() => {
      const target = document.getElementById(location.hash.slice(1));
      if (!target) return;

      target.classList.add('is-visible');
      target.style.opacity = '1';
      target.style.transform = 'none';
      const top = target.getBoundingClientRect().top + document.documentElement.scrollTop;
      document.documentElement.scrollTop = top;
      document.body.scrollTop = top;
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [ready, location.hash]);

  if (!ready) return null;

  return (
    <main className="explore-page" ref={pageRef}>
      <ExploreHero />

      <MapSection
        tweaks={{ theme }}
        PINS={pins}
        activePin={activePin}
        setActivePin={setActivePin}
        islandPins={islandPins}
        mainlandPins={mainlandPins}
        ctaHref={activeHubPlannerHref}
        ctaLabel={t('map.cta_label')}
      />

      <ExploreHub hub={activeHub} plannerHref={activeHubPlannerHref} />
      <ExploreDoorways />
      <ExplorePaths paths={paths} />
      <ExploreCta />
    </main>
  );
}
