import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXCURSIONS_CTA_IMAGE } from '../../data/excursionsPageContent.js';

export default function ExcursionsCta() {
  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage src={EXCURSIONS_CTA_IMAGE} alt="" /></div>
      <div className="exc-cta__inner">
        <h2>Ready to lock a date?</h2>
        <p>Tell us when you&apos;re here and which excursions caught your eye. We&apos;ll come back within 24 hours with available dates, pickup times and a final price — no commitment, no chatbot.</p>
        <div className="exc-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/booking">Get in touch →</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Or chat with our AI planner</Link>
        </div>
      </div>
    </section>
  );
}
