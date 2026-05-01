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
const safariPackageGroups = SAFARI_TYPES.map((style) => ({
  ...style,
  id: slugify(style.type),
  packages: SAFARI_PACKAGES.filter((pkg) => pkg.safariType === style.type),
})).filter((group) => group.packages.length > 0);

export default function Safaris() {
  return (
    <main className="safaris-page">
      <section className="safaris-page__hero" style={{ '--safari-hero-image': `url(${heroImage.src})` }}>
        <div className="safaris-page__hero-copy">
          <span className="section-eyebrow">{SAFARI_PAGE_CONTENT.eyebrow}</span>
          <h1>{SAFARI_PAGE_CONTENT.title}</h1>
          <p>{SAFARI_PAGE_CONTENT.subtitle}</p>
          <div className="safaris-page__hero-actions">
            <a className="btn" href="/#planner">Build My Safari</a>
            <a className="btn btn--ghost" href="#safari-packages">View Safaris</a>
          </div>
        </div>
      </section>

      <section className="safaris-page__section safaris-page__section--types" id="safari-types">
        <header className="safaris-page__section-head">
          <span className="section-eyebrow">Ways to Explore</span>
          <h2 className="section-title">Safari styles</h2>
        </header>

        <div className="safari-type-grid">
          {SAFARI_TYPES.map((item) => (
            <a className="safari-type-card" href={`#${slugify(item.type)}`} key={item.type}>
              <h3>{item.type}</h3>
              <p>{item.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="safaris-page__section" id="safari-options">
        <header className="safaris-page__section-head">
          <span className="section-eyebrow">Ways to Book</span>
          <h2 className="section-title">Mainland safari options</h2>
          <p className="section-lead">
            Start with the booking style that fits your trip: a dedicated safari, a fast fly-in from Zanzibar, or a full bush-and-beach package.
          </p>
        </header>

        <div className="safaris__grid safaris-page__trips">
          {SAFARI_TRIPS.map((trip) => (
            <article className={`safari-card${trip.featured ? ' safari-card--feature' : ''}`} key={trip.id}>
              <div className="safari-card__img">
                <img src={trip.image} alt={trip.imageAlt} loading="lazy" />
                <span className="safari-card__nights">{trip.nights}</span>
              </div>
              <div className="safari-card__body">
                <h3>{trip.title}</h3>
                <p>{trip.description}</p>
                <div className="safari-card__foot">
                  <span className="safari-card__from">From <strong>{trip.price}</strong> pp</span>
                  <a className="ex-card__link" href="/#planner">Ask us</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="safaris-page__section safaris-page__section--packages" id="safari-packages">
        <header className="safaris-page__section-head">
          <span className="section-eyebrow">All Safari Packages</span>
          <h2 className="section-title">Choose your route</h2>
          <p className="section-lead">
            The docs currently list {SAFARI_PACKAGES.length} safari packages, from one-day fly-in trips to longer northern and southern circuits.
          </p>
        </header>

        <div className="safari-package-groups">
          {safariPackageGroups.map((group, groupIndex) => (
            <section
              className="safari-package-group"
              id={group.id}
              key={group.type}
              aria-labelledby={`safari-group-${group.id}`}
            >
              <header className="safari-package-group__head">
                <span className="safari-package-group__label">
                  {String(groupIndex + 1).padStart(2, '0')} / {group.packages.length} {group.packages.length === 1 ? 'option' : 'options'}
                </span>
                <h3 id={`safari-group-${group.id}`}>{group.type}</h3>
                <p>{group.description}</p>
              </header>

              <div className="safari-package-grid">
                {group.packages.map((pkg) => (
                  <article className={`safari-package-card${pkg.featured ? ' safari-package-card--featured' : ''}`} key={pkg.id}>
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
          ))}
        </div>

        <p className="safaris-page__disclaimer">{SAFARI_PAGE_CONTENT.disclaimer}</p>
      </section>

      <section className="safaris-page__section safaris-page__section--gallery" id="safari-gallery">
        <header className="safaris-page__section-head">
          <span className="section-eyebrow">Safari Gallery</span>
          <h2 className="section-title">Wildlife from the selected set</h2>
        </header>

        <div className="safari-photo-grid">
          {SAFARI_IMAGES.map((image, index) => (
            <figure
              className={`safari-photo${image.layout ? ` safari-photo--${image.layout}` : ''}`}
              key={image.id}
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
