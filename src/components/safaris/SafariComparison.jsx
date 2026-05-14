import { Link } from 'react-router-dom';
import { SAFARI_COMPARISON } from '../../data/safarisPageContent.js';

export default function SafariComparison() {
  return (
    <section className="saf-compare reveal" id="choose">
      <header className="saf-compare__head">
        <span className="section-eyebrow">Jeszcze nie wiesz?</span>
        <h2 className="section-title">Wybierz po tym, czego najbardziej chcesz.</h2>
        <p className="section-lead">Większość gości nie zna jeszcze nazw parków. Zacznij od efektu, a potem otwórz trasę, która pasuje.</p>
      </header>
      <div className="saf-compare__grid">
        {SAFARI_COMPARISON.map((item) => (
          <Link className="saf-compare__card" key={item.label} to={`/safaris/${item.slug}`} aria-label={`Zobacz ${item.pick}`}>
            <span>{item.label}</span>
            <h3>{item.pick}</h3>
            <p>{item.note}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
