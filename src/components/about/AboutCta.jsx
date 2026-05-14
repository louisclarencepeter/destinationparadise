import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { ABOUT_CTA_IMAGE } from '../../data/aboutPageData.js';

export default function AboutCta() {
  return (
    <section className="ab-cta">
      <div className="ab-cta__bg"><ResponsiveImage src={ABOUT_CTA_IMAGE} alt="" loading="lazy" /></div>
      <div className="ab-cta__inner">
        <span className="ab-story__eyebrow ab-cta__eyebrow">Karibu</span>
        <h2>Welcome to <em>Destination Paradise</em>.</h2>
        <p>To everyone who supported this journey from the beginning — thank you. And to everyone joining us now: the vision is big, the journey is long, and we are so glad you are here at the start.</p>
        <div className="ab-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/booking">Plan your journey →</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/excursions">See our excursions</Link>
        </div>
      </div>
    </section>
  );
}
