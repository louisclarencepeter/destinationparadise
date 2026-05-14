import { Link } from 'react-router-dom';
import { TRANSFER_PRODUCTS } from '../../data/transferProducts.js';

const TRANSFER_ICONS = {
  plane: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16 3 21l5-9-5-9 18 5-8 4 8 4Z" />
    </svg>
  ),
  coast: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19c4-6 9.5-10.5 16-13" />
      <path d="M5 13c2 1.5 4.5 2.2 7.2 2.1" />
      <path d="M13 6c.5 2.9 1.7 5.2 3.5 7" />
    </svg>
  ),
  north: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 19h18" />
      <path d="M5 19c2.4-5.8 6.1-9.7 11-11.8" />
      <path d="M16 7.2c2.5 2.1 3.6 5 3.2 8.8" />
      <path d="M10 11c1.6 1.3 3.5 2 5.8 2" />
    </svg>
  ),
  hotel: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  group: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  vip: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 14.6 8.5 21 9.3l-4.7 4.5 1.2 6.2L12 17l-5.5 3 1.2-6.2L3 9.3l6.4-.8L12 3Z" />
    </svg>
  ),
};

export default function TransfersTypes() {
  return (
    <section className="tr-types" id="transfer-types">
      <header className="tr-types__head">
        <span className="section-eyebrow">Route pricing</span>
        <h2 className="section-title">Private transfers, priced clearly by route.</h2>
        <p className="section-lead">
          Lead with a private vehicle, then upgrade to Premium SUV or VIP concierge when the arrival should feel part of the holiday.
        </p>
      </header>
      <div className="tr-types__grid">
        {TRANSFER_PRODUCTS.map((type) => (
          <article className={`tr-card ${type.featured ? 'tr-card--feature' : ''}`} key={type.slug} id={type.slug}>
            <div className="tr-card__icon">{TRANSFER_ICONS[type.icon]}</div>
            <div className="tr-card__body">
              <span className="tr-card__sub">{type.duration}</span>
              <h3 className="tr-card__title">{type.title}</h3>
              <p className="tr-card__desc">{type.description}</p>
              <ul className="tr-card__pricing">
                {type.pricing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ul className="tr-card__details">
                {type.details.map((d) => (
                  <li key={d}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="tr-card__foot">
              <span className="tr-card__price">{type.priceSummary}</span>
              <Link
                className="btn btn--accent"
                to={`/booking?type=transfer&item=${type.slug}#booking-details`}
              >
                Book this transfer
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
