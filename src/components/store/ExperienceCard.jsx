import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { useCurrency } from '../../context/useCurrency.js';
import { ArrowRightIcon } from './StoreIcons.jsx';

// One store-grid card. The whole card is a single link: instant products go to
// the excursion page's booking panel, request products to their enquiry flow.
export default function ExperienceCard({ card }) {
  const { t } = useTranslation('store');
  const { format } = useCurrency();
  const instant = card.kind === 'instant';

  return (
    <article className="exp-card dp-lift">
      <Link className="exp-card__link" to={card.to}>
        <div className="exp-card__media dp-zoom">
          <ResponsiveImage src={card.image} alt="" sizes="(max-width: 700px) 100vw, 380px" />
          {card.durationTag && <span className="exp-card__tag">{card.durationTag}</span>}
        </div>
        <div className="exp-card__body">
          <span className={`exp-card__type exp-card__type--${card.kind}`}>
            <span className="exp-card__type-dot" aria-hidden="true" />
            {instant ? t('card.type_instant') : t('card.type_request')}
          </span>
          <h3 className="exp-card__title">{card.title}</h3>
          <p className="exp-card__blurb">{card.blurb}</p>
          <div className="exp-card__foot">
            <span className="exp-card__price">
              {card.priceFromUsd != null ? (
                <>
                  <strong>{t('card.from')} {format(card.priceFromUsd)}</strong>
                  <small>{t('card.per_person')}</small>
                </>
              ) : (
                <>
                  <strong>{t('card.price_on_request')}</strong>
                  <small>{t('card.tailor_made')}</small>
                </>
              )}
            </span>
            <span className="exp-card__cta">
              {instant ? t('card.cta_instant') : t('card.cta_request')}
              <ArrowRightIcon size={15} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
