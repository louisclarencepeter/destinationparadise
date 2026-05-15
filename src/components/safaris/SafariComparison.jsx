import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SAFARI_COMPARISON } from '../../data/safarisPageContent.js';

export default function SafariComparison() {
  const { t } = useTranslation('safaris');
  return (
    <section className="saf-compare reveal" id="choose">
      <header className="saf-compare__head">
        <span className="section-eyebrow">{t('compare.eyebrow')}</span>
        <h2 className="section-title">{t('compare.title')}</h2>
        <p className="section-lead">{t('compare.lead')}</p>
      </header>
      <div className="saf-compare__grid">
        {SAFARI_COMPARISON.map((item) => {
          const label = t(`compare.items.${item.slug}.label`, item.label);
          const pick = t(`compare.items.${item.slug}.pick`, item.pick);
          const note = t(`compare.items.${item.slug}.note`, item.note);
          return (
            <Link className="saf-compare__card" key={item.slug} to={`/safaris/${item.slug}`} aria-label={t('compare.explore_aria', { pick })}>
              <span>{label}</span>
              <h3>{pick}</h3>
              <p>{note}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
