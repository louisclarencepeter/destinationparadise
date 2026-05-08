import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ALL_SAFARI_PRODUCTS, SAFARI_TYPES } from '../data/safariPageData.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

export default function SafariTypeDetail() {
  const { typeId } = useParams();
  const type = SAFARI_TYPES.find((item) => item.id === typeId);

  useEffect(() => {
    if (type) {
      document.title = `${type.title} · Destination Paradise`;
    }
  }, [type]);

  if (!type) {
    return (
      <main className="safaris-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">Safari styles</span>
            <h1 className="section-title">Safari type not found</h1>
            <p className="section-lead">That style is not in our current list. Browse all safari styles below.</p>
            <Link className="btn btn--ghost-dark" to="/safaris#safari-types" style={{ marginTop: '1.5rem' }}>Back to safari styles →</Link>
          </div>
        </section>
      </main>
    );
  }

  const routes = ALL_SAFARI_PRODUCTS.filter((route) => type.routeIds.includes(route.id));

  return (
    <main className="safaris-page exc-detail saf-type-detail">
      <nav className="exc-detail__crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">→</span>
        <Link to="/safaris">Safaris</Link>
        <span aria-hidden="true">→</span>
        <span>{type.title}</span>
      </nav>

      <article className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <img src={type.image} alt={type.alt || type.title} />
          <span className="exc-block__cat">Safari style</span>
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">Best for: {type.bestFor}</span>
          <h1 className="exc-block__title">{type.title}</h1>
          <p className="exc-block__desc">{type.desc}</p>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>Why choose this style</h4>
              <ul>{type.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>Best matching routes</h4>
              <ul>{routes.map((route) => <li key={route.id}>{route.title}</li>)}</ul>
            </div>
          </div>
          <div className="exc-block__actions">
            <Link className="btn btn--ghost-dark" to={`/booking?type=custom&title=${encodeURIComponent(type.title)}`}>Get a quote →</Link>
            <Link className="btn btn--ghost-dark" to="/safaris">All safaris</Link>
          </div>
        </div>
      </article>

      <section className="itineraries reveal">
        <header className="itineraries__head">
          <span className="section-eyebrow">Recommended routes</span>
          <h2 className="section-title">Start with one of these safaris.</h2>
          <p className="section-lead">These routes are the closest match for this safari style. Each one opens into full details and day-by-day pacing.</p>
        </header>
        <div className="exc-grid saf-route-grid">
          {routes.map((route) => (
            <Link key={route.id} to={`/safaris/${route.id}`} className="exc-card saf-route-card" aria-label={`Explore ${route.title}`}>
              <div className="exc-card__img">
                <img src={route.image} alt={route.alt || route.title} loading="lazy" />
                <span className="exc-card__cat">{route.category}</span>
                {route.feature && <span className="exc-card__season">Most popular</span>}
              </div>
              <div className="exc-card__body">
                <span className="exc-card__eyebrow">{route.rib}</span>
                <h3 className="exc-card__title">{route.title}</h3>
                <p className="exc-card__desc">{route.intro}</p>
                <div className="exc-card__meta">
                  <span>{route.duration}</span>
                  <span>{route.from}</span>
                </div>
                <div className="exc-card__foot">
                  <span className="exc-card__price">From <strong>${route.price.toLocaleString()}</strong> {route.priceSub}</span>
                  <span className="exc-card__cta">Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="saf-cta">
        <div className="saf-cta__bg">
          <img src={type.image} alt="" />
        </div>
        <div className="saf-cta__inner">
          <h2>Want this safari style?</h2>
          <p>Tell us your dates, budget, and group size. We’ll match the right parks, camps, and flights within 24 hours.</p>
          <div className="saf-cta__btns">
            <Link className="btn btn--lg btn--accent" to={`/booking?type=custom&title=${encodeURIComponent(type.title)}`}>Get a quote →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Plan with AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
