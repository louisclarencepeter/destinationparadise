import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { safariImg } from '../../data/safarisPageContent.js';

export default function SafariHero({ safariCount, minSafariPrice }) {
  const { t } = useTranslation('safaris');
  return (
    <section className="saf-hero">
      <div className="saf-hero__bg">
        <ResponsiveImage src={safariImg('male-lion-in-grass.webp')} alt="" />
      </div>
      <div className="saf-hero__inner">
        <span className="saf-hero__eyebrow">{t('hero.eyebrow')}</span>
        <h1 className="saf-hero__title">
          {t('hero.title_prefix')}{' '}
          <em>{t('hero.title_em')}</em>{' '}
          <span className="saf-hero__title-tail">{t('hero.title_suffix')}</span>
        </h1>
        <p className="saf-hero__lead">
          {t('hero.lead')}
        </p>
        <div className="saf-hero__cta">
          <a className="btn btn--lg" href="#itineraries">{t('hero.browse_all')}</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">{t('hero.plan_ai')}</Link>
        </div>
        <div className="saf-hero__stats">
          <div><strong>{safariCount}</strong><span>{t('hero.stat_safaris')}</span></div>
          <div><strong>2.0M</strong><span>{t('hero.stat_wildebeest')}</span></div>
          <div><strong>${minSafariPrice.toLocaleString()}</strong><span>{t('hero.stat_from')}</span></div>
          <div><strong>3</strong><span>{t('hero.stat_circuits')}</span></div>
        </div>
      </div>
    </section>
  );
}
