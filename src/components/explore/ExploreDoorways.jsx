import {
  MIN_EXPLORE_EXCURSION_PRICE,
  MIN_PACKAGE_PRICE,
  MIN_SAFARI_PRICE,
} from '../../data/explorePageContent.js';

export default function ExploreDoorways() {
  return (
    <section className="saf-steps reveal">
      <header className="saf-steps__head">
        <span className="section-eyebrow">Quick guide</span>
        <h2 className="section-title">Pick the right doorway.</h2>
      </header>
      <div className="saf-steps__grid">
        <article className="saf-step"><span>01</span><h3>Packages</h3><p>Best when you want one quote and the whole trip joined up. From ${MIN_PACKAGE_PRICE.toLocaleString()} pp.</p></article>
        <article className="saf-step"><span>02</span><h3>Excursions</h3><p>Best when your hotel is booked and you need day trips. From ${MIN_EXPLORE_EXCURSION_PRICE} pp.</p></article>
        <article className="saf-step"><span>03</span><h3>Safaris</h3><p>Best when mainland wildlife is the anchor. Core routes from ${MIN_SAFARI_PRICE.toLocaleString()} pp.</p></article>
      </div>
    </section>
  );
}
