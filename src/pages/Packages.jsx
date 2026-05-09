import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { destinationParadisePackages } from '../data/destinationParadisePackages.js';
import { uniqueProductImages } from '../utils/productImages.js';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

const PACKAGE_IMAGES = {
  'six-day-safari-zanzibar-escape': '/assets/images/safaris/eland-herd-plains.webp',
  'seven-day-honeymoon-safari-zanzibar': '/assets/images/safaris/lioness-and-cub-resting.webp',
  'eight-day-tanzania-parks-zanzibar': '/assets/images/safaris/zebra-herd-on-track.webp',
  'nine-day-safari-zanzibar-culture': '/assets/images/excursions/stone-town-old-fort.webp',
  'ten-day-classic-safari-zanzibar': '/assets/images/safaris/rhino-on-plains.webp',
  'twelve-day-serengeti-zanzibar': '/assets/images/safaris/wildebeest-grazing.webp',
  'fourteen-day-ultimate-tanzania-zanzibar': '/assets/images/safaris/male-lion-in-grass.webp',
  'two-day-fly-in-safari-zanzibar': '/assets/images/safaris/buffalo-and-egret.webp',
  'three-day-serengeti-fly-in-safari': '/assets/images/safaris/zebra-mare-and-foal.webp',
  'kilimanjaro-safari-zanzibar-expedition': '/assets/images/safaris/warthog-on-plains.webp',
  'luxury-family-safari-zanzibar': '/assets/images/safaris/lion-cub-in-grass.webp',
  'great-migration-luxury-package': '/assets/images/safaris/serval-in-grass.webp',
  'zanzibar-adventure-marine-package': '/assets/images/excursions/dolphin-snorkeling.webp',
  'stone-town-culture-experience': '/assets/images/excursions/spice-tour-nutmeg.webp',
  'digital-nomad-zanzibar-stay': '/assets/images/home/mizingani-waterfront.webp',
};

const imgForPackage = (pkg) => {
  if (PACKAGE_IMAGES[pkg.slug]) return PACKAGE_IMAGES[pkg.slug];
  const { category } = pkg;
  if (/safari|multi/i.test(category)) return '/assets/images/safaris/raptor-on-log.webp';
  if (/honeymoon|romantic|wedding/i.test(category)) return '/assets/images/home/stone-town-waterfront.webp';
  if (/family|festival|digital/i.test(category)) return '/assets/images/excursions/prison-island-tortoise.webp';
  if (/luxury|wellness|creator/i.test(category)) return '/assets/images/safaris/eland-grazing.webp';
  if (/adventure/i.test(category)) return '/assets/images/excursions/dolphin-snorkeling.webp';
  return '/assets/images/home/stone-town-waterfront.webp';
};

const priceLabel = (pricing) => {
  const from = `$${pricing.from.toLocaleString()}`;
  if (pricing.to) return `${from} - $${pricing.to.toLocaleString()}`;
  return from;
};

const categoryText = (pkg) => `${pkg.category} ${pkg.title} ${(pkg.idealFor || []).join(' ')} ${(pkg.includes || []).join(' ')}`;

export const PACKAGES = uniqueProductImages(destinationParadisePackages.map((pkg) => ({
  ...pkg,
  id: pkg.slug,
  image: imgForPackage(pkg),
  from: pkg.category,
  price: pkg.pricing.from,
  priceLabel: priceLabel(pkg.pricing),
  priceSub: pkg.pricing.unit || 'Per Person',
  description: pkg.split || pkg.focus || pkg.includes.slice(0, 4).join(' · '),
})), { scope: 'Package' });

const FILTERS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'safari', label: 'Safari + beach', match: (pkg) => /safari packages|serengeti|migration|tanzania parks|classic safari/i.test(categoryText(pkg)) },
  { key: 'honeymoon', label: 'Honeymoon', match: (pkg) => /honeymoon|couples/i.test(categoryText(pkg)) },
  { key: 'fly-in', label: 'Fly-in safaris', match: (pkg) => /fly-in|return flight|domestic flight/i.test(categoryText(pkg)) },
  { key: 'luxury', label: 'Luxury', match: (pkg) => /luxury|premium|vip|migration/i.test(categoryText(pkg)) },
  { key: 'family', label: 'Family', match: (pkg) => /family|children/i.test(categoryText(pkg)) },
  { key: 'kilimanjaro', label: 'Kilimanjaro', match: (pkg) => /kilimanjaro|machame|mountain/i.test(categoryText(pkg)) },
  { key: 'culture', label: 'Culture', match: (pkg) => /culture|stone town|spice|swahili/i.test(categoryText(pkg)) },
  { key: 'marine', label: 'Marine', match: (pkg) => /marine|diving|snorkeling|mnemba|dolphin/i.test(categoryText(pkg)) },
  { key: 'tailor', label: 'Tailor-made', match: (pkg) => /tailor|nomad|long-term|remote workers/i.test(categoryText(pkg)) },
];

const packageFilters = FILTERS.map((filter) => ({
  ...filter,
  count: PACKAGES.filter(filter.match).length,
}));

const minPackagePrice = Math.min(...PACKAGES.map((pkg) => pkg.price));
const INITIAL_PACKAGE_COUNT = 6;
const PACKAGE_BATCH_COUNT = 6;

const PACKAGE_MATCHES = [
  { label: 'Best entry package', pick: '6 Days Safari & Zanzibar Escape', slug: 'six-day-safari-zanzibar-escape', note: 'The most accessible way to combine a real mainland safari with beach time.' },
  { label: 'Best honeymoon', pick: '7 Days Honeymoon Safari & Zanzibar', slug: 'seven-day-honeymoon-safari-zanzibar', note: 'Romantic lodges, beach resort, dhow cruise, candlelight dinner, and safari days.' },
  { label: 'Most complete classic', pick: '10 Days Classic Safari & Zanzibar', slug: 'ten-day-classic-safari-zanzibar', note: 'Arusha, Tarangire, Serengeti, Ngorongoro, and a Zanzibar beach finish.' },
  { label: 'Best quick safari', pick: '2 Days Fly-In Safari From Zanzibar', slug: 'two-day-fly-in-safari-zanzibar', note: 'A compact fly-in route for guests already staying on the island.' },
  { label: 'Best premium wildlife', pick: 'Great Migration Luxury Package', slug: 'great-migration-luxury-package', note: 'Seasonal migration tracking, luxury camps, photographer options, and Zanzibar.' },
  { label: 'Best non-safari island stay', pick: 'Zanzibar Adventure & Marine Package', slug: 'zanzibar-adventure-marine-package', note: 'Ocean activities, sandbank picnic, dhow cruise, Jozani, and beach resort time.' },
];

const PACKAGE_INCLUDED = [
  'Airport transfers coordinated',
  'Hotel or villa matching',
  'Excursions and safari add-ons',
  'Custom quote within 24 hours',
  'WhatsApp concierge support',
  'Upgrade options before confirmation',
  'Flexible pacing for your group',
  'Local team on the ground',
];

const PACKAGE_STEPS = [
  { step: '01', title: 'Choose a package', text: 'Start from the closest match: safari and beach, honeymoon, fly-in, family, luxury, Kilimanjaro, culture, or marine.' },
  { step: '02', title: 'We tailor the details', text: 'Hotels, flights, safari routing, beach areas, excursions, meals, and upgrades are adjusted to your dates and budget.' },
  { step: '03', title: 'Confirm and relax', text: 'Your deposit locks the plan. We coordinate the moving parts and keep you updated on WhatsApp.' },
];

const MARKET_CATEGORIES = [
  'Safari Packages',
  'Zanzibar Beach Holidays',
  'Honeymoon Packages',
  'Family Packages',
  'Luxury Experiences',
  'Fly-In Safaris',
  'Kilimanjaro Adventures',
  'Cultural Tours',
  'Marine & Diving Experiences',
  'Tailor-Made Packages',
];

export default function Packages() {
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PACKAGE_COUNT);
  const activeFilter = packageFilters.find((item) => item.key === filter) || packageFilters[0];
  const filteredPackages = useMemo(() => PACKAGES.filter(activeFilter.match), [activeFilter]);
  const visible = useMemo(
    () => filteredPackages.slice(0, visibleCount),
    [filteredPackages, visibleCount],
  );
  const hasHiddenPackages = visibleCount < filteredPackages.length;

  useEffect(() => {
    setVisibleCount(INITIAL_PACKAGE_COUNT);
  }, [filter]);

  useEffect(() => {
    document.title = 'Zanzibar Packages · Destination Paradise';
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;
    const items = root.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [visible]);

  return (
    <main className="excursions-page packages-page" ref={pageRef}>
      <section className="exc-hero pkg-hero">
        <div className="exc-hero__bg"><ResponsiveImage src="/assets/images/safaris/eland-grazing.webp" alt="" fetchpriority="high" loading="eager" decoding="sync" /></div>
        <div className="exc-hero__inner">
          <span className="exc-hero__eyebrow">Hotels · safaris · excursions · special moments</span>
          <h1 className="exc-hero__title">Packages for the trip <em>you actually want.</em></h1>
          <p className="exc-hero__lead">Safari and Zanzibar combos, honeymoon trips, fly-in safaris, Kilimanjaro adventures, family holidays, marine experiences, and culture-led island stays.</p>
          <div className="exc-hero__row">
            <a className="btn btn--lg" href="#packages">Browse packages</a>
            <Link className="btn btn--ghost btn--lg" to="/trip-planner">Build my plan →</Link>
          </div>
          <div className="exc-hero__meta">
            <div><strong>{PACKAGES.length}</strong><span>Packages</span></div>
            <div><strong>${minPackagePrice.toLocaleString()}</strong><span>From</span></div>
            <div><strong>10</strong><span>Styles</span></div>
            <div><strong>24h</strong><span>Quote time</span></div>
          </div>
        </div>
      </section>

      <section className="exc-grid-wrap" id="packages">
        <header className="exc-list__head">
          <span className="section-eyebrow">Curated packages</span>
          <h2 className="section-title">Packages — pick a starting point.</h2>
          <p className="section-lead">Each package opens into inclusions, audience fit, price, and upgrade ideas. We tailor every package around your dates and comfort level.</p>
        </header>

        <div className="exc-filter">
          <span className="exc-filter__label">Filter by</span>
          {packageFilters.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`exc-filter__btn${filter === item.key ? ' is-active' : ''}`}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
            >
              {item.label} <span className="exc-filter__count">{item.count}</span>
            </button>
          ))}
        </div>

        <div className="exc-grid">
          {visible.map((pkg) => (
            <Link key={pkg.id} to={`/packages/${pkg.id}`} className="exc-card reveal" aria-label={`Explore ${pkg.title}`}>
              <div className="exc-card__img">
                <img src={pkg.image} alt="" loading="lazy" />
                <span className="exc-card__cat">{pkg.category}</span>
              </div>
              <div className="exc-card__body">
                <span className="exc-card__eyebrow">{pkg.duration}</span>
                <h3 className="exc-card__title">{pkg.title}</h3>
                <p className="exc-card__desc">{pkg.description}</p>
                <div className="exc-card__meta">
                  <span>{pkg.duration}</span>
                  <span>{pkg.category}</span>
                </div>
                <div className="exc-card__foot">
                  <span className="exc-card__price">From <strong>{pkg.priceLabel}</strong> {pkg.priceSub}</span>
                  <span className="exc-card__cta">Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filteredPackages.length > INITIAL_PACKAGE_COUNT && (
          <div className="exc-grid__actions">
            {hasHiddenPackages ? (
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                onClick={() => setVisibleCount((count) => Math.min(count + PACKAGE_BATCH_COUNT, filteredPackages.length))}
              >
                Show more packages
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                onClick={() => setVisibleCount(INITIAL_PACKAGE_COUNT)}
              >
                Show fewer packages
              </button>
            )}
            <span>{Math.min(visibleCount, filteredPackages.length)} of {filteredPackages.length} shown</span>
          </div>
        )}
      </section>

      <section className="saf-compare reveal">
        <header className="saf-compare__head">
          <span className="section-eyebrow">Not sure yet?</span>
          <h2 className="section-title">Choose by travel style.</h2>
          <p className="section-lead">Start with the strongest 2026 travel demand: safari and beach, honeymoon, short fly-in safaris, luxury migration, family, Kilimanjaro, marine, or culture.</p>
        </header>
        <div className="saf-compare__grid">
          {PACKAGE_MATCHES.map((item) => (
            <Link className="saf-compare__card" key={item.label} to={`/packages/${item.slug}`} aria-label={`Explore ${item.pick}`}>
              <span>{item.label}</span>
              <h3>{item.pick}</h3>
              <p>{item.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="included reveal">
        <div className="included__wrap">
          <div className="included__copy">
            <span className="section-eyebrow">Operator positioning</span>
            <h2 className="section-title">A complete Tanzania and Zanzibar portfolio.</h2>
            <p className="section-lead">These categories make Destination Paradise feel like a full-scale premium tour operator, not only an excursions company.</p>
          </div>
          <ul className="included__list">
            {MARKET_CATEGORIES.map((item) => (
              <li key={item}><span>✓</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="included reveal">
        <div className="included__wrap">
          <div className="included__copy">
            <span className="section-eyebrow">What’s included</span>
            <h2 className="section-title">One plan. Fewer moving parts.</h2>
            <p className="section-lead">Packages are built to remove the back-and-forth: hotels, transfers, excursions, special setups, and safari add-ons arranged together.</p>
          </div>
          <ul className="included__list">
            {PACKAGE_INCLUDED.map((item) => (
              <li key={item}><span>✓</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="saf-steps reveal">
        <header className="saf-steps__head">
          <span className="section-eyebrow">How booking works</span>
          <h2 className="section-title">Three steps to a confirmed package.</h2>
        </header>
        <div className="saf-steps__grid">
          {PACKAGE_STEPS.map((item) => (
            <article className="saf-step" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src="/assets/images/excursions/prison-island-tortoise.webp" alt="" /></div>
        <div className="exc-cta__inner">
          <h2>Want us to build it around you?</h2>
          <p>Send dates, group size, and the style you like. We’ll come back with a real package and a real price.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking">Get a quote →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Plan with AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
