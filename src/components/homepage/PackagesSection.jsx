import { Link } from 'react-router-dom';
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

const getPackageRibbon = (slug) => {
  if (slug === 'six-day-safari-zanzibar-escape') return 'Best entry';
  if (slug === 'seven-day-honeymoon-safari-zanzibar') return 'Honeymoon';
  if (slug === 'ten-day-classic-safari-zanzibar') return 'Most complete';
  return null;
};

const getPackageSummary = (pkg) => pkg.split || pkg.idealFor?.slice(0, 3).join(' · ') || pkg.category;

const getPackageItems = (pkg) => {
  const categoryTag = pkg.category.includes('Honeymoon') ? 'Romance' : pkg.category.includes('Safari') ? 'Safari' : 'Package';
  return [
    { tag: categoryTag, kind: pkg.category.includes('Honeymoon') ? 'inc' : 'saf', text: getPackageSummary(pkg) },
    ...pkg.includes.slice(0, 4).map((text) => {
      const lower = text.toLowerCase();
      const kind = lower.includes('safari') || lower.includes('serengeti') || lower.includes('ngorongoro') || lower.includes('tarangire') ? 'saf'
        : lower.includes('beach') || lower.includes('hotel') || lower.includes('resort') || lower.includes('lodge') ? 'hotel'
          : lower.includes('flight') || lower.includes('transfer') || lower.includes('park') ? 'inc'
            : 'exc';
      return { tag: kind === 'saf' ? 'Safari' : kind === 'hotel' ? 'Stay' : kind === 'inc' ? 'Included' : 'Experience', kind, text };
    }),
  ];
};

export default function PackagesSection() {
  return (
    <section className="packages reveal" id="packages">
      <header className="packages__head">
        <span className="section-eyebrow">Complete trip portfolio</span>
        <h2 className="section-title">{destinationParadisePackages.length} packages — safari, Zanzibar, honeymoon, family &amp; culture</h2>
        <p className="section-lead">Start with a researched package, then let us adjust the route, hotel level, flights, excursions, and pace around your dates.</p>
      </header>
      <div className="packages__grid">
        {packageCards.map((pkg) => (
          <article className={`pkg-card${pkg.slug === 'ten-day-classic-safari-zanzibar' ? ' pkg-card--feature' : ''}`} key={pkg.slug}>
            {getPackageRibbon(pkg.slug) && (
              <div className={`pkg-card__rib${pkg.slug === 'ten-day-classic-safari-zanzibar' ? ' pkg-card__rib--gold' : ''}`}>{getPackageRibbon(pkg.slug)}</div>
            )}
            <div className="pkg-card__head">
              <span className="pkg-card__nights">{pkg.duration}</span>
              <h3>{pkg.title}</h3>
              <p className="pkg-card__lead">{getPackageSummary(pkg)}</p>
            </div>
            <ul className="pkg-card__list">
              {getPackageItems(pkg).map((item) => (
                <li key={`${pkg.slug}-${item.tag}-${item.text}`}><span className={`pkg-tag pkg-tag--${item.kind}`}>{item.tag}</span> {item.text}</li>
              ))}
            </ul>
            <div className="pkg-card__foot">
              <div><span className="pkg-card__from">From</span><span className="pkg-card__price">${pkg.pricing.from.toLocaleString()}</span><span className="pkg-card__pp">{pkg.pricing.unit || 'per person'}</span></div>
              <Link className="btn" to={`/packages/${pkg.slug}`}>View package <ArrowIcon size={14} /></Link>
            </div>
          </article>
        ))}
      </div>
      <div className="packages__note">The full package page includes honeymoon, family, fly-in safari, migration, Kilimanjaro, marine, culture, digital nomad, and luxury options.</div>
      <div className="excursions__more">
        <Link className="btn btn--on-light" to="/packages">View all packages <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
