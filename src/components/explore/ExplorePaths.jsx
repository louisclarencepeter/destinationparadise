import { Link } from 'react-router-dom';
import { EXPLORE_PATHS } from '../../data/explorePageContent.js';

export default function ExplorePaths() {
  return (
    <section className="saf-compare reveal" id="paths">
      <header className="saf-compare__head">
        <span className="section-eyebrow">Wybierz kierunek</span>
        <h2 className="section-title">Co chcesz odkryć?</h2>
        <p className="section-lead">Większość gości nie zaczyna od nazw miejsc. Najpierw wybierz typ decyzji, którą chcesz podjąć.</p>
      </header>
      <div className="explore-path-grid">
        {EXPLORE_PATHS.map((path) => (
          <Link className="explore-path-card" to={path.to} key={path.title}>
            <img src={path.image} alt="" loading="lazy" />
            <div>
              <span>{path.eyebrow}</span>
              <h3>{path.title}</h3>
              <p>{path.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
