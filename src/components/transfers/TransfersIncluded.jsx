import { TRANSFERS_INCLUDED } from '../../data/transfersPageContent.js';

export default function TransfersIncluded() {
  return (
    <section className="tr-included">
      <div className="tr-included__wrap">
        <div className="tr-included__copy">
          <span className="section-eyebrow">What&apos;s included</span>
          <h2 className="section-title">An arrival service, not just transport.</h2>
          <p className="section-lead">
            Guests are buying certainty: a driver who is already there, support if a flight changes, and a calm first impression of Zanzibar.
          </p>
          <a className="btn btn--accent btn--lg" href="#transfer-types">
            Choose a route →
          </a>
        </div>
        <ul className="tr-included__list">
          {TRANSFERS_INCLUDED.map((item) => (
            <li key={item}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
