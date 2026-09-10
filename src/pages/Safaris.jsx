import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SafariBookingSteps from '../components/safaris/SafariBookingSteps.jsx';
import SafariComparison from '../components/safaris/SafariComparison.jsx';
import SafariCta from '../components/safaris/SafariCta.jsx';
import SafariFaq from '../components/safaris/SafariFaq.jsx';
import SafariHero from '../components/safaris/SafariHero.jsx';
import SafariIncluded from '../components/safaris/SafariIncluded.jsx';
import SafariIntro from '../components/safaris/SafariIntro.jsx';
import SafariItineraries from '../components/safaris/SafariItineraries.jsx';
import SafariParks from '../components/safaris/SafariParks.jsx';
import SafariSeasons from '../components/safaris/SafariSeasons.jsx';
import SafariTypes from '../components/safaris/SafariTypes.jsx';
import SafariWildlife from '../components/safaris/SafariWildlife.jsx';
import { buildLocalizedSafariProducts } from '../data/localizedCatalog.js';
import { INITIAL_SAFARI_COUNT, SAFARI_FILTERS } from '../data/safarisPageContent.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

export default function Safaris() {
  const { t, i18n, ready } = useTranslation(['safaris', 'catalog']);
  const catalogLanguage = ready ? i18n.resolvedLanguage : '';
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_SAFARI_COUNT);
  const safariProducts = useMemo(
    () => (catalogLanguage ? buildLocalizedSafariProducts(t) : []),
    [t, catalogLanguage],
  );
  const minSafariPrice = Math.min(...safariProducts.map((itinerary) => itinerary.price).filter(Number.isFinite));
  const safariFilters = useMemo(() => SAFARI_FILTERS.map((item) => ({
    ...item,
    count: safariProducts.filter(item.match).length,
  })), [safariProducts]);

  const activeFilter = safariFilters.find((item) => item.key === filter) || safariFilters[0];
  const filteredSafaris = useMemo(
    () => safariProducts.filter(activeFilter.match),
    [activeFilter, safariProducts],
  );
  const visibleSafaris = useMemo(
    () => filteredSafaris.slice(0, visibleCount),
    [filteredSafaris, visibleCount],
  );
  const hasHiddenSafaris = visibleCount < filteredSafaris.length;

  usePageMeta({
    title: t('safaris:meta.title'),
    description: t('safaris:meta.description', { count: safariProducts.length }),
  });

  useEffect(() => {
    setVisibleCount(INITIAL_SAFARI_COUNT);
  }, [filter]);

  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', ready ? visibleSafaris : 'loading', 0.08);

  if (!ready) return null;

  return (
    <main className="safaris-page" ref={pageRef}>
      <SafariHero safariCount={safariProducts.length} minSafariPrice={minSafariPrice} />
      <SafariItineraries
        allSafaris={safariProducts}
        filteredSafaris={filteredSafaris}
        filter={filter}
        hasHiddenSafaris={hasHiddenSafaris}
        safariFilters={safariFilters}
        setFilter={setFilter}
        setVisibleCount={setVisibleCount}
        visibleCount={visibleCount}
        visibleSafaris={visibleSafaris}
      />
      <SafariComparison safariProducts={safariProducts} />
      <SafariIncluded />
      <SafariBookingSteps />
      <SafariIntro />
      <SafariParks />
      <SafariSeasons />
      <SafariTypes />
      <SafariWildlife />
      <SafariFaq />
      <SafariCta />
    </main>
  );
}
