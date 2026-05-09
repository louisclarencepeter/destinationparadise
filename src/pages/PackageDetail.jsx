import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { PACKAGES } from './Packages.jsx';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

export default function PackageDetail() {
  const { id } = useParams();
  const pkg = PACKAGES.find((item) => item.id === id);

  useEffect(() => {
    if (pkg) document.title = `${pkg.title} · Destination Paradise`;
  }, [pkg]);

  if (!pkg) {
    return (
      <main className="excursions-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">Packages</span>
            <h1 className="section-title">Package not found</h1>
            <p className="section-lead">That package is not in our current list. Browse all packages below.</p>
            <Link className="btn btn--ghost-dark" to="/packages" style={{ marginTop: '1.5rem' }}>Back to packages →</Link>
          </div>
        </section>
      </main>
    );
  }

  const audience = pkg.targetAudience || pkg.idealFor || [];
  const upsells = pkg.upsells || [];
  const routeItems = pkg.route || pkg.destinations || [];
  const contextItems = [
    pkg.split && `Trip split: ${pkg.split}`,
    pkg.focus && `Focus: ${pkg.focus}`,
    pkg.season && `Season: ${pkg.season}`,
    pkg.benchmark,
  ].filter(Boolean);

  return (
    <main className="excursions-page exc-detail package-detail">
      <nav className="exc-detail__crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">→</span>
        <Link to="/packages">Packages</Link>
        <span aria-hidden="true">→</span>
        <span>{pkg.title}</span>
      </nav>

      <article id={pkg.id} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={pkg.image} alt="" />
          <span className="exc-block__cat">{pkg.category}</span>
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{pkg.duration}</span>
          <h1 className="exc-block__title">{pkg.title}</h1>
          <p className="exc-block__desc">{pkg.description}</p>
          <dl className="exc-block__facts">
            <div><dt>Duration</dt><dd>{pkg.duration}<small>Flexible pacing</small></dd></div>
            <div><dt>Category</dt><dd>{pkg.category}<small>Package style</small></dd></div>
            <div><dt>Price</dt><dd>{pkg.priceLabel}<small>{pkg.priceSub}</small></dd></div>
            <div><dt>Quote</dt><dd>24h<small>Custom proposal</small></dd></div>
          </dl>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>Included</h4>
              <ul>{pkg.includes.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>{audience.length ? 'Ideal for' : 'Route notes'}</h4>
              <ul>{(audience.length ? audience : routeItems).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          {(pkg.priceTiers || routeItems.length > 0 || contextItems.length > 0 || upsells.length > 0) && (
            <div className="exc-block__cols">
              {pkg.priceTiers && (
                <div className="exc-block__col">
                  <h4>Starting prices</h4>
                  <ul>{pkg.priceTiers.map((tier) => <li key={tier.label}>{tier.label}: ${tier.price.toLocaleString()}{tier.suffix || ''}</li>)}</ul>
                </div>
              )}
              {routeItems.length > 0 && audience.length > 0 && (
                <div className="exc-block__col">
                  <h4>{pkg.destinations ? 'Destination options' : 'Route'}</h4>
                  <ul>{routeItems.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
              {contextItems.length > 0 && (
                <div className="exc-block__col">
                  <h4>Planning notes</h4>
                  <ul>{contextItems.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
              {upsells.length > 0 && (
                <div className="exc-block__col">
                  <h4>Optional upgrades</h4>
                  <ul>{upsells.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
            </div>
          )}
          <div className="exc-block__actions">
            <span className="exc-block__price">{pkg.priceLabel}<small>{pkg.priceSub}</small></span>
            <span className="exc-block__price-note">Final package price depends on dates, hotel level, transfers, and availability.</span>
            <Link className="btn" to={`/booking?type=package&item=${encodeURIComponent(pkg.slug)}`}>Build this package →</Link>
            <Link className="btn btn--ghost-dark" to="/packages">All packages</Link>
          </div>
        </div>
      </article>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src={pkg.image} alt="" /></div>
        <div className="exc-cta__inner">
          <h2>Ready to plan {pkg.title}?</h2>
          <p>Tell us your dates, guest count, and comfort level. We’ll shape the package and quote it properly.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to={`/booking?type=package&item=${encodeURIComponent(pkg.slug)}`}>Get a quote →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Plan with AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
