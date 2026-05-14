import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXCURSIONS } from '../../data/excursionsData.js';
import { destinationParadisePackages } from '../../data/destinationParadisePackages.js';
import { destinationParadiseSafariPricing } from '../../data/safariPricing.js';
import { EXPLORE_HERO_IMAGE, MIN_PACKAGE_PRICE } from '../../data/explorePageContent.js';

export default function ExploreHero() {
  return (
    <section className="exc-hero explore-hero">
      <div className="exc-hero__bg">
        <ResponsiveImage src={EXPLORE_HERO_IMAGE} alt="" fetchpriority="high" loading="eager" decoding="sync" />
      </div>
      <div className="exc-hero__inner">
        <span className="exc-hero__eyebrow">Explore Zanzibar &amp; Tanzania</span>
        <h1 className="exc-hero__title">Start with the place, <em>or the kind of trip.</em></h1>
        <p className="exc-hero__lead">Use this page as the map: packages if you want everything arranged, excursions if you&rsquo;re already on Zanzibar, safaris if wildlife is the goal, and the planner if you&rsquo;re not sure yet.</p>
        <div className="exc-hero__row">
          <a className="btn btn--lg" href="#paths">Choose a path</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">Plan with AI</Link>
        </div>
        <div className="exc-hero__meta">
          <div><strong>{destinationParadisePackages.length}</strong><span>Packages</span></div>
          <div><strong>{destinationParadiseSafariPricing.length}</strong><span>Core safaris</span></div>
          <div><strong>{EXCURSIONS.length}</strong><span>Excursions</span></div>
          <div><strong>${MIN_PACKAGE_PRICE.toLocaleString()}</strong><span>Package from</span></div>
        </div>
      </div>
    </section>
  );
}
