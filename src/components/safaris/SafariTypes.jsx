import { Link } from 'react-router-dom';
import { SAFARI_TYPES } from '../../data/safariPageData.js';

export default function SafariTypes() {
  return (
    <section className="saf-types reveal" id="safari-types">
      <header className="saf-types__head">
        <span className="section-eyebrow">Style podróży</span>
        <h2 className="section-title">Różne safari dla różnych podróżników.</h2>
        <p className="section-lead">Od klasycznych game drive i tras z przelotami po safari piesze, łodzią, rodzinne oraz połączenia safari z plażą - każdą trasę dopasowujemy do Twojego stylu.</p>
        <ul className="saf-types__modes">
          <li>
            <span className="saf-types__mode-tag">Tylko safari</span>
            Przylatujesz do Arushy, a my odbieramy Cię na północny albo południowy szlak.
          </li>
          <li>
            <span className="saf-types__mode-tag saf-types__mode-tag--accent">Last minute</span>
            Jesteś już na Zanzibarze? Możemy szybko zorganizować safari na 1 dzień, 1 noc, 2 noce albo dłużej.
          </li>
          <li>
            <span className="saf-types__mode-tag">W pakiecie</span>
            Połączone z hotelami i wycieczkami w jednym płynnym planie.
          </li>
        </ul>
      </header>
      <div className="saf-types__grid">
        {SAFARI_TYPES.map((item) => (
          <Link className="saf-type-card" key={item.title} to={`/safaris/types/${item.id}`} aria-label={`Zobacz ${item.title}`}>
            <div className="saf-type-card__media">
              <img src={item.image} alt={item.alt} loading="lazy" />
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <div className="saf-type-card__foot">
              <span className="saf-type-card__meta">Najlepsze dla: {item.bestFor}</span>
              <span className="saf-type-card__cta">Zobacz →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
