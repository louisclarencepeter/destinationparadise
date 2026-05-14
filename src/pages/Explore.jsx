import { useEffect, useMemo, useRef, useState } from 'react';
import ExploreCta from '../components/explore/ExploreCta.jsx';
import ExploreDoorways from '../components/explore/ExploreDoorways.jsx';
import ExploreHero from '../components/explore/ExploreHero.jsx';
import ExploreHub from '../components/explore/ExploreHub.jsx';
import ExplorePaths from '../components/explore/ExplorePaths.jsx';
import MapSection from '../components/homepage/MapSection.jsx';
import { DESTINATION_MAP_PINS } from '../data/destinationMapPins.js';
import { DESTINATION_HUBS, plannerHrefForHub } from '../data/explorePageContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

const PAGE_TITLE = 'Explore Zanzibar & Tanzania · Destination Paradise';
const PAGE_DESCRIPTION = 'Pick your path: full packages, day excursions, mainland safaris, or an AI trip planner. Browse Zanzibar and Tanzania destinations on the map and see how they fit together.';

export default function Explore() {
  const pageRef = useRef(null);
  const [activePin, setActivePin] = useState('stone-town');
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');

  const { islandPins, mainlandPins } = useMemo(() => ({
    islandPins: DESTINATION_MAP_PINS.filter((pin) => pin.region === 'Zanzibar'),
    mainlandPins: DESTINATION_MAP_PINS.filter((pin) => pin.region === 'Mainland'),
  }), []);

  const activeHub = DESTINATION_HUBS[activePin] || DESTINATION_HUBS['stone-town'];
  const activeHubPlannerHref = plannerHrefForHub(activeHub);

  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', 0, 0.08);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event.detail?.theme) setTheme(event.detail.theme);
    };
    window.addEventListener('dp-theme-change', handleThemeChange);
    return () => window.removeEventListener('dp-theme-change', handleThemeChange);
  }, []);

  return (
    <main className="explore-page" ref={pageRef}>
      <ExploreHero />

      <MapSection
        tweaks={{ theme }}
        PINS={DESTINATION_MAP_PINS}
        activePin={activePin}
        setActivePin={setActivePin}
        islandPins={islandPins}
        mainlandPins={mainlandPins}
        ctaHref={activeHubPlannerHref}
        ctaLabel="Build this into a trip"
      />

      <ExploreHub hub={activeHub} plannerHref={activeHubPlannerHref} />
      <ExploreDoorways />
      <ExplorePaths />
      <ExploreCta />
    </main>
  );
}
