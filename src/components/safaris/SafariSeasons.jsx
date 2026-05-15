import { useTranslation } from 'react-i18next';
import { SEASONS } from '../../data/safarisPageContent.js';

export default function SafariSeasons() {
  const { t } = useTranslation('safaris');
  return (
    <section className="when reveal" id="when">
      <header className="when__head">
        <span className="section-eyebrow">{t('seasons.eyebrow')}</span>
        <h2 className="section-title">{t('seasons.title')}</h2>
      </header>
      <div className="when__grid">
        {SEASONS.map((season) => (
          <article className={`when-card when-card--${season.mod}`} key={season.mod}>
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
