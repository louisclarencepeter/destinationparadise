import { Link } from 'react-router-dom';
import { ArrowIcon } from './Icons.jsx';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { destinationParadiseSafariPricing } from '../../data/safariPricing.js';
import { nextLevelSafariProducts } from '../../data/nextLevelSafariProducts.js';

const SAFARI_FEATURES = [
  {
    slug: 'tarangire-day-trip',
    image: '/assets/images/safaris/buffalo-herd-close.webp',
    label: 'Szybkie safari',
    text: 'Przyleć na intensywny dzień z dziką przyrodą prosto z Zanzibaru: opłaty parkowe, lunch, przewodnik i game drive są po naszej stronie.',
  },
  {
    slug: 'serengeti-migration',
    image: '/assets/images/safaris/serval-in-grass.webp',
    label: 'Safari migracyjne',
    text: 'Sprawdzona trasa przez Serengeti: równiny migracji, wielkie koty, obozy, posiłki i przejazdy safari z przewodnikiem.',
    featured: true,
  },
  {
    slug: 'nyerere-selous',
    image: '/assets/images/safaris/raptor-on-log.webp',
    label: 'Południowy szlak',
    text: 'Dziksza trasa z przelotem: safari łodzią, piesze safari, luksusowy obóz, przewodnik i loty krajowe.',
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
        <span className="section-eyebrow">Dzika przyroda kontynentu</span>
        <h2 className="section-title">{totalSafaris} pomysłów na safari</h2>
        <p className="section-lead">Wybierz klasyczną trasę północną, dzikie południe z przelotem, szybkie safari z Zanzibaru albo podróż tematyczną: fotografia, rodzina, kultura, luksus, ptaki, szympansy czy sezon migracji.</p>
        <ul className="safaris__modes">
          <li><span className="safaris__mode-tag">Klasyczne trasy</span> Serengeti, Ngorongoro, Tarangire, Nyerere, Ruaha, Mahale i Katavi.</li>
          <li><span className="safaris__mode-tag safaris__mode-tag--accent">Z przelotem</span> Krótkie safari z Zanzibaru dla gości, którzy są już na wyspie.</li>
          <li><span className="safaris__mode-tag">Specjalne style</span> Podróż poślubna, rodzina, fotografia, piesze safari, ptaki i połączenie buszu z plażą.</li>
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
                <span className="safari-card__from">Od <strong>${trip.price.toLocaleString()}</strong> za osobę</span>
                <Link className="ex-card__link" to={`/safaris/${trip.slug}`}>Zobacz szczegóły <ArrowIcon size={14} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="excursions__more">
        <Link className="btn btn--on-light" to="/safaris">Zobacz wszystkie safari <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
