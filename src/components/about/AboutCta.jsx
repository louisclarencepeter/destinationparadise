import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { ABOUT_CTA_IMAGE } from '../../data/aboutPageData.js';

export default function AboutCta() {
  const { t } = useTranslation('about');

  return (
    <section className="ab-cta">
      <div className="ab-cta__bg"><ResponsiveImage src={ABOUT_CTA_IMAGE} alt="" loading="lazy" /></div>
      <div className="ab-cta__inner">
        <span className="ab-story__eyebrow ab-cta__eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('cta.eyebrow', { defaultValue: 'Karibu' })}</span>
        <h2 className="reveal" style={{ '--reveal-index': 1 }}>{t('cta.title_prefix', { defaultValue: 'Welcome to' })} <em>{t('cta.title_em', { defaultValue: 'Destination Paradise' })}</em>{t('cta.title_suffix', { defaultValue: '.' })}</h2>
        <p className="reveal" style={{ '--reveal-index': 2 }}>{t('cta.text', { defaultValue: 'To everyone who supported this journey from the beginning — thank you. And to everyone joining us now: the vision is big, the journey is long, and we are so glad you are here at the start.' })}</p>
        <div className="ab-cta__btns reveal" style={{ '--reveal-index': 3 }}>
          <Link className="btn btn--lg btn--accent" to="/booking">{t('cta.booking', { defaultValue: 'Plan your journey →' })}</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/excursions">{t('cta.excursions', { defaultValue: 'See our excursions' })}</Link>
        </div>
      </div>
    </section>
  );
}
