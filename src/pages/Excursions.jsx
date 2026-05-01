import { Link } from 'react-router-dom';
import { EXCURSIONS } from '../data/excursionsData.js';
import '../styles/homepage.css';

export default function Excursions() {
  return (
    <main className="standalone-page">
      <section className="standalone-page__section">
        <header className="standalone-page__head">
          <span className="section-eyebrow">Roaming Retreats</span>
          <h1 className="section-title">Excursions</h1>
          <p className="section-lead">Choose from our curated Zanzibar excursions, then open any trip for details and booking.</p>
        </header>

        <div className="standalone-card-grid">
          {EXCURSIONS.map((trip) => (
            <article className="standalone-card" key={trip.id}>
              <img src={trip.image} alt={trip.title} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 12 }} />
              <span className="standalone-card__eyebrow">{trip.duration}</span>
              <h2>{trip.title}</h2>
              <p>{trip.description}</p>
              <div className="standalone-card__foot">
                <span>From <strong>${trip.price}</strong> pp</span>
                <Link to={`/excursions/${trip.id}`}>View details</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
