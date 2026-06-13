import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowIcon } from './Icons.jsx';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { useCurrency } from '../../context/useCurrency.js';
import { objectFromTranslation } from '../../utils/translationValues.js';

export default function ExcursionsSection({ tweaks, excursions }) {
  const { t } = useTranslation('home');
  const { format } = useCurrency();
  return (
    <section className="excursions reveal" id="excursions" data-layout={tweaks.layout}>
      <header className="excursions__head">
        <span className="section-eyebrow">{t('excursions.eyebrow')}</span>
        <h2 className="section-title">{t('excursions.title')}</h2>
        <p className="section-lead">{t('excursions.lead')}</p>
        <ul className="excursions__modes">
          <li><span className="excursions__mode-tag">{t('excursions.modes.ocean_tag')}</span> {t('excursions.modes.ocean_text')}</li>
          <li><span className="excursions__mode-tag excursions__mode-tag--accent">{t('excursions.modes.culture_tag')}</span> {t('excursions.modes.culture_text')}</li>
          <li><span className="excursions__mode-tag">{t('excursions.modes.nature_tag')}</span> {t('excursions.modes.nature_text')}</li>
        </ul>
      </header>
      <div className="excursions__grid">
        {excursions.map((tr) => {
          const localized = objectFromTranslation(t(`excursions.featured.${tr.id}`, { returnObjects: true, defaultValue: {} }), {});
          const title = localized.title || tr.title;
          const description = localized.description || tr.description;
          const duration = localized.duration || tr.duration;
          const from = localized.from || tr.from;
          const group = localized.group || tr.group;

          return (
          <Link className="ex-card" key={tr.id} to={`/excursions/${tr.id}`} aria-label={t('excursions.card.explore_aria', { title })}>
            <div className="ex-card__img">
              <ResponsiveImage src={tr.image} alt={title} loading="lazy" decoding="async" sizes="(max-width: 600px) 220px, (max-width: 1000px) 45vw, 360px" />
              <span className="ex-card__badge">{duration}</span>
              {typeof tr.price === 'number' && (
                <div className="ex-card__price">
                  <div className="ex-card__price-from">{t('excursions.card.from')}</div>
                  <div className="ex-card__price-num">{format(tr.price)}</div>
                </div>
              )}
            </div>
            <div className="ex-card__body">
              <div className="ex-card__meta">
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" />
                  </svg> {from}
                </span>
                <span className="dot"></span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg> {group}
                </span>
              </div>
              <h3 className="ex-card__title">{title}</h3>
              <p className="ex-card__text">{description}</p>
              <span className="ex-card__link">{t('excursions.card.view_details')} <ArrowIcon size={15} /></span>
            </div>
          </Link>
          );
        })}
      </div>
      <div className="excursions__more">
        <Link className="btn btn--on-light" to="/excursions">{t('excursions.view_all')} <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
