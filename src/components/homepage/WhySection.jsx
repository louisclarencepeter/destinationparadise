import { useTranslation } from 'react-i18next';

export default function WhySection() {
  const { t } = useTranslation('home');
  return (
    <section className="why" id="why">
      <div className="why__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('why.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('why.title')}</h2>
      </div>
      <div className="why__grid">
        <article className="why-card reveal" style={{ '--reveal-index': 0 }}>
          <span className="why-card__num">01</span>
          <span className="why-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </span>
          <h3 className="why-card__title">{t('why.cards.rooted.title')}</h3>
          <p className="why-card__text">{t('why.cards.rooted.text')}</p>
        </article>
        <article className="why-card reveal" style={{ '--reveal-index': 1 }}>
          <span className="why-card__num">02</span>
          <span className="why-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 4 13c0-4 3-9 9-11 0 6 0 10-2 14-1 2-3 4-5 5z" transform="translate(2 0)" />
              <path d="M2 22c4-4 7-6 12-8" />
            </svg>
          </span>
          <h3 className="why-card__title">{t('why.cards.group_or_private.title')}</h3>
          <p className="why-card__text">{t('why.cards.group_or_private.text')}</p>
        </article>
        <article className="why-card reveal" style={{ '--reveal-index': 2 }}>
          <span className="why-card__num">03</span>
          <span className="why-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.2.6-.6.5-1.1z" /></svg>
          </span>
          <h3 className="why-card__title">{t('why.cards.handled.title')}</h3>
          <p className="why-card__text">{t('why.cards.handled.text')}</p>
        </article>
      </div>
    </section>
  );
}
