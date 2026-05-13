import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { ALL_SAFARI_PRODUCTS, INCLUDED_LIST } from '../data/safariPageData.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

const PRACTICAL = [
  { h: "What's always included", items: ['Bush flights & transfers', 'Park and conservation fees', 'Professional safari guide', 'Full board at camp or lodge'] },
  { h: 'Not included', items: ['International flights', 'Travel insurance', 'Tips for guides and camp staff', 'Premium drinks unless stated'] },
  { h: 'Booking & payment', items: ['Best booked 2-6 months ahead', 'Deposit confirms lodges and flights', 'Final balance before travel', 'USD, EUR, GBP, TZS accepted'] },
];

function cleanInclude(item = '') {
  return item.replace(/^✓\s*/, '').trim();
}

export default function SafariDetail() {
  const { id } = useParams();
  const safari = ALL_SAFARI_PRODUCTS.find((item) => item.id === id);

  useEffect(() => {
    if (safari) {
      document.title = `${safari.title} · Destination Paradise`;
    } else {
      document.title = 'Safari Not Found · Destination Paradise';
    }
  }, [safari]);

  if (!safari) {
    return (
      <main className="safaris-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">Safaris</span>
            <h1 className="section-title">Safari not found</h1>
            <p className="section-lead">That route is not in our current list. Browse all available safaris below.</p>
            <Link className="btn btn--ghost-dark" to="/safaris" style={{ marginTop: '1.5rem' }}>Back to all safaris →</Link>
          </div>
        </section>
      </main>
    );
  }

  const included = safari.includesList || safari.highlights || safari.includes.split('·').map(cleanInclude);
  const price = safari.publicPrice;
  const upsells = safari.upsells || [];

  return (
    <main className="safaris-page exc-detail saf-detail">
      <nav className="exc-detail__crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">→</span>
        <Link to="/safaris">Safaris</Link>
        <span aria-hidden="true">→</span>
        <span>{safari.title}</span>
      </nav>

      <article id={safari.id} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={safari.image} alt={safari.alt || safari.title} />
          <span className="exc-block__cat">{safari.category}</span>
          {safari.feature && <span className="exc-block__season">Most popular</span>}
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{safari.rib}</span>
          <h1 className="exc-block__title">{safari.title}</h1>
          <p className="exc-block__desc">{safari.intro}</p>
          <dl className="exc-block__facts">
            <div><dt>Duration</dt><dd>{safari.duration}<small>Route length</small></dd></div>
            <div><dt>Starts from</dt><dd>{safari.from}<small>Flights can be adjusted</small></dd></div>
            <div><dt>Style</dt><dd>{safari.positioning || safari.category}<small>Safari type</small></dd></div>
            <div>
              <dt>Price</dt>
              <dd>
                ${price ? price.lowSeason.toLocaleString() : safari.price.toLocaleString()}
                {price && `-$${price.peakSeason.toLocaleString()}`}
                <small>{price?.unit || safari.priceSub}</small>
              </dd>
            </div>
          </dl>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>{safari.productType ? 'Highlights' : 'Included in this route'}</h4>
              <ul>{included.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>{safari.idealFor?.length ? 'Ideal for' : 'Typical safari inclusions'}</h4>
              <ul>{(safari.idealFor?.length ? safari.idealFor : INCLUDED_LIST.slice(0, 4)).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          {upsells.length > 0 && (
            <div className="exc-block__cols">
              <div className="exc-block__col">
                <h4>Optional upgrades</h4>
                <ul>{upsells.map((item) => <li key={item.name}>{item.name} · +${item.price.toLocaleString()}</li>)}</ul>
              </div>
            </div>
          )}
          <div className="exc-block__actions">
            <span className="exc-block__price">
              ${price ? price.lowSeason.toLocaleString() : safari.price.toLocaleString()}
              <small>{price ? `low season · peak from $${price.peakSeason.toLocaleString()}` : safari.priceSub}</small>
            </span>
            <span className="exc-block__price-note">Final price depends on season, camp level, and flight availability.</span>
            <Link className="btn" to={`/booking?type=safari&item=${encodeURIComponent(safari.id)}`}>Book this route →</Link>
            <Link className="btn btn--ghost-dark" to="/safaris">All safaris</Link>
          </div>
        </div>
      </article>

      {safari.days?.length > 0 && (
        <section className="exc-day" id="route">
          <div className="exc-day__head">
            <span className="section-eyebrow">Day by day</span>
            <h2 className="section-title">A typical route</h2>
            <p className="section-lead">This is the current route sketch. We adjust flights, camps, and pacing around your dates and travel style.</p>
          </div>
          <div className="exc-day__timeline">
            {safari.days.map((day) => (
              <div className="exc-day__row" key={day.d}>
                <div className="exc-day__time">{day.d}</div>
                <div className="exc-day__what"><strong>{day.h}</strong><p>{day.p}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="exc-prac">
        <div className="exc-prac__grid">
          {PRACTICAL.map((col) => (
            <div className="exc-prac__col" key={col.h}>
              <h4>{col.h}</h4>
              <ul>
                {col.items.map((item) => (
                  <li key={item}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="saf-cta">
        <div className="saf-cta__bg">
          <ResponsiveImage src={safari.image} alt="" />
        </div>
        <div className="saf-cta__inner">
          <h2>Ready to plan {safari.title}?</h2>
          <p>Tell us your dates, group size, and preferred comfort level. We’ll come back within 24 hours with a real itinerary and a real price.</p>
          <div className="saf-cta__btns">
            <Link className="btn btn--lg btn--accent" to={`/booking?type=safari&item=${encodeURIComponent(safari.id)}`}>Get a quote →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Or chat with our AI planner</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
