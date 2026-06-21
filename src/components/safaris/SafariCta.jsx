import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { safariImg } from '../../data/safarisPageContent.js';

export default function SafariCta() {
  const { t } = useTranslation('safaris');
  return (
    <section className="saf-cta">
      <div className="saf-cta__bg">
        <ResponsiveImage className="dp-drift" src={safariImg('lioness-and-cub-resting.webp')} alt="" />
      </div>
      <div className="saf-cta__inner">
        <h2 className="reveal" style={{ '--reveal-index': 0 }}>{t('cta.title')}</h2>
        <p className="reveal" style={{ '--reveal-index': 1 }}>{t('cta.text')}</p>
        <div className="saf-cta__btns">
          <Link className="btn btn--lg btn--accent reveal" style={{ '--reveal-index': 0 }} to="/booking">{t('cta.get_quote')}</Link>
          <Link className="btn btn--ghost-light btn--lg reveal" style={{ '--reveal-index': 1 }} to="/trip-planner">{t('cta.ai_planner')}</Link>
        </div>
      </div>
    </section>
  );
}
