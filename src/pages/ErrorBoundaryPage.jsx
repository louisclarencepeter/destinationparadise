import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants/contactInfo.js';
import '../styles/error-boundary.css';

const isDev = import.meta.env.DEV;
const formatPhone = (phone) => phone.replace(/^\+255(\d{3})(\d{3})(\d{3})$/, '+255 $1 $2 $3');

function CompassIcon() {
  return (
    <svg className="error-page__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="2" />
      <path d="M29.9 11.8 25.8 25.8 12 30.2l4.2-14L29.9 11.8Z" fill="currentColor" opacity="0.92" />
      <path d="M25.8 25.8 36 36 12 30.2l13.8-4.4Z" fill="currentColor" opacity="0.42" />
      <path d="M24 5v4M24 39v4M5 24h4M39 24h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function ErrorBoundaryPage({ error, onReset }) {
  return (
    <main className="error-page" role="alert">
      <section className="error-page__panel" aria-labelledby="error-title">
        <div className="error-page__mark">
          <CompassIcon />
        </div>
        <span className="error-page__eyebrow">Something went wrong</span>
        <h1 className="error-page__title" id="error-title">We lost the route for a moment</h1>
        <p className="error-page__lead">
          The page hit an unexpected snag. Try again, or return to the homepage and keep planning from there.
        </p>
        <div className="error-page__actions" aria-label="Recovery actions">
          <button className="btn error-page__button" type="button" onClick={onReset}>
            Try again
          </button>
          <Link className="btn btn--ghost-dark error-page__button" to="/" onClick={onReset}>
            Back to home
          </Link>
        </div>
        <aside className="error-page__contact" aria-label="Destination Paradise contact details">
          <p className="error-page__contact-intro">Need us directly? Reach the team here.</p>
          <div className="error-page__contact-list">
            <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
            {CONTACT_INFO.phones.map((phone) => (
              <a key={phone} href={`tel:${phone}`}>{formatPhone(phone)}</a>
            ))}
            <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
          <p className="error-page__contact-meta">{CONTACT_INFO.hours}</p>
        </aside>
        {isDev && error ? (
          <details className="error-page__details">
            <summary>Error details</summary>
            <pre>{`${error.name || 'Error'}: ${error.message || 'Unknown error'}`}</pre>
          </details>
        ) : null}
      </section>
    </main>
  );
}
