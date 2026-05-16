import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowIcon } from './Icons.jsx';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { destinationParadiseSafariPricing } from '../../data/safariPricing.js';
import { nextLevelSafariProducts } from '../../data/nextLevelSafariProducts.js';

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
  const totalSafaris = destinationParadiseSafariPricing.length + nextLevelSafariProducts.length;

  return (
    <section className="safaris reveal" id="safaris">
      <header className="safaris__head">
        <span className="section-eyebrow">{t('safaris.eyebrow')}</span>
        <h2 className="section-title">{t('safaris.title', { count: totalSafaris })}</h2>
        <p className="section-lead">{t('safaris.lead')}</p>
        <ul className="safaris__modes">
          <li><span className="safaris__mode-tag">{t('safaris.modes.classic_tag')}</span> {t('safaris.modes.classic_text')}</li>
          <li><span className="safaris__mode-tag safaris__mode-tag--accent">{t('safaris.modes.fly_in_tag')}</span> {t('safaris.modes.fly_in_text')}</li>
          <li><span className="safaris__mode-tag">{t('safaris.modes.specialists_tag')}</span> {t('safaris.modes.specialists_text')}</li>
        </ul>
      </header>
      <div className="safaris__grid">
        {safariCards.map((trip) => (
          <article className={`safari-card${trip.featured ? ' safari-card--feature' : ''}`} key={trip.slug}>
            <div className="safari-card__img">
              <ResponsiveImage src={trip.image} alt="" loading="lazy" decoding="async" sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 380px" />
              <span className="safari-card__nights">{t(`safaris.features.${trip.slug}.label`)}</span>
            </div>
            <div className="safari-card__body">
              <h3>{trip.title}</h3>
              <p>{t(`safaris.features.${trip.slug}.text`)}</p>
              <div className="safari-card__foot">
                <span className="safari-card__from">{t('safaris.card.from')} <strong>${trip.price.toLocaleString()}</strong> {t('safaris.card.pp_suffix')}</span>
                <Link className="ex-card__link" to={`/safaris/${trip.slug}`}>{t('safaris.card.view_details')} <ArrowIcon size={14} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="excursions__more">
        <Link className="btn btn--on-light" to="/safaris">{t('safaris.view_all')} <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
