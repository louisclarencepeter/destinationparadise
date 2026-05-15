import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('excursions');
  const filterLabel = (cat) => (cat === 'all' ? t('grid.filter_all') : t(`categories.${cat}`, cat));
  const priceUnit = (sub) => (sub ? t(`price_units.${sub}`, sub) : t('grid.per_person_default'));
  return (
    <section className="exc-grid-wrap" id="list">
      <header className="exc-list__head">
        <span className="section-eyebrow">{t('grid.eyebrow')}</span>
        <h2 className="section-title">{t('grid.title')}</h2>
        <p className="section-lead">{t('grid.lead')}</p>
      </header>

      <div className="exc-filter">
        <span className="exc-filter__label">{t('grid.filter_label')}</span>
        {EXCURSION_FILTERS.map((f) => (
          <button
            key={f.cat}
            type="button"
            data-cat={f.cat === 'all' ? 'all' : categoryToSlug(f.cat)}
            className={`exc-filter__btn${filter === f.cat ? ' is-active' : ''}`}
            onClick={() => setFilter(f.cat)}
            aria-pressed={filter === f.cat}
          >
            {filterLabel(f.cat)} <span className="exc-filter__count">{f.count}</span>
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
            aria-label={t('grid.explore_aria', { title: e.title })}
          >
            <div className={`exc-card__img${e.imageNeeded ? ' exc-card__img--placeholder' : ''}`} data-cat={categoryToSlug(e.category)}>
              <img src={e.image} alt={e.imageNeeded ? '' : e.alt || e.title} loading="lazy" />
              <span className="exc-card__cat" data-cat={categoryToSlug(e.category)}>{t(`categories.${e.category}`, e.category)}</span>
              {e.season && <span className="exc-card__season">{t('grid.season_prefix')} · {e.season}</span>}
            </div>
            <div className="exc-card__body">
              {e.eyebrow && <span className="exc-card__eyebrow">{e.eyebrow}</span>}
              <h3 className="exc-card__title">{e.title}</h3>
              <p className="exc-card__desc">{e.description}</p>
              <div className="exc-card__meta">
                {e.duration && (
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {t(`durations.${e.duration}`, e.duration)}
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
                  <span className="exc-card__price">{t('grid.from')} <strong>${e.price}</strong>{` ${priceUnit(e.priceSub)}`}</span>
                ) : (
                  <span className="exc-card__price exc-card__price--tbd">{t('grid.price_on_request')}</span>
                )}
                <span className="exc-card__cta">{t('grid.explore_cta')}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="exc-grid__empty">{t('grid.empty')}</p>
      )}
      {filteredExcursions.length > INITIAL_EXCURSION_COUNT && (
        <div className="exc-grid__actions">
          {hasHiddenExcursions ? (
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() => setVisibleCount((count) => Math.min(count + EXCURSION_BATCH_COUNT, filteredExcursions.length))}
            >
              {t('grid.show_more')}
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
              {t('grid.show_fewer')}
            </button>
          )}
          <span>{t('grid.showing_count', { visible: Math.min(visibleCount, filteredExcursions.length), total: filteredExcursions.length })}</span>
        </div>
      )}
    </section>
  );
}
