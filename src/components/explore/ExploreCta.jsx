import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXPLORE_CTA_IMAGE } from '../../data/explorePageContent.js';

export default function ExploreCta() {
  const { t } = useTranslation('explore');
  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage className="dp-drift" src={EXPLORE_CTA_IMAGE} alt="" /></div>
      <div className="exc-cta__inner">
        <h2 className="reveal" style={{ '--reveal-index': 0 }}>{t('cta.title')}</h2>
        <p className="reveal" style={{ '--reveal-index': 1 }}>{t('cta.text')}</p>
        <div className="exc-cta__btns">
          <Link className="btn btn--lg btn--accent reveal" style={{ '--reveal-index': 2 }} to="/booking">{t('cta.get_quote')}</Link>
          <Link className="btn btn--ghost-light btn--lg reveal" style={{ '--reveal-index': 3 }} to="/trip-planner">{t('cta.plan_ai')}</Link>
        </div>
      </div>
    </section>
  );
}
