import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';

export default function BookingSupportCta() {
  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage src="/assets/images/excursions/stone-town-old-fort.webp" alt="" /></div>
      <div className="exc-cta__inner">
        <h2>Need help before you send it?</h2>
        <p>Open the planner if you want to shape the route first, or explore the full map to choose the right beach, safari circuit, and island days.</p>
        <div className="exc-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/trip-planner">Plan with AI</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/explore">Explore the map</Link>
        </div>
      </div>
    </section>
  );
}
