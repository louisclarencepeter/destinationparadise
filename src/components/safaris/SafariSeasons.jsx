import { useTranslation } from 'react-i18next';
import { SEASONS } from '../../data/safarisPageContent.js';

export default function SafariSeasons() {
  const { t } = useTranslation('safaris');
  return (
    <section className="when" id="when">
      <header className="when__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('seasons.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('seasons.title')}</h2>
      </header>
      <div className="when__grid">
        {SEASONS.map((season, i) => (
          <article className={`when-card when-card--${season.mod} reveal dp-lift`} style={{ '--reveal-index': i }} key={season.mod}>
            <div className="when-card__months">{season.months}</div>
            <h4>{t(`seasons.items.${season.mod}.title`, season.title)}</h4>
            <p>{t(`seasons.items.${season.mod}.blurb`, season.blurb)}</p>
            <span className="when-card__rating">{season.rating}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
