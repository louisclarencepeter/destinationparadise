import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  SAFARI_IMAGES,
  SAFARI_PACKAGES,
  SAFARI_PAGE_CONTENT,
  SAFARI_TRIPS,
  SAFARI_TYPES,
} from '../data/safariAssets.js';
import '../styles/homepage.css';
import '../styles/safaris.css';

const heroImage = SAFARI_IMAGES.find((image) => image.id === 'male-lion-in-grass') || SAFARI_IMAGES[0];
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const compactPrice = (price) => price.replace(/\s+per person\b/i, ' pp');
const getLowestGroupPrice = (packages) => {
  const prices = packages
    .flatMap((pkg) => Object.values(pkg.prices))
    .map((price) => ({
      price,
      amount: Number(price.replace(/[^0-9.]/g, '')),
    }))
    .filter(({ amount }) => Number.isFinite(amount))
    .sort((a, b) => a.amount - b.amount);

  return prices[0] ? compactPrice(prices[0].price) : 'Custom quote';
};
const safariPackageGroups = SAFARI_TYPES.map((style) => ({
  ...style,
  id: slugify(style.type),
  packages: SAFARI_PACKAGES.filter((pkg) => pkg.safariType === style.type),
})).filter((group) => group.packages.length > 0);

export default function Safaris() {
  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const revealItems = root.querySelectorAll('.safari-reveal');

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.14 });

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="safaris-page" ref={pageRef}>
      <section className="safaris-page__hero" style={{ '--safari-hero-image': `url(${heroImage.src})` }}>
        <div className="safaris-page__hero-copy">
          <span className="section-eyebrow">{SAFARI_PAGE_CONTENT.eyebrow}</span>
          <h1>{SAFARI_PAGE_CONTENT.title}</h1>
          <p>{SAFARI_PAGE_CONTENT.subtitle}</p>
          <div className="safaris-page__hero-actions">
            <Link className="btn" to="/#planner">Build My Safari</Link>
            <a className="btn btn--ghost" href="#safari-packages">View Safaris</a>
          </div>
        </div>
      </section>

      <section className="safaris-page__section safaris-page__section--types" id="safari-types">
        <header className="safaris-page__section-head safari-reveal">
          <span className="section-eyebrow">Ways to Explore</span>
          <h2 className="section-title">Safari styles</h2>
        </header>

        <div className="safari-type-grid">
          {SAFARI_TYPES.map((item, index) => (
            <a
              className="safari-type-card safari-reveal"
              href={`#${slugify(item.type)}`}
              key={item.type}
              style={{ '--safari-delay': `${index * 70}ms` }}
            >
              <h3>{item.type}</h3>
              <p>{item.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="safaris-page__section" id="safari-options">
        <header className="safaris-page__section-head safari-reveal">
          <span className="section-eyebrow">Ways to Book</span>
          <h2 className="section-title">Mainland safari options</h2>
          <p className="section-lead">
            Start with the booking style that fits your trip: a dedicated safari, a fast fly-in from Zanzibar, or a full bush-and-beach package.
          </p>
        </header>

        <div className="safaris__grid safaris-page__trips">
          {SAFARI_TRIPS.map((trip, index) => (
            <article
              className={`safari-card safari-reveal${trip.featured ? ' safari-card--feature' : ''}`}
              key={trip.id}
              style={{ '--safari-delay': `${index * 90}ms` }}
            >
              <div className="safari-card__img">
                <img src={trip.image} alt={trip.imageAlt} loading="lazy" />
                <span className="safari-card__nights">{trip.nights}</span>
              </div>
              <div className="safari-card__body">
                <h3>{trip.title}</h3>
                <p>{trip.description}</p>
                <div className="safari-card__foot">
                  <span className="safari-card__from">From <strong>{trip.price}</strong> pp</span>
                  <Link className="ex-card__link" to="/#planner">Ask us</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="safaris-page__section safaris-page__section--packages" id="safari-packages">
        <header className="safaris-page__section-head safari-reveal">
          <span className="section-eyebrow">All Safari Packages</span>
          <h2 className="section-title">Choose your route</h2>
          <p className="section-lead">
            The docs currently list {SAFARI_PACKAGES.length} safari packages, from one-day fly-in trips to longer northern and southern circuits.
          </p>
        </header>

        <div className="safari-package-groups">
          {safariPackageGroups.map((group, groupIndex) => {
            const anchorPackage = group.packages.find((pkg) => pkg.featured) || group.packages[0];
            const fromPrice = getLowestGroupPrice(group.packages);

            return (
              <section
                className="safari-package-group"
                id={group.id}
                key={group.type}
                aria-labelledby={`safari-group-${group.id}`}
              >
                <header className="safari-package-group__head safari-reveal">
                  <span className="safari-package-group__label">
                    {String(groupIndex + 1).padStart(2, '0')} / {group.packages.length} {group.packages.length === 1 ? 'option' : 'options'}
                  </span>
                  <h3 id={`safari-group-${group.id}`}>{group.type}</h3>
                  <p>{group.description}</p>

                  <div className="safari-package-group__preview">
                    <img src={anchorPackage.image} alt={anchorPackage.imageAlt} loading="lazy" />
                    <div className="safari-package-group__preview-body">
                      <span>Signature route</span>
                      <strong>{anchorPackage.duration}</strong>
                      <p>{anchorPackage.destinations}</p>
                    </div>
                  </div>

                  <dl className="safari-package-group__facts">
                    <div>
                      <dt>Starting from</dt>
                      <dd>{fromPrice}</dd>
                    </div>
                    <div>
                      <dt>Best for</dt>
                      <dd>{anchorPackage.bestFor}</dd>
                    </div>
                  </dl>
                </header>

                <div className="safari-package-grid">
                  {group.packages.map((pkg, packageIndex) => (
                    <article
                      className={`safari-package-card safari-reveal${pkg.featured ? ' safari-package-card--featured' : ''}`}
                      key={pkg.id}
                      style={{ '--safari-delay': `${packageIndex * 80}ms` }}
                    >
                      <div className="safari-package-card__image">
                        <img src={pkg.image} alt={pkg.imageAlt} loading="lazy" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="safari-package-card__body">
                        <div>
                          <h3>{pkg.title}</h3>
                          <p className="safari-package-card__meta">{pkg.destinations}</p>
                          <p className="safari-package-card__best">Best for: {pkg.bestFor}</p>
                        </div>
                        <ul className="safari-package-card__highlights">
                          {pkg.highlights.slice(0, 4).map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                        <div className="safari-package-card__prices">
                          {Object.entries(pkg.prices).map(([tier, price]) => (
                            <span key={tier}><strong>{tier.replace(/([A-Z])/g, ' $1')}</strong>{price}</span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <p className="safaris-page__disclaimer">{SAFARI_PAGE_CONTENT.disclaimer}</p>
      </section>

      <section className="safaris-page__section safaris-page__section--gallery" id="safari-gallery">
        <header className="safaris-page__section-head safari-reveal">
          <span className="section-eyebrow">Safari Gallery</span>
          <h2 className="section-title">Wildlife from the selected set</h2>
        </header>

        <div className="safari-photo-grid">
          {SAFARI_IMAGES.map((image, index) => (
            <figure
              className={`safari-photo safari-reveal${image.layout ? ` safari-photo--${image.layout}` : ''}`}
              key={image.id}
              style={{ '--safari-delay': `${(index % 6) * 55}ms` }}
            >
              <img src={image.src} alt={image.alt} loading={index < 4 ? 'eager' : 'lazy'} />
              <figcaption>{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
