import { useTranslation } from 'react-i18next';
import { BOOKING_STEPS } from '../../data/safarisPageContent.js';

export default function SafariBookingSteps() {
  const { t } = useTranslation('safaris');
  return (
    <section className="saf-steps" id="booking-steps">
      <header className="saf-steps__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('steps.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('steps.title')}</h2>
      </header>
      <div className="saf-steps__grid">
        {BOOKING_STEPS.map((item, i) => (
          <article className="saf-step reveal" style={{ '--reveal-index': i }} key={item.step}>
            <span>{item.step}</span>
            <h3>{t(`steps.items.${item.step}.title`, item.title)}</h3>
            <p>{t(`steps.items.${item.step}.text`, item.text)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
