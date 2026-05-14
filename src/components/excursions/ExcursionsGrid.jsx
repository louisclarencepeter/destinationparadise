import { Link } from 'react-router-dom';
import {
  EXCURSION_BATCH_COUNT,
  EXCURSION_FILTERS,
  INITIAL_EXCURSION_COUNT,
  categoryToSlug,
} from '../../data/excursionsPageContent.js';

export default function ExcursionsGrid({
  filter,
  setFilter,
  visible,
  filteredExcursions,
  visibleCount,
  setVisibleCount,
  hasHiddenExcursions,
}) {
  return (
    <section className="exc-grid-wrap" id="list">
      <header className="exc-list__head">
        <span className="section-eyebrow">Wybrane wycieczki</span>
        <h2 className="section-title">Wycieczki - wybierz punkt startowy.</h2>
        <p className="section-lead">Każda karta prowadzi do pełnego planu dnia, zakresu, odbioru i notatek rezerwacyjnych. Filtruj po tym, czego szukasz na wyspie.</p>
      </header>

      <div className="exc-filter">
        <span className="exc-filter__label">Filtruj</span>
        {EXCURSION_FILTERS.map((f) => (
          <button
            key={f.cat}
            type="button"
            data-cat={f.cat === 'all' ? 'all' : categoryToSlug(f.cat)}
            className={`exc-filter__btn${filter === f.cat ? ' is-active' : ''}`}
            onClick={() => setFilter(f.cat)}
            aria-pressed={filter === f.cat}
          >
            {f.label} <span className="exc-filter__count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="exc-grid">
        {visible.map((e) => (
          <Link
            key={e.id}
            to={`/excursions/${e.id}`}
            className="exc-card reveal"
            data-cat={categoryToSlug(e.category)}
            aria-label={`Zobacz ${e.title}`}
          >
            <div className={`exc-card__img${e.imageNeeded ? ' exc-card__img--placeholder' : ''}`} data-cat={categoryToSlug(e.category)}>
              <img src={e.image} alt={e.imageNeeded ? '' : e.alt || e.title} loading="lazy" />
              <span className="exc-card__cat" data-cat={categoryToSlug(e.category)}>{e.categoryLabel || e.category}</span>
              {e.season && <span className="exc-card__season">Sezonowo · {e.season}</span>}
            </div>
            <div className="exc-card__body">
              {e.eyebrow && <span className="exc-card__eyebrow">{e.eyebrow}</span>}
              <h3 className="exc-card__title">{e.title}</h3>
              <p className="exc-card__desc">{e.description}</p>
              <div className="exc-card__meta">
                {e.duration && (
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {e.duration}
                  </span>
                )}
                {e.from && (
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {e.from}
                  </span>
                )}
              </div>
              <div className="exc-card__foot">
                {typeof e.price === 'number' ? (
                  <span className="exc-card__price">Od <strong>${e.price}</strong>{e.priceSub ? ` ${e.priceSub}` : ' za osobę'}</span>
                ) : (
                  <span className="exc-card__price exc-card__price--tbd">Cena na zapytanie</span>
                )}
                <span className="exc-card__cta">Zobacz →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="exc-grid__empty">Nie ma jeszcze wycieczek w tej kategorii. Spróbuj wybrać wszystkie.</p>
      )}
      {filteredExcursions.length > INITIAL_EXCURSION_COUNT && (
        <div className="exc-grid__actions">
          {hasHiddenExcursions ? (
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() => setVisibleCount((count) => Math.min(count + EXCURSION_BATCH_COUNT, filteredExcursions.length))}
            >
              Pokaż więcej wycieczek
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() => {
                setVisibleCount(INITIAL_EXCURSION_COUNT);
                document.getElementById('list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Pokaż mniej wycieczek
            </button>
          )}
          <span>Pokazano {Math.min(visibleCount, filteredExcursions.length)} z {filteredExcursions.length}</span>
        </div>
      )}
    </section>
  );
}
