import { Link } from 'react-router-dom';
import { INITIAL_SAFARI_COUNT, SAFARI_BATCH_COUNT } from '../../data/safarisPageContent.js';

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
  return (
    <section className="itineraries reveal" id="itineraries">
      <header className="itineraries__head">
        <span className="section-eyebrow">Suggested routes</span>
        <h2 className="section-title">Safaris — pick a starting point.</h2>
        <p className="section-lead">Every card opens into the full route or specialty experience, inclusions, and booking details. Tell us your dates and we’ll re-plot the camps and flights around you.</p>
      </header>

      <div className="exc-filter saf-filter">
        <span className="exc-filter__label">Filter by</span>
        {safariFilters.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`exc-filter__btn${filter === item.key ? ' is-active' : ''}`}
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
          >
            {item.label} <span className="exc-filter__count">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="exc-grid saf-route-grid">
        {visibleSafaris.map((itinerary) => (
          <Link
            key={itinerary.id}
            to={`/safaris/${itinerary.id}`}
            className="exc-card saf-route-card reveal"
            aria-label={`Explore ${itinerary.title}`}
          >
            <div className="exc-card__img">
              <img src={itinerary.image} alt={itinerary.alt || itinerary.title} loading="lazy" />
              <span className="exc-card__cat">{itinerary.category}</span>
              {itinerary.feature && <span className="exc-card__season">Most popular</span>}
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
                <span className="exc-card__price">From <strong>${itinerary.price.toLocaleString()}</strong> {itinerary.priceSub}</span>
                <span className="exc-card__cta">Explore →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visibleSafaris.length === 0 && (
        <p className="exc-grid__empty">No safaris in this filter yet. Try All.</p>
      )}
      {filteredSafaris.length > INITIAL_SAFARI_COUNT && (
        <div className="exc-grid__actions">
          {hasHiddenSafaris ? (
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() => setVisibleCount((count) => Math.min(count + SAFARI_BATCH_COUNT, filteredSafaris.length))}
            >
              Show more safaris
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
              Show fewer safaris
            </button>
          )}
          <span>{Math.min(visibleCount, filteredSafaris.length)} of {filteredSafaris.length} shown</span>
        </div>
      )}
    </section>
  );
}
