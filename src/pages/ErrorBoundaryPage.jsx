import { Link } from 'react-router-dom';
import '../styles/error-boundary.css';

const isDev = import.meta.env.DEV;

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
