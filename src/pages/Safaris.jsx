import { Link } from 'react-router-dom';
import { SAFARI_IMAGES, SAFARI_TRIPS } from '../data/safariAssets.js';
import '../styles/homepage.css';
import '../styles/safaris.css';

const heroImage = SAFARI_IMAGES.find((image) => image.id === 'male-lion-in-grass') || SAFARI_IMAGES[0];

export default function Safaris() {
  return (
    <main className="safaris-page">
      <nav className="safaris-page__nav" aria-label="Safari page navigation">
        <Link className="safaris-page__logo" to="/">
          <img src="/assets/brand/destination-paradise-logo.png" alt="Destination Paradise" />
          <span>Destination Paradise</span>
        </Link>
        <div className="safaris-page__nav-actions">
          <Link to="/" className="safaris-page__nav-link">Home</Link>
          <a href="/#planner" className="safaris-page__nav-link">Plan Trip</a>
        </div>
      </nav>

      <section className="safaris-page__hero" style={{ '--safari-hero-image': `url(${heroImage.src})` }}>
        <div className="safaris-page__hero-copy">
          <span className="section-eyebrow">Cross to the Mainland</span>
          <h1>Safaris in Tanzania</h1>
          <p>
            Northern circuit classics, crater mornings, big-cat plains, and quiet southern wilderness
            paired cleanly with Zanzibar beach time.
          </p>
          <div className="safaris-page__hero-actions">
            <a className="btn" href="/#planner">Build My Safari</a>
            <a className="btn btn--ghost" href="#safari-gallery">View Photos</a>
          </div>
        </div>
      </section>

      <section className="safaris-page__section" id="safari-options">
        <header className="safaris-page__section-head">
          <span className="section-eyebrow">Routes We Build Most</span>
          <h2 className="section-title">Mainland safari options</h2>
          <p className="section-lead">
            These are starting points. We adjust parks, lodge level, flights, and pacing around your dates.
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
