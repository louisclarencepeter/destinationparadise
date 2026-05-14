import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowIcon } from './Icons.jsx';
import { destinationParadisePackages } from '../../data/destinationParadisePackages.js';

const FEATURED_PACKAGE_SLUGS = [
  'six-day-safari-zanzibar-escape',
  'seven-day-honeymoon-safari-zanzibar',
  'ten-day-classic-safari-zanzibar',
];

const packageCards = FEATURED_PACKAGE_SLUGS
  .map((slug) => destinationParadisePackages.find((item) => item.slug === slug))
  .filter(Boolean);

const getPackageRibbonKey = (slug) => {
  if (slug === 'six-day-safari-zanzibar-escape') return 'best_entry';
  if (slug === 'seven-day-honeymoon-safari-zanzibar') return 'honeymoon';
  if (slug === 'ten-day-classic-safari-zanzibar') return 'most_complete';
  return null;
};

const getPackageSummary = (pkg) => pkg.split || pkg.idealFor?.slice(0, 3).join(' · ') || pkg.category;

const getPackageItems = (pkg) => {
  const categoryKind = pkg.category.includes('Honeymoon') ? 'romance' : pkg.category.includes('Safari') ? 'safari' : 'package';
  const categoryClass = pkg.category.includes('Honeymoon') ? 'inc' : 'saf';
  return [
    { kindKey: categoryKind, kind: categoryClass, text: getPackageSummary(pkg) },
    ...pkg.includes.slice(0, 4).map((text) => {
      const lower = text.toLowerCase();
      const kind = lower.includes('safari') || lower.includes('serengeti') || lower.includes('ngorongoro') || lower.includes('tarangire') ? 'saf'
        : lower.includes('beach') || lower.includes('hotel') || lower.includes('resort') || lower.includes('lodge') ? 'hotel'
          : lower.includes('flight') || lower.includes('transfer') || lower.includes('park') ? 'inc'
            : 'exc';
      const kindKey = kind === 'saf' ? 'safari' : kind === 'hotel' ? 'stay' : kind === 'inc' ? 'included' : 'experience';
      return { kindKey, kind, text };
    }),
  ];
};

export default function PackagesSection() {
  const { t } = useTranslation('home');
  return (
    <section className="packages reveal" id="packages">
      <header className="packages__head">
        <span className="section-eyebrow">{t('packages.eyebrow')}</span>
        <h2 className="section-title">{t('packages.title', { count: destinationParadisePackages.length })}</h2>
        <p className="section-lead">{t('packages.lead')}</p>
      </header>
      <div className="packages__grid">
        {packageCards.map((pkg) => {
          const ribbonKey = getPackageRibbonKey(pkg.slug);
          return (
            <article className={`pkg-card${pkg.slug === 'ten-day-classic-safari-zanzibar' ? ' pkg-card--feature' : ''}`} key={pkg.slug}>
              {ribbonKey && (
                <div className={`pkg-card__rib${pkg.slug === 'ten-day-classic-safari-zanzibar' ? ' pkg-card__rib--gold' : ''}`}>{t(`packages.ribbons.${ribbonKey}`)}</div>
              )}
              <div className="pkg-card__head">
                <span className="pkg-card__nights">{pkg.duration}</span>
                <h3>{pkg.title}</h3>
                <p className="pkg-card__lead">{getPackageSummary(pkg)}</p>
              </div>
              <ul className="pkg-card__list">
                {getPackageItems(pkg).map((item) => (
                  <li key={`${pkg.slug}-${item.kindKey}-${item.text}`}><span className={`pkg-tag pkg-tag--${item.kind}`}>{t(`packages.tags.${item.kindKey}`)}</span> {item.text}</li>
                ))}
              </ul>
              <div className="pkg-card__foot">
                <div><span className="pkg-card__from">{t('packages.card.from')}</span><span className="pkg-card__price">${pkg.pricing.from.toLocaleString()}</span><span className="pkg-card__pp">{pkg.pricing.unit || t('packages.card.per_person_default')}</span></div>
                <Link className="btn" to={`/packages/${pkg.slug}`}>{t('packages.card.view_package')} <ArrowIcon size={14} /></Link>
              </div>
            </article>
          );
        })}
      </div>
      <div className="packages__note">{t('packages.note')}</div>
      <div className="excursions__more">
        <Link className="btn btn--on-light" to="/packages">{t('packages.view_all')} <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
