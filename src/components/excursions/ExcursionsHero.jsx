import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { CATEGORIES, EXCURSIONS } from '../../data/excursionsData.js';
import { EXCURSIONS_HERO_IMAGE, MIN_EXCURSION_PRICE } from '../../data/excursionsPageContent.js';

export default function ExcursionsHero() {
  return (
    <section className="exc-hero">
      <div className="exc-hero__bg">
        <ResponsiveImage src={EXCURSIONS_HERO_IMAGE} alt="" fetchpriority="high" loading="eager" decoding="sync" />
      </div>
      <div className="exc-hero__inner">
        <span className="exc-hero__eyebrow">Zanzibar &amp; the coast · handpicked day trips</span>
        <h1 className="exc-hero__title">One island. <em>{EXCURSIONS.length}+ unforgettable journeys.</em></h1>
        <p className="exc-hero__lead">Trade resort routines for real Zanzibar — sail a traditional dhow, wander Stone Town with a local guide, snorkel Mnemba reefs, kitesurf in Paje, or join a festival in Stone Town. Every trip is small-group, story-rich, and easy to book.</p>
        <div className="exc-hero__tags" aria-label="Excursion highlights">
          <span>Hotel pickup included</span>
          <span>Private options available</span>
          <span>Local expert guides</span>
        </div>
        <div className="exc-hero__row">
          <a className="btn btn--lg" href="#list">Browse all excursions</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">Build my plan →</Link>
        </div>
        <div className="exc-hero__meta">
          <div><strong>{EXCURSIONS.length}</strong><span>Excursions</span></div>
          {MIN_EXCURSION_PRICE !== null && <div><strong>${MIN_EXCURSION_PRICE}</strong><span>From, per person</span></div>}
          <div><strong>{CATEGORIES.length}</strong><span>Categories</span></div>
          <div><strong>Private</strong><span>Options available</span></div>
        </div>
      </div>
    </section>
  );
}
