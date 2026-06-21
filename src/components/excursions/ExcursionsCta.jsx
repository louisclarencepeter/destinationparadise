import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXCURSIONS_CTA_IMAGE } from '../../data/excursionsPageContent.js';

export default function ExcursionsCta() {
  const { t } = useTranslation('excursions');
  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage src={EXCURSIONS_CTA_IMAGE} alt="" className="dp-drift" /></div>
      <div className="exc-cta__inner">
        <h2 className="reveal" style={{ '--reveal-index': 0 }}>{t('cta.title')}</h2>
        <p className="reveal" style={{ '--reveal-index': 1 }}>{t('cta.text')}</p>
        <div className="exc-cta__btns">
          <Link className="btn btn--lg btn--accent reveal" style={{ '--reveal-index': 2 }} to="/booking">{t('cta.get_in_touch')}</Link>
          <Link className="btn btn--ghost-light btn--lg reveal" style={{ '--reveal-index': 3 }} to="/trip-planner">{t('cta.ai_planner')}</Link>
        </div>
      </div>
    </section>
  );
}
