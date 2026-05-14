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
        <span className="section-eyebrow">Proponowane trasy</span>
        <h2 className="section-title">Safari - wybierz punkt startowy.</h2>
        <p className="section-lead">Każda karta prowadzi do pełnej trasy albo doświadczenia tematycznego, z zakresem, ceną i szczegółami rezerwacji. Podaj daty, a dopasujemy campy i loty do Ciebie.</p>
      </header>

      <div className="exc-filter saf-filter">
        <span className="exc-filter__label">Filtruj</span>
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
            aria-label={`Zobacz ${itinerary.title}`}
          >
            <div className="exc-card__img">
              <img src={itinerary.image} alt={itinerary.alt || itinerary.title} loading="lazy" />
              <span className="exc-card__cat">{itinerary.categoryLabel || itinerary.category}</span>
              {itinerary.feature && <span className="exc-card__season">Najpopularniejsze</span>}
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
                <span className="exc-card__price">Od <strong>${itinerary.price.toLocaleString()}</strong> {itinerary.priceSub}</span>
                <span className="exc-card__cta">Zobacz →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visibleSafaris.length === 0 && (
        <p className="exc-grid__empty">Nie ma jeszcze safari w tym filtrze. Spróbuj wybrać wszystkie.</p>
      )}
      {filteredSafaris.length > INITIAL_SAFARI_COUNT && (
        <div className="exc-grid__actions">
          {hasHiddenSafaris ? (
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() => setVisibleCount((count) => Math.min(count + SAFARI_BATCH_COUNT, filteredSafaris.length))}
            >
              Pokaż więcej safari
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
              Pokaż mniej safari
            </button>
          )}
          <span>Pokazano {Math.min(visibleCount, filteredSafaris.length)} z {filteredSafaris.length}</span>
        </div>
      )}
    </section>
  );
}
