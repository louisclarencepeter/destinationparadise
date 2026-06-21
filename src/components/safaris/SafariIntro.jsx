import { useTranslation } from 'react-i18next';

export default function SafariIntro() {
  const { t } = useTranslation('safaris');
  return (
    <section className="saf-intro">
      <div className="saf-intro__grid">
        <div className="saf-intro__copy">
          <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('intro.eyebrow')}</span>
          <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('intro.title')}</h2>
          <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>
            {t('intro.lead')}
          </p>
        </div>
        <ul className="saf-intro__bullets">
          <li className="reveal" style={{ '--reveal-index': 0 }}>
            <span className="saf-intro__num">01</span>
            <div>
              <strong>{t('intro.bullets.vehicles_title')}</strong>
              <p>{t('intro.bullets.vehicles_text')}</p>
            </div>
          </li>
          <li className="reveal" style={{ '--reveal-index': 1 }}>
            <span className="saf-intro__num">02</span>
            <div>
              <strong>{t('intro.bullets.flights_title')}</strong>
              <p>{t('intro.bullets.flights_text')}</p>
            </div>
          </li>
          <li className="reveal" style={{ '--reveal-index': 2 }}>
            <span className="saf-intro__num">03</span>
            <div>
              <strong>{t('intro.bullets.fees_title')}</strong>
              <p>{t('intro.bullets.fees_text')}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
