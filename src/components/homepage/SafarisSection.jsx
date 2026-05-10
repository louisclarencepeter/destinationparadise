import { Link } from 'react-router-dom';
import { ArrowIcon } from './Icons.jsx';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { destinationParadiseSafariPricing } from '../../data/safariPricing.js';
import { nextLevelSafariProducts } from '../../data/nextLevelSafariProducts.js';

const SAFARI_FEATURES = [
  {
    slug: 'tarangire-day-trip',
    image: '/assets/images/safaris/buffalo-herd-close.webp',
    label: 'Quick safari',
    text: 'Fly in for a fast wildlife day from Zanzibar, with park fees, lunch, guide, and game drive handled.',
  },
  {
    slug: 'serengeti-migration',
    image: '/assets/images/safaris/serval-in-grass.webp',
    label: 'Migration safari',
    text: 'A strong-selling Serengeti route for migration plains, big cats, camps, meals, and guided game drives.',
    featured: true,
  },
  {
    slug: 'nyerere-selous',
    image: '/assets/images/safaris/raptor-on-log.webp',
    label: 'Southern circuit',
    text: 'A wilder fly-in route with boat safari, walking safari, luxury camp, guide, and domestic flights.',
  },
];

const safariCards = SAFARI_FEATURES.map((feature) => {
  const pricing = destinationParadiseSafariPricing.find((item) => item.slug === feature.slug);
  return {
    ...feature,
    ...pricing,
    price: pricing?.recommendedPublicPrice.lowSeason,
  };
}).filter((item) => item.title);

export default function SafarisSection() {
  const totalSafaris = destinationParadiseSafariPricing.length + nextLevelSafariProducts.length;

  return (
    <section className="safaris reveal" id="safaris">
      <header className="safaris__head">
        <span className="section-eyebrow">Mainland wildlife</span>
        <h2 className="section-title">{totalSafaris} safari starting points</h2>
        <p className="section-lead">Choose a classic northern route, a southern wilderness fly-in, a quick safari from Zanzibar, or a special-interest trip for photography, family, culture, luxury, birds, chimps, and migration seasons.</p>
        <ul className="safaris__modes">
          <li><span className="safaris__mode-tag">Classic routes</span> Serengeti, Ngorongoro, Tarangire, Nyerere, Ruaha, Mahale and Katavi.</li>
          <li><span className="safaris__mode-tag safaris__mode-tag--accent">Fly-in</span> Short safaris from Zanzibar for guests already on the island.</li>
          <li><span className="safaris__mode-tag">Specialists</span> Honeymoon, family, photography, walking, birding, and bush-to-beach styles.</li>
        </ul>
      </header>
      <div className="safaris__grid">
        {safariCards.map((trip) => (
          <article className={`safari-card${trip.featured ? ' safari-card--feature' : ''}`} key={trip.slug}>
            <div className="safari-card__img">
              <ResponsiveImage src={trip.image} alt="" loading="lazy" decoding="async" sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 380px" />
              <span className="safari-card__nights">{trip.label}</span>
            </div>
            <div className="safari-card__body">
              <h3>{trip.title}</h3>
              <p>{trip.text}</p>
              <div className="safari-card__foot">
                <span className="safari-card__from">From <strong>${trip.price.toLocaleString()}</strong> pp</span>
                <Link className="ex-card__link" to={`/safaris/${trip.slug}`}>View details <ArrowIcon size={14} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="excursions__more">
        <Link className="btn btn--on-light" to="/safaris">View all safaris <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
