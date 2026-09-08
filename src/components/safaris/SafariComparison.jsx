import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SAFARI_COMPARISON } from '../../data/safarisPageContent.js';

export default function SafariComparison({ safariProducts }) {
  const { t } = useTranslation('safaris');
  return (
    <section className="saf-compare" id="choose">
      <header className="saf-compare__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('compare.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('compare.title')}</h2>
        <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('compare.lead')}</p>
      </header>
      <div className="saf-compare__grid">
        {SAFARI_COMPARISON.map((item, i) => {
          const label = t(`compare.items.${item.slug}.label`, item.label);
          // The remote-parks recommendation names a group; the other cards
          // name a single route and should match its localized detail heading.
          const route = safariProducts.find((safari) => safari.id === item.slug);
          const pick = item.slug === 'nyerere-selous'
            ? t(`compare.items.${item.slug}.pick`, { defaultValue: item.pick })
            : route?.title || t(`compare.items.${item.slug}.pick`, { defaultValue: item.pick });
          const note = t(`compare.items.${item.slug}.note`, item.note);
          return (
            <Link className="saf-compare__card reveal" style={{ '--reveal-index': i }} key={item.slug} to={`/safaris/${item.slug}`} aria-label={t('compare.explore_aria', { pick })}>
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
