import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { safariImg } from '../../data/safarisPageContent.js';

export default function SafariHero({ safariCount, minSafariPrice }) {
  return (
    <section className="saf-hero">
      <div className="saf-hero__bg">
        <ResponsiveImage src={safariImg('male-lion-in-grass.webp')} alt="" />
      </div>
      <div className="saf-hero__inner">
        <span className="saf-hero__eyebrow">Mainland Tanzania · the heart of what we do</span>
        <h1 className="saf-hero__title">Where the wild things <em>still</em> are.</h1>
        <p className="saf-hero__lead">
          From the Serengeti’s rolling plains to the Ngorongoro Crater’s lost world, we run small-group safaris with the rangers, pilots, and lodge owners we’ve known for years. No bus tours. No half-truths. Just the bush, well done.
        </p>
        <div className="saf-hero__cta">
          <a className="btn btn--lg" href="#itineraries">Browse all safaris</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">Plan with AI →</Link>
        </div>
        <div className="saf-hero__stats">
          <div><strong>{safariCount}</strong><span>Safaris</span></div>
          <div><strong>2.0M</strong><span>Wildebeest</span></div>
          <div><strong>${minSafariPrice.toLocaleString()}</strong><span>From, per person</span></div>
          <div><strong>3</strong><span>Safari circuits</span></div>
        </div>
      </div>
    </section>
  );
}
