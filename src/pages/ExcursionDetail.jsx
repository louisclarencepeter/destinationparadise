import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { EXCURSIONS } from '../data/excursionsData.js';
import '../styles/homepage.css';
import '../styles/excursions.css';

function categoryToSlug(cat) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const PRACTICAL = [
  { h: "What's always included", items: ['Hotel pickup & drop-off', 'Licensed local guide', 'Bottled water all day', 'All park & entry fees', 'Equipment provided'] },
  { h: 'Not included', items: ['Tips for guides & crew', 'Alcohol (where applicable)', 'Travel insurance', 'Spending money'] },
  { h: 'Booking & payment', items: ['Book at least 48 hours ahead', '20% deposit, balance on the day', 'Free cancellation up to 24h before', 'USD, EUR, GBP, TZS — all accepted'] },
];

function formatTierName(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

export default function ExcursionDetail() {
  const { id } = useParams();
  const excursion = EXCURSIONS.find((item) => item.id === id);

  useEffect(() => {
    if (excursion) {
      document.title = `${excursion.title} · Destination Paradise`;
    } else {
      document.title = 'Excursion Not Found · Destination Paradise';
    }
  }, [excursion]);

  if (!excursion) {
    return (
      <main className="excursions-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">Excursions</span>
            <h1 className="section-title">Excursion not found</h1>
            <p className="section-lead">That route is not in our current list. Browse all available excursions below.</p>
            <Link className="btn" to="/excursions" style={{ marginTop: '1.5rem' }}>Back to all excursions →</Link>
          </div>
        </section>
      </main>
    );
  }

  const e = excursion;
  const pricingTiers = e.pricing ? Object.entries(e.pricing).map(([key, value]) => ({
    label: formatTierName(key),
    price: value.from,
    currency: value.currency || 'USD',
  })) : [];

  return (
    <main className="excursions-page exc-detail">
      <nav className="exc-detail__crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">→</span>
        <Link to="/excursions">Excursions</Link>
        <span aria-hidden="true">→</span>
        <span>{e.title}</span>
      </nav>

      <article id={e.id} data-cat={categoryToSlug(e.category)} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={e.image} alt={e.imageNeeded ? '' : e.alt || e.title} />
          <span className="exc-block__cat" data-cat={categoryToSlug(e.category)}>{e.category}</span>
          {e.season && <span className="exc-block__season">Seasonal · {e.season}</span>}
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{e.eyebrow}</span>
          <h1 className="exc-block__title">{e.title}</h1>
          <p className="exc-block__desc">{e.intro || e.description}</p>
          {e.facts && (
            <dl className="exc-block__facts">
              {e.facts.map(([dt, dd, sub]) => (
                <div key={dt}><dt>{dt}</dt><dd>{dd}<small>{sub}</small></dd></div>
              ))}
            </dl>
          )}
          {e.cols && (
            <div className="exc-block__cols">
              {e.cols.map((col) => (
                <div className="exc-block__col" key={col.h}>
                  <h4>{col.h}</h4>
                  <ul>{col.items.map((it) => <li key={it}>{it}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
          {e.highlights && !e.cols && (
            <div className="exc-block__cols">
              <div className="exc-block__col">
                <h4>Highlights</h4>
                <ul>{e.highlights.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            </div>
          )}
          {pricingTiers.length > 0 && (
            <div className="exc-block__cols">
              <div className="exc-block__col">
                <h4>Experience pricing</h4>
                <ul>{pricingTiers.map((tier) => <li key={tier.label}>{tier.label}: from ${tier.price} {tier.currency}</li>)}</ul>
              </div>
            </div>
          )}
          <div className="exc-block__actions">
            {typeof e.price === 'number' ? (
              <span className="exc-block__price">${e.price}<small>{e.priceSub || 'per person'}</small></span>
            ) : (
              <span className="exc-block__price-note">Price on request</span>
            )}
            {e.priceNote && <span className="exc-block__price-note">{e.priceNote}</span>}
            <Link className="btn" to={`/booking?type=excursion&item=${encodeURIComponent(e.id)}`}>Book this →</Link>
            <Link className="btn btn--ghost-dark" to="/excursions">All excursions</Link>
          </div>
        </div>
      </article>

      {e.timeline && e.timeline.length > 0 && (
        <section className="exc-day" id="day">
          <div className="exc-day__head">
            <span className="section-eyebrow">Hour by hour</span>
            <h2 className="section-title">A typical day</h2>
            <p className="section-lead">Minute by minute, what you can expect. Times are a guide — we adapt to weather, tides, and the mood of the day.</p>
          </div>
          <div className="exc-day__timeline">
            {e.timeline.map(([t, h, p]) => (
              <div className="exc-day__row" key={t}>
                <div className="exc-day__time">{t}</div>
                <div className="exc-day__what"><strong>{h}</strong><p>{p}</p></div>
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
                {col.items.map((it) => (
                  <li key={it}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src={e.imageNeeded ? '/assets/images/excursions/safari-blue-sandbank.webp' : e.image} alt="" /></div>
        <div className="exc-cta__inner">
          <h2>Ready to book {e.title}?</h2>
          <p>Tell us your dates and we'll come back within 24 hours with available pickup times and a final price — no commitment.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg" to={`/booking?type=excursion&item=${encodeURIComponent(e.id)}`}>Get in touch →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Or chat with our AI planner</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
