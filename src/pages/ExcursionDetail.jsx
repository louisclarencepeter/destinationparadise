import { Link, useParams } from 'react-router-dom';
import { EXCURSIONS } from '../data/excursionsData.js';
import '../styles/homepage.css';

export default function ExcursionDetail() {
  const { id } = useParams();
  const excursion = EXCURSIONS.find((item) => item.id === id);

  if (!excursion) {
    return (
      <main className="standalone-page">
        <section className="standalone-page__section standalone-page__section--narrow">
          <header className="standalone-page__head">
            <span className="section-eyebrow">Excursions</span>
            <h1 className="section-title">Excursion not found</h1>
            <p className="section-lead">That route is not in our current list yet. Browse all available excursions below.</p>
          </header>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link className="btn" to="/excursions">Back to all excursions</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="standalone-page">
      <section className="standalone-page__section">
        <header className="standalone-page__head">
          <span className="section-eyebrow">{excursion.category}</span>
          <h1 className="section-title">{excursion.title}</h1>
          <p className="section-lead">{excursion.description}</p>
        </header>

        <article className="standalone-card" style={{ maxWidth: 980, margin: '0 auto' }}>
          <img
            src={excursion.image}
            alt={excursion.title}
            style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 12 }}
          />

          <div className="standalone-card__foot" style={{ marginTop: '1rem' }}>
            <span><strong>Duration:</strong> {excursion.duration}</span>
            <span><strong>Group:</strong> {excursion.group}</span>
            <span><strong>From:</strong> {excursion.from}</span>
            <span><strong>Price:</strong> ${excursion.price} pp</span>
          </div>

          <div>
            <h2 style={{ margin: '1rem 0 .5rem', fontFamily: 'var(--dp-font-sans)', color: 'var(--ink)' }}>Highlights</h2>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)' }}>
              {(excursion.highlights || []).map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link className="btn" to="/#contact">Book this excursion</Link>
            <Link className="btn btn--on-light" to="/excursions">View all excursions</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
