import { Link } from 'react-router-dom';
import { ArrowIcon } from './Icons.jsx';
import { SAFARI_TRIPS } from '../../data/safariAssets.js';

export default function SafarisSection() {
  return (
    <section className="safaris reveal" id="safaris">
      <header className="safaris__head">
        <span className="section-eyebrow">Northern &amp; Southern Circuits</span>
        <h2 className="section-title">Safaris in Tanzania</h2>
        <p className="section-lead">Three ways in: book a dedicated safari and fly straight to Kilimanjaro or Dar; grab a last-minute trip while you're already on Zanzibar; or roll one into a multi-stop package. We handle bush flights, lodges and rangers — you bring binoculars.</p>
        <ul className="safaris__modes">
          <li><span className="safaris__mode-tag">Standalone</span> Fly in from anywhere — northern or southern circuit.</li>
          <li><span className="safaris__mode-tag safaris__mode-tag--accent">Last-minute</span> Already on Zanzibar? We'll piece a 3–5 night trip together fast.</li>
          <li><span className="safaris__mode-tag">In a package</span> Bundled with hotels and excursions — see Packages below.</li>
        </ul>
      </header>
      <div className="safaris__grid">
        {SAFARI_TRIPS.map((trip) => (
          <article className={`safari-card${trip.featured ? ' safari-card--feature' : ''}`} key={trip.id}>
            <div className="safari-card__img">
              <img src={trip.image} alt={trip.imageAlt} loading="lazy" />
              <span className="safari-card__nights">{trip.nights}</span>
            </div>
            <div className="safari-card__body">
              <h3>{trip.title}</h3>
              <p>{trip.description}</p>
              <div className="safari-card__foot">
                <span className="safari-card__from">From <strong>{trip.price}</strong> pp</span>
                <Link className="ex-card__link" to="/safaris">View itinerary <ArrowIcon size={14} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
