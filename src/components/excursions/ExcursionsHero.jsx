import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { CATEGORIES, EXCURSIONS } from '../../data/excursionsData.js';
import { EXCURSIONS_HERO_IMAGE, MIN_EXCURSION_PRICE } from '../../data/excursionsPageContent.js';
import { useCurrency } from '../../context/useCurrency.js';

export default function ExcursionsHero() {
  const { t } = useTranslation('excursions');
  const { format } = useCurrency();
  return (
    <section className="exc-hero">
      <div className="exc-hero__bg">
        <ResponsiveImage src={EXCURSIONS_HERO_IMAGE} alt="" fetchpriority="high" loading="eager" decoding="sync" />
      </div>
      <div className="exc-hero__inner">
        <span className="exc-hero__eyebrow">{t('hero.eyebrow')}</span>
        <h1 className="exc-hero__title">{t('hero.title_prefix')} <em>{t('hero.title_em', { count: EXCURSIONS.length })}</em></h1>
        <p className="exc-hero__lead">{t('hero.lead')}</p>
        <div className="exc-hero__tags" aria-label={t('hero.tags_aria')}>
          <span>{t('hero.tag_hotel_pickup')}</span>
          <span>{t('hero.tag_private')}</span>
          <span>{t('hero.tag_local_guides')}</span>
        </div>
        <div className="exc-hero__row">
          <a className="btn btn--lg" href="#list">{t('hero.browse_all')}</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">{t('hero.build_plan')}</Link>
        </div>
        <div className="exc-hero__meta">
          <div><strong>{EXCURSIONS.length}</strong><span>{t('hero.meta_excursions')}</span></div>
          {MIN_EXCURSION_PRICE !== null && <div><strong>{format(MIN_EXCURSION_PRICE)}</strong><span>{t('hero.meta_from_per_person')}</span></div>}
          <div><strong>{CATEGORIES.length}</strong><span>{t('hero.meta_categories')}</span></div>
          <div><strong>{t('hero.meta_private_label')}</strong><span>{t('hero.meta_private_text')}</span></div>
        </div>
      </div>
    </section>
  );
}
