import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';

export default function BookingHero() {
  const { t } = useTranslation('booking');
  const stats = t('hero.stats', {
    returnObjects: true,
    defaultValue: [
      { value: '500+', label: 'Trips planned' },
      { value: '1,200+', label: 'Happy guests' },
      { value: '24h', label: 'Request confirmed' },
    ],
  });

  return (
    <section className="booking-hero">
      <div className="booking-hero__bg"><ResponsiveImage src="/assets/images/home/mizingani-waterfront.webp" alt="" fetchpriority="high" loading="eager" decoding="sync" /></div>
      <div className="booking-hero__inner">
        <span className="booking-hero__eyebrow">{t('hero.eyebrow', { defaultValue: 'Booking request' })}</span>
        <h1>{t('hero.title_prefix', { defaultValue: 'One form' })} <em>{t('hero.title_em', { defaultValue: 'for every trip.' })}</em></h1>
        <p>{t('hero.lead', { defaultValue: 'Packages, excursions, safaris, private transfers, custom routes, and online payment requests all start here. Tell us the shape, and our team will confirm availability, timing, and the final price.' })}</p>
        <div className="booking-hero__actions">
          <a className="btn btn--lg" href="#booking-form">{t('hero.start_request', { defaultValue: 'Start request' })}</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">{t('hero.plan_with_ai', { defaultValue: 'Plan with AI' })}</Link>
        </div>
        <div className="booking-hero__stats" aria-label={t('hero.stats_aria', { defaultValue: 'Booking trust signals' })}>
          {Array.isArray(stats) && stats.map((item) => (
            <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
