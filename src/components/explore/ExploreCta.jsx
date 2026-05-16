import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXPLORE_CTA_IMAGE } from '../../data/explorePageContent.js';

export default function ExploreCta() {
  const { t } = useTranslation('explore');
  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage src={EXPLORE_CTA_IMAGE} alt="" /></div>
      <div className="exc-cta__inner">
        <h2>{t('cta.title')}</h2>
        <p>{t('cta.text')}</p>
        <div className="exc-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/booking">{t('cta.get_quote')}</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">{t('cta.plan_ai')}</Link>
        </div>
      </div>
    </section>
  );
}
