import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';

export default function BookingSupportCta() {
  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage src="/assets/images/excursions/stone-town-old-fort.webp" alt="" /></div>
      <div className="exc-cta__inner">
        <h2>Potrzebujesz pomocy przed wysłaniem?</h2>
        <p>Otwórz planer, jeśli chcesz najpierw ułożyć trasę, albo zobacz pełną mapę i wybierz plażę, szlak safari oraz dni na wyspie.</p>
        <div className="exc-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/trip-planner">Planuj z AI</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/explore">Odkryj mapę</Link>
        </div>
      </div>
    </section>
  );
}
