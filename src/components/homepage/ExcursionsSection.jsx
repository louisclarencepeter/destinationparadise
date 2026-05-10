import { Link } from 'react-router-dom';
import { ArrowIcon } from './Icons.jsx';
import ResponsiveImage from '../ResponsiveImage.jsx';

export default function ExcursionsSection({ tweaks, excursions }) {
  return (
    <section className="excursions reveal" id="excursions" data-layout={tweaks.layout}>
      <header className="excursions__head">
        <span className="section-eyebrow">Roaming Retreats</span>
        <h2 className="section-title">Excursions crafted by locals</h2>
        <p className="section-lead">Hand-built island days with traditional boats, clear reefs, spice farms, and guides who grew up on these shores.</p>
        <ul className="excursions__modes">
          <li><span className="excursions__mode-tag">Ocean</span> Dhow sailing, sandbanks, snorkeling, dolphins, and reef days.</li>
          <li><span className="excursions__mode-tag excursions__mode-tag--accent">Culture</span> Stone Town, spice farms, Swahili food, dhow-building, and village visits.</li>
          <li><span className="excursions__mode-tag">Nature</span> Jozani forest, tortoises, mangroves, turtles, and family-friendly wildlife stops.</li>
        </ul>
      </header>
      <div className="excursions__grid">
        {excursions.map((t) => (
          <Link className="ex-card" key={t.id} to={`/excursions/${t.id}`} aria-label={`Explore ${t.title}`}>
            <div className="ex-card__img">
              <ResponsiveImage src={t.image} alt={t.title} loading="lazy" decoding="async" sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 380px" />
              <span className="ex-card__badge">{t.duration}</span>
              {typeof t.price === 'number' && (
                <div className="ex-card__price">
                  <div className="ex-card__price-from">From</div>
                  <div className="ex-card__price-num">${t.price}</div>
                </div>
              )}
            </div>
            <div className="ex-card__body">
              <div className="ex-card__meta">
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" />
                  </svg> {t.from}
                </span>
                <span className="dot"></span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg> {t.group}
                </span>
              </div>
              <h3 className="ex-card__title">{t.title}</h3>
              <p className="ex-card__text">{t.description}</p>
              <span className="ex-card__link">View details <ArrowIcon size={15} /></span>
            </div>
          </Link>
        ))}
      </div>
      <div className="excursions__more">
        <Link className="btn btn--on-light" to="/excursions">View all excursions <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
