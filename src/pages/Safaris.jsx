import { useEffect, useMemo, useRef, useState } from 'react';
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
import { ALL_SAFARI_PRODUCTS } from '../data/safariPageData.js';
import { INITIAL_SAFARI_COUNT, SAFARI_FILTERS } from '../data/safarisPageContent.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

const minSafariPrice = Math.min(...ALL_SAFARI_PRODUCTS.map((itinerary) => itinerary.price));
const safariFilters = SAFARI_FILTERS.map((filter) => ({
  ...filter,
  count: ALL_SAFARI_PRODUCTS.filter(filter.match).length,
}));

export default function Safaris() {
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_SAFARI_COUNT);

  const activeFilter = safariFilters.find((item) => item.key === filter) || safariFilters[0];
  const filteredSafaris = useMemo(
    () => ALL_SAFARI_PRODUCTS.filter(activeFilter.match),
    [activeFilter],
  );
  const visibleSafaris = useMemo(
    () => filteredSafaris.slice(0, visibleCount),
    [filteredSafaris, visibleCount],
  );
  const hasHiddenSafaris = visibleCount < filteredSafaris.length;

  usePageMeta({
    title: 'Tanzania Safaris · Destination Paradise',
    description: `Tanzania safari routes and styles — Serengeti, Ngorongoro, Tarangire and beyond. ${ALL_SAFARI_PRODUCTS.length}+ itineraries from camping to luxury, with park fees, guides and full board.`,
  });

  useEffect(() => {
    setVisibleCount(INITIAL_SAFARI_COUNT);
  }, [filter]);

  useRevealOnScroll(pageRef, '.reveal', visibleSafaris, 0.08);

  return (
    <main className="safaris-page" ref={pageRef}>
      <SafariHero safariCount={ALL_SAFARI_PRODUCTS.length} minSafariPrice={minSafariPrice} />
      <SafariItineraries
        filteredSafaris={filteredSafaris}
        filter={filter}
        hasHiddenSafaris={hasHiddenSafaris}
        safariFilters={safariFilters}
        setFilter={setFilter}
        setVisibleCount={setVisibleCount}
        visibleCount={visibleCount}
        visibleSafaris={visibleSafaris}
      />
      <SafariComparison />
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
