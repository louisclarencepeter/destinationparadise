import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';

export default function BookingSupportCta() {
  const { t } = useTranslation('booking');

  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage className="dp-drift" src="/assets/images/excursions/stone-town-old-fort.webp" alt="" /></div>
      <div className="exc-cta__inner">
        <h2 className="reveal" style={{ '--reveal-index': 0 }}>{t('support_cta.title', { defaultValue: 'Need help before you send it?' })}</h2>
        <p className="reveal" style={{ '--reveal-index': 1 }}>{t('support_cta.text', { defaultValue: 'Open the planner if you want to shape the route first, or explore the full map to choose the right beach, safari circuit, and island days.' })}</p>
        <div className="exc-cta__btns reveal" style={{ '--reveal-index': 2 }}>
          <Link className="btn btn--lg btn--accent" to="/trip-planner">{t('support_cta.planner', { defaultValue: 'Plan with AI' })}</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/explore">{t('support_cta.explore', { defaultValue: 'Explore the map' })}</Link>
        </div>
      </div>
    </section>
  );
}
