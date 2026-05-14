import { TRANSFERS_INCLUDED } from '../../data/transfersPageContent.js';

export default function TransfersIncluded() {
  return (
    <section className="tr-included">
      <div className="tr-included__wrap">
        <div className="tr-included__copy">
          <span className="section-eyebrow">Co jest w cenie</span>
          <h2 className="section-title">Obsługa przyjazdu, nie tylko transport.</h2>
          <p className="section-lead">
            Goście kupują pewność: kierowcę, który już czeka, wsparcie przy zmianie lotu i spokojne pierwsze wrażenie z Zanzibaru.
          </p>
          <a className="btn btn--accent btn--lg" href="#transfer-types">
            Wybierz trasę →
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
