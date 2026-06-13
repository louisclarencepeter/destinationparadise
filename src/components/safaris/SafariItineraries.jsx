import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { INITIAL_SAFARI_COUNT, SAFARI_BATCH_COUNT } from '../../data/safarisPageContent.js';
import { useCurrency } from '../../context/useCurrency.js';
import { textFromTranslation } from '../../utils/translationValues.js';

export default function SafariItineraries({
  filteredSafaris,
  filter,
  hasHiddenSafaris,
  safariFilters,
  setFilter,
  setVisibleCount,
  visibleCount,
  visibleSafaris,
}) {
  const { t } = useTranslation('safaris');
  const { format } = useCurrency();
  const filterLabel = (item) => textFromTranslation(t(`filters.${item.key}`, { defaultValue: item.label }), item.label);
  const priceUnit = (sub) => (sub ? textFromTranslation(t(`price_units.${sub}`, { defaultValue: sub }), sub) : '');
  return (
    <section className="itineraries reveal" id="itineraries">
      <header className="itineraries__head">
        <span className="section-eyebrow">{t('itineraries.eyebrow')}</span>
        <h2 className="section-title">{t('itineraries.title')}</h2>
        <p className="section-lead">{t('itineraries.lead')}</p>
      </header>

      <div className="exc-filter saf-filter">
        <span className="exc-filter__label">{t('itineraries.filter_label')}</span>
        {safariFilters.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`exc-filter__btn${filter === item.key ? ' is-active' : ''}`}
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
          >
            {filterLabel(item)} <span className="exc-filter__count">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="exc-grid saf-route-grid">
        {visibleSafaris.map((itinerary) => (
          <Link
            key={itinerary.id}
            to={`/safaris/${itinerary.id}`}
            className="exc-card saf-route-card reveal"
            aria-label={t('itineraries.explore_aria', { title: itinerary.title })}
          >
            <div className="exc-card__img">
              <img src={itinerary.image} alt={itinerary.alt || itinerary.title} loading="lazy" />
              <span className="exc-card__cat">{textFromTranslation(t(`categories.${itinerary.category}`, { defaultValue: itinerary.category }), itinerary.category)}</span>
              {itinerary.feature && <span className="exc-card__season">{t('itineraries.most_popular')}</span>}
              {itinerary.productType && <span className="exc-card__season">{itinerary.productType}</span>}
            </div>
            <div className="exc-card__body">
              <span className="exc-card__eyebrow">{itinerary.rib}</span>
              <h3 className="exc-card__title">{itinerary.title}</h3>
              <p className="exc-card__desc">{itinerary.intro}</p>
              <div className="exc-card__meta">
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {itinerary.duration}
                </span>
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {itinerary.from}
                </span>
              </div>
              <div className="exc-card__foot">
                <span className="exc-card__price">{t('itineraries.card.from')} <strong>{format(itinerary.price)}</strong> {priceUnit(itinerary.priceSub)}</span>
                <span className="exc-card__cta">{t('itineraries.card.explore_cta')}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visibleSafaris.length === 0 && (
        <p className="exc-grid__empty">{t('itineraries.empty')}</p>
      )}
      {filteredSafaris.length > INITIAL_SAFARI_COUNT && (
        <div className="exc-grid__actions">
          {hasHiddenSafaris ? (
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() => setVisibleCount((count) => Math.min(count + SAFARI_BATCH_COUNT, filteredSafaris.length))}
            >
              {t('itineraries.show_more')}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() => {
                setVisibleCount(INITIAL_SAFARI_COUNT);
                document.getElementById('itineraries')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {t('itineraries.show_fewer')}
            </button>
          )}
          <span>{t('itineraries.showing_count', { visible: Math.min(visibleCount, filteredSafaris.length), total: filteredSafaris.length })}</span>
        </div>
      )}
    </section>
  );
}
