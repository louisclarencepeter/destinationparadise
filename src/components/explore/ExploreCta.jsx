import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXPLORE_CTA_IMAGE } from '../../data/explorePageContent.js';

export default function ExploreCta() {
  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage src={EXPLORE_CTA_IMAGE} alt="" /></div>
      <div className="exc-cta__inner">
        <h2>Want us to map the right route?</h2>
        <p>Tell us the places you like, your travel dates, and your pace. We&rsquo;ll connect the best packages, excursions, and safaris into one clear plan.</p>
        <div className="exc-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/booking">Get a quote →</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Plan with AI</Link>
        </div>
      </div>
    </section>
  );
}
