import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import ExperienceCard from '../components/store/ExperienceCard.jsx';
import GuestPicker from '../components/store/GuestPicker.jsx';
import { STORE_GUESTS_KEY } from '../components/store/BookingPanel.jsx';
import { ArrowRightIcon } from '../components/store/StoreIcons.jsx';
import { getStoreCards } from '../data/commerceCatalog.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/store.css';

const HERO_IMAGE = '/assets/images/excursions/dream-dhow-sunset.webp';

// Store landing page: hero with search, filter chips, experience grid.
// Phase 1 (feature-flagged): fixture catalog, noindex until the pilot launches.
export default function ExperiencesStore() {
  const { t, i18n, ready } = useTranslation('store');
  const pageRef = useRef(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [guests, setGuests] = useState(() => {
    try {
      return Number(window.sessionStorage.getItem(STORE_GUESTS_KEY)) || 2;
    } catch {
      return 2;
    }
  });

  usePageMeta({
    title: 'Experiences Store · Destination Paradise',
    description:
      'Browse Zanzibar experiences, pick a date and time for each one, and pay once for the whole trip. Instant booking for selected excursions.',
    // Pre-launch: keep the store out of the index until the pilot goes live.
    noindex: true,
  });

  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', ready ? i18n.resolvedLanguage : 'loading');

  const cards = useMemo(() => getStoreCards(), []);
  const visibleCards = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cards.filter(
      (card) =>
        (filter === 'all' || card.kind === filter) &&
        (needle === '' || `${card.title} ${card.blurb}`.toLowerCase().includes(needle)),
    );
  }, [cards, filter, query]);

  const updateGuests = (next) => {
    setGuests(next);
    try {
      window.sessionStorage.setItem(STORE_GUESTS_KEY, String(next));
    } catch {
      // session storage unavailable — the booking panel falls back to 2
    }
  };

  const scrollToGrid = (event) => {
    event.preventDefault();
    document.getElementById('store-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!ready) return null;

  const filters = [
    { key: 'all', label: t('list.filter_all') },
    { key: 'instant', label: t('list.filter_instant'), dot: 'instant' },
    { key: 'request', label: t('list.filter_request'), dot: 'request' },
  ];

  return (
    <main className="store-page" ref={pageRef}>
      <section className="store-hero">
        <div className="store-hero__bg">
          <ResponsiveImage className="dp-drift" src={HERO_IMAGE} alt="" fetchPriority="high" />
          <div className="store-hero__scrim" aria-hidden="true" />
        </div>
        <div className="store-hero__inner">
          <span className="store-hero__eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('hero.eyebrow')}</span>
          <h1 className="store-hero__title reveal" style={{ '--reveal-index': 1 }}>{t('hero.title')}</h1>
          <p className="store-hero__lead reveal" style={{ '--reveal-index': 2 }}>{t('hero.lead')}</p>

          <form className="store-search reveal" style={{ '--reveal-index': 3 }} onSubmit={scrollToGrid}>
            <div className="store-search__field store-search__field--grow">
              <label className="store-search__label" htmlFor="store-search-q">{t('hero.search_label')}</label>
              <input
                id="store-search-q"
                type="search"
                value={query}
                placeholder={t('hero.search_placeholder')}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="store-search__divider" aria-hidden="true" />
            <div className="store-search__field">
              <span className="store-search__label" id="store-search-guests">{t('hero.guests_label')}</span>
              <GuestPicker value={guests} min={1} max={12} onChange={updateGuests} size="sm" />
            </div>
            <button type="submit" className="store-search__submit">
              {t('hero.search_cta')}
              <ArrowRightIcon size={17} />
            </button>
          </form>
        </div>
      </section>

      <section className="store-catalog" id="store-grid">
        <div className="store-catalog__head">
          <div>
            <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('list.eyebrow')}</span>
            <h2 className="store-catalog__title reveal" style={{ '--reveal-index': 1 }}>{t('list.title')}</h2>
          </div>
          <p className="store-catalog__lead reveal" style={{ '--reveal-index': 2 }}>{t('list.lead')}</p>
        </div>

        <div className="store-chips">
          {filters.map((entry) => (
            <button
              key={entry.key}
              type="button"
              className={`store-chips__chip${filter === entry.key ? ' is-active' : ''}`}
              aria-pressed={filter === entry.key}
              onClick={() => setFilter(entry.key)}
            >
              {entry.dot && <span className={`store-chips__dot store-chips__dot--${entry.dot}`} aria-hidden="true" />}
              {entry.label}
            </button>
          ))}
          <span className="store-chips__count" aria-live="polite">
            {t('list.count', { count: visibleCards.length })}
          </span>
        </div>

        {visibleCards.length === 0 ? (
          <p className="store-catalog__empty">{t('list.empty')}</p>
        ) : (
          <div className="store-grid">
            {visibleCards.map((card) => (
              <ExperienceCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
