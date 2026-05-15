import { useTranslation } from 'react-i18next';

export default function SafariIntro() {
  const { t } = useTranslation('safaris');
  return (
    <section className="saf-intro reveal">
      <div className="saf-intro__grid">
        <div className="saf-intro__copy">
          <span className="section-eyebrow">{t('intro.eyebrow')}</span>
          <h2 className="section-title">{t('intro.title')}</h2>
          <p className="section-lead">
            {t('intro.lead')}
          </p>
        </div>
        <ul className="saf-intro__bullets">
          <li>
            <span className="saf-intro__num">01</span>
            <div>
              <strong>{t('intro.bullets.vehicles_title')}</strong>
              <p>{t('intro.bullets.vehicles_text')}</p>
            </div>
          </li>
          <li>
            <span className="saf-intro__num">02</span>
            <div>
              <strong>{t('intro.bullets.flights_title')}</strong>
              <p>{t('intro.bullets.flights_text')}</p>
            </div>
          </li>
          <li>
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
