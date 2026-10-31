import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { useCurrency } from '../../context/useCurrency.js';
import { ArrowRightIcon } from './StoreIcons.jsx';

// Badge, CTA and price-fallback copy per listing status.
const STATUS_COPY = {
  available: { type: 'card.type_instant', cta: 'card.cta_instant' },
  coming_soon: { type: 'card.type_coming_soon', cta: 'card.cta_coming_soon' },
  on_request: { type: 'card.type_request', cta: 'card.cta_request' },
  temporarily_unavailable: { type: 'card.type_unavailable', cta: 'card.cta_details' },
};

// One store-grid card. The whole card is a single link: instant products go to
// the excursion page's booking panel, Coming Soon products to their details
// (no dates, basket or payment), On Request products to the enquiry form.
export default function ExperienceCard({ card }) {
  const { t } = useTranslation('store');
  const { format } = useCurrency();
  const status = STATUS_COPY[card.status] ? card.status : 'on_request';
  const copy = STATUS_COPY[status];

  let price;
  if (status === 'coming_soon') {
    price = (
      <>
        <strong>{t('card.coming_soon_title')}</strong>
        <small>{t('card.coming_soon_note')}</small>
      </>
    );
  } else if (status === 'temporarily_unavailable') {
    price = (
      <>
        <strong>{t('card.unavailable_title')}</strong>
        <small>{t('card.unavailable_note')}</small>
      </>
    );
  } else if (card.priceFromUsd != null) {
    price = (
      <>
        <strong>{t('card.from')} {format(card.priceFromUsd)}</strong>
        <small>{status === 'available' ? t('card.per_person') : t('card.per_person_indicative')}</small>
      </>
    );
  } else {
    price = (
      <>
        <strong>{t('card.price_on_request')}</strong>
        <small>{t('card.tailor_made')}</small>
      </>
    );
  }

  return (
    <article className={`exp-card exp-card--${status} dp-lift`}>
      <Link className="exp-card__link" to={card.to}>
        <div className="exp-card__media dp-zoom">
          <ResponsiveImage src={card.image} alt="" sizes="(max-width: 700px) 100vw, 380px" />
          {card.durationTag && <span className="exp-card__tag">{card.durationTag}</span>}
        </div>
        <div className="exp-card__body">
          <span className={`exp-card__type exp-card__type--${status}`}>
            <span className="exp-card__type-dot" aria-hidden="true" />
            {t(copy.type)}
          </span>
          <h3 className="exp-card__title">{card.title}</h3>
          <p className="exp-card__blurb">{card.blurb}</p>
          <div className="exp-card__foot">
            <span className="exp-card__price">{price}</span>
            <span className="exp-card__cta">
              {t(copy.cta)}
              <ArrowRightIcon size={15} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
