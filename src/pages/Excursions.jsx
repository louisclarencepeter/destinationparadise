import { useEffect, useMemo, useRef, useState } from 'react';
import ExcursionsCta from '../components/excursions/ExcursionsCta.jsx';
import ExcursionsFaq from '../components/excursions/ExcursionsFaq.jsx';
import ExcursionsGrid from '../components/excursions/ExcursionsGrid.jsx';
import ExcursionsHero from '../components/excursions/ExcursionsHero.jsx';
import ExcursionsPairings from '../components/excursions/ExcursionsPairings.jsx';
import ExcursionsPractical from '../components/excursions/ExcursionsPractical.jsx';
import { EXCURSIONS } from '../data/excursionsData.js';
import {
  EXCURSION_PAGE_CARDS,
  INITIAL_EXCURSION_COUNT,
} from '../data/excursionsPageContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/excursions.css';

const PAGE_TITLE = 'Zanzibar Excursions · Day Trips & Tours · Destination Paradise';
const PAGE_DESCRIPTION = `${EXCURSIONS.length} handpicked Zanzibar excursions — dhow sails, Stone Town walks, Mnemba snorkel, Jozani Forest, kitesurfing, festivals and more. Hotel pickup, small groups, local guides.`;

export default function Excursions() {
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_EXCURSION_COUNT);

  const filteredExcursions = useMemo(
    () => (filter === 'all' ? EXCURSION_PAGE_CARDS : EXCURSION_PAGE_CARDS.filter((e) => e.category === filter)),
    [filter],
  );
  const visible = useMemo(
    () => filteredExcursions.slice(0, visibleCount),
    [filteredExcursions, visibleCount],
  );
  const hasHiddenExcursions = visibleCount < filteredExcursions.length;

  useEffect(() => {
    setVisibleCount(INITIAL_EXCURSION_COUNT);
  }, [filter]);

  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', visible, 0.08);

  return (
    <main className="excursions-page" ref={pageRef}>
      <ExcursionsHero />
      <ExcursionsGrid
        filter={filter}
        setFilter={setFilter}
        visible={visible}
        filteredExcursions={filteredExcursions}
        visibleCount={visibleCount}
        setVisibleCount={setVisibleCount}
        hasHiddenExcursions={hasHiddenExcursions}
      />
      <ExcursionsPairings />
      <ExcursionsPractical />
      <ExcursionsFaq />
      <ExcursionsCta />
    </main>
  );
}
