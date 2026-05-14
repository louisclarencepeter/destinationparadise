import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { safariImg } from '../../data/safarisPageContent.js';

export default function SafariCta() {
  return (
    <section className="saf-cta">
      <div className="saf-cta__bg">
        <ResponsiveImage src={safariImg('lioness-and-cub-resting.webp')} alt="" />
      </div>
      <div className="saf-cta__inner">
        <h2>Ready to plan?</h2>
        <p>Tell us when you’re free, who’s coming, and what you’re hoping for. We’ll come back within 24 hours with a real itinerary and a real price.</p>
        <div className="saf-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/booking">Get a quote →</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Or chat with our AI planner</Link>
        </div>
      </div>
    </section>
  );
}
