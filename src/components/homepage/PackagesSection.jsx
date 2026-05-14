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
  if (slug === 'six-day-safari-zanzibar-escape') return 'Dobry początek';
  if (slug === 'seven-day-honeymoon-safari-zanzibar') return 'Podróż poślubna';
  if (slug === 'ten-day-classic-safari-zanzibar') return 'Najpełniejszy';
  return null;
};

const getPackageSummary = (pkg) => pkg.split || pkg.idealFor?.slice(0, 3).join(' · ') || pkg.category;

const getPackageItems = (pkg) => {
  const categoryTag = pkg.category.includes('poślub') ? 'Romantycznie' : pkg.category.includes('safari') ? 'Safari' : 'Pakiet';
  return [
    { tag: categoryTag, kind: pkg.category.includes('poślub') ? 'inc' : 'saf', text: getPackageSummary(pkg) },
    ...pkg.includes.slice(0, 4).map((text) => {
      const lower = text.toLowerCase();
      const kind = lower.includes('safari') || lower.includes('serengeti') || lower.includes('ngorongoro') || lower.includes('tarangire') ? 'saf'
        : lower.includes('beach') || lower.includes('hotel') || lower.includes('resort') || lower.includes('lodge') ? 'hotel'
          : lower.includes('flight') || lower.includes('transfer') || lower.includes('park') ? 'inc'
            : 'exc';
      return { tag: kind === 'saf' ? 'Safari' : kind === 'hotel' ? 'Pobyt' : kind === 'inc' ? 'W cenie' : 'Przeżycie', kind, text };
    }),
  ];
};

export default function PackagesSection() {
  return (
    <section className="packages reveal" id="packages">
      <header className="packages__head">
        <span className="section-eyebrow">Pełne portfolio podróży</span>
        <h2 className="section-title">{destinationParadisePackages.length} pakietów: safari, Zanzibar, podróż poślubna, rodzina i kultura</h2>
        <p className="section-lead">Zacznij od sprawdzonego pakietu, a my dopasujemy trasę, standard hoteli, loty, wycieczki i tempo do Twoich dat.</p>
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
              <div><span className="pkg-card__from">Od</span><span className="pkg-card__price">${pkg.pricing.from.toLocaleString()}</span><span className="pkg-card__pp">{pkg.pricing.unit || 'za osobę'}</span></div>
              <Link className="btn" to={`/packages/${pkg.slug}`}>Zobacz pakiet <ArrowIcon size={14} /></Link>
            </div>
          </article>
        ))}
      </div>
      <div className="packages__note">Pełna strona pakietów obejmuje podróże poślubne, rodzinne, safari z przelotem, migrację, Kilimanjaro, ocean, kulturę, digital nomad i opcje luksusowe.</div>
      <div className="excursions__more">
        <Link className="btn btn--on-light" to="/packages">Zobacz wszystkie pakiety <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
