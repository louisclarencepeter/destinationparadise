import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXCURSIONS } from '../../data/excursionsData.js';
import { destinationParadisePackages } from '../../data/destinationParadisePackages.js';
import { destinationParadiseSafariPricing } from '../../data/safariPricing.js';
import { EXPLORE_HERO_IMAGE, MIN_PACKAGE_PRICE } from '../../data/explorePageContent.js';
import { useCurrency } from '../../context/useCurrency.js';

export default function ExploreHero() {
  const { t } = useTranslation('explore');
  const { format } = useCurrency();
  return (
    <section className="exc-hero explore-hero">
      <div className="exc-hero__bg">
        <ResponsiveImage src={EXPLORE_HERO_IMAGE} alt="" fetchpriority="high" loading="eager" decoding="sync" />
      </div>
      <div className="exc-hero__inner">
        <span className="exc-hero__eyebrow">{t('hero.eyebrow')}</span>
        <h1 className="exc-hero__title">{t('hero.title_prefix')} <em>{t('hero.title_em')}</em></h1>
        <p className="exc-hero__lead">{t('hero.lead')}</p>
        <div className="exc-hero__row">
          <a className="btn btn--lg" href="#paths">{t('hero.choose_path')}</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">{t('hero.plan_ai')}</Link>
        </div>
        <div className="exc-hero__meta">
          <div><strong>{destinationParadisePackages.length}</strong><span>{t('hero.stat_packages')}</span></div>
          <div><strong>{destinationParadiseSafariPricing.length}</strong><span>{t('hero.stat_core_safaris')}</span></div>
          <div><strong>{EXCURSIONS.length}</strong><span>{t('hero.stat_excursions')}</span></div>
          <div><strong>{format(MIN_PACKAGE_PRICE)}</strong><span>{t('hero.stat_package_from')}</span></div>
        </div>
      </div>
    </section>
  );
}
