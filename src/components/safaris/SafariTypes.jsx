import { Link } from 'react-router-dom';
import { SAFARI_TYPES } from '../../data/safariPageData.js';

export default function SafariTypes() {
  return (
    <section className="saf-types reveal" id="safari-types">
      <header className="saf-types__head">
        <span className="section-eyebrow">Ways to travel</span>
        <h2 className="section-title">Different safari styles for different travellers.</h2>
        <p className="section-lead">From classic game drives and fly-in circuits to walking, boat, family, and bush-beach combinations — we tailor each route to your travel style.</p>
        <ul className="saf-types__modes">
          <li>
            <span className="saf-types__mode-tag">Dedicated safari</span>
            Safari-only booking: arrive in Arusha and we’ll pick you up for the northern or southern circuit.
          </li>
          <li>
            <span className="saf-types__mode-tag saf-types__mode-tag--accent">Last-minute</span>
            Already on Zanzibar? We can run 1 day, 1 night, 2 nights, or longer safari options — fast.
          </li>
          <li>
            <span className="saf-types__mode-tag">In a package</span>
            Combined with hotels and excursions in one seamless itinerary.
          </li>
        </ul>
      </header>
      <div className="saf-types__grid">
        {SAFARI_TYPES.map((item) => (
          <Link className="saf-type-card" key={item.title} to={`/safaris/types/${item.id}`} aria-label={`Explore ${item.title}`}>
            <div className="saf-type-card__media">
              <img src={item.image} alt={item.alt} loading="lazy" />
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <div className="saf-type-card__foot">
              <span className="saf-type-card__meta">Best for: {item.bestFor}</span>
              <span className="saf-type-card__cta">Explore →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
