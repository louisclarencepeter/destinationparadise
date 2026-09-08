import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExcursionsCta from '../components/excursions/ExcursionsCta.jsx';
import ExcursionsFaq from '../components/excursions/ExcursionsFaq.jsx';
import ExcursionsGrid from '../components/excursions/ExcursionsGrid.jsx';
import ExcursionsHero from '../components/excursions/ExcursionsHero.jsx';
import ExcursionsPairings from '../components/excursions/ExcursionsPairings.jsx';
import ExcursionsPractical from '../components/excursions/ExcursionsPractical.jsx';
import {
  INITIAL_EXCURSION_COUNT,
} from '../data/excursionsPageContent.js';
import { buildLocalizedExcursions } from '../data/localizedCatalog.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/excursions.css';

export default function Excursions() {
  const { t, i18n, ready } = useTranslation(['excursions', 'catalog']);
  const catalogLanguage = ready ? i18n.resolvedLanguage : '';
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_EXCURSION_COUNT);
  const excursions = useMemo(
    () => (catalogLanguage ? buildLocalizedExcursions(t) : []),
    [t, catalogLanguage],
  );

  const filteredExcursions = useMemo(
    () => (filter === 'all' ? excursions : excursions.filter((e) => e.category === filter)),
    [excursions, filter],
  );
  const visible = useMemo(
    () => filteredExcursions.slice(0, visibleCount),
    [filteredExcursions, visibleCount],
  );
  const hasHiddenExcursions = visibleCount < filteredExcursions.length;

  useEffect(() => {
    setVisibleCount(INITIAL_EXCURSION_COUNT);
  }, [filter]);

  usePageMeta(
    t('excursions:meta.title'),
    t('excursions:meta.description', { count: excursions.length }),
  );
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', ready ? visible : 'loading', 0.08);

  if (!ready) return null;

  return (
    <main className="excursions-page" ref={pageRef}>
      <ExcursionsHero />
      <ExcursionsGrid
        allExcursions={excursions}
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
