import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowIcon } from './Icons.jsx';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { destinationParadiseSafariPricing } from '../../data/safariPricing.js';
import { nextLevelSafariProducts } from '../../data/nextLevelSafariProducts.js';
import { useCurrency } from '../../context/useCurrency.js';

const SAFARI_FEATURES = [
  {
    slug: 'tarangire-day-trip',
    image: '/assets/images/safaris/buffalo-herd-close.webp',
  },
  {
    slug: 'serengeti-migration',
    image: '/assets/images/safaris/serval-in-grass.webp',
    featured: true,
  },
  {
    slug: 'nyerere-selous',
    image: '/assets/images/safaris/raptor-on-log.webp',
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
  const { t } = useTranslation('home');
  const { format } = useCurrency();
  const totalSafaris = destinationParadiseSafariPricing.length + nextLevelSafariProducts.length;

  return (
    <section className="safaris" id="safaris">
      <header className="safaris__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('safaris.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('safaris.title', { count: totalSafaris })}</h2>
        <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('safaris.lead')}</p>
        <ul className="safaris__modes reveal" style={{ '--reveal-index': 3 }}>
          <li><span className="safaris__mode-tag">{t('safaris.modes.classic_tag')}</span> {t('safaris.modes.classic_text')}</li>
          <li><span className="safaris__mode-tag safaris__mode-tag--accent">{t('safaris.modes.fly_in_tag')}</span> {t('safaris.modes.fly_in_text')}</li>
          <li><span className="safaris__mode-tag">{t('safaris.modes.specialists_tag')}</span> {t('safaris.modes.specialists_text')}</li>
        </ul>
      </header>
      <div className="safaris__grid">
        {safariCards.map((trip, i) => (
          <article className={`safari-card reveal${trip.featured ? ' safari-card--feature' : ''}`} style={{ '--reveal-index': i }} key={trip.slug}>
            <div className="safari-card__img">
              <ResponsiveImage src={trip.image} alt="" loading="lazy" decoding="async" sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 380px" />
              <span className="safari-card__nights">{t(`safaris.features.${trip.slug}.label`)}</span>
            </div>
            <div className="safari-card__body">
              <h3>{trip.title}</h3>
              <p>{t(`safaris.features.${trip.slug}.text`)}</p>
              <div className="safari-card__foot">
                <span className="safari-card__from">{t('safaris.card.from')} <strong>{format(trip.price)}</strong> {t('safaris.card.pp_suffix')}</span>
                <Link className="ex-card__link" to={`/safaris/${trip.slug}`}>{t('safaris.card.view_details')} <ArrowIcon size={14} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="excursions__more">
        <Link className="btn btn--on-light reveal" style={{ '--reveal-index': 0 }} to="/safaris">{t('safaris.view_all')} <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
