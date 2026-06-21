import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SAFARI_TYPES } from '../../data/safariPageData.js';

export default function SafariTypes() {
  const { t } = useTranslation('safaris');
  return (
    <section className="saf-types" id="safari-types">
      <header className="saf-types__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('types.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('types.title')}</h2>
        <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('types.lead')}</p>
        <ul className="saf-types__modes reveal" style={{ '--reveal-index': 3 }}>
          <li>
            <span className="saf-types__mode-tag">{t('types.modes.dedicated_tag')}</span>
            {t('types.modes.dedicated_text')}
          </li>
          <li>
            <span className="saf-types__mode-tag saf-types__mode-tag--accent">{t('types.modes.last_minute_tag')}</span>
            {t('types.modes.last_minute_text')}
          </li>
          <li>
            <span className="saf-types__mode-tag">{t('types.modes.package_tag')}</span>
            {t('types.modes.package_text')}
          </li>
        </ul>
      </header>
      <div className="saf-types__grid">
        {SAFARI_TYPES.map((item, i) => {
          const title = t(`types.items.${item.id}.title`, item.title);
          const desc = t(`types.items.${item.id}.desc`, item.desc);
          const bestFor = t(`types.items.${item.id}.best_for`, item.bestFor);
          return (
            <Link className="saf-type-card reveal" style={{ '--reveal-index': i }} key={item.id} to={`/safaris/types/${item.id}`} aria-label={t('types.card.explore_aria', { title })}>
              <div className="saf-type-card__media">
                <img src={item.image} alt={item.alt} loading="lazy" />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="saf-type-card__foot">
                <span className="saf-type-card__meta">{t('types.card.best_for', { audience: bestFor })}</span>
                <span className="saf-type-card__cta">{t('types.card.explore_cta')}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
