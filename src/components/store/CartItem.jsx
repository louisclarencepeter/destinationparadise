import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { useCurrency } from '../../context/useCurrency.js';
import { formatDateLabel, formatTimeLabel } from '../../lib/storeFormat.js';

const STATUS_KEYS = {
  available: 'cart.status_available',
  sold_out: 'cart.status_sold_out',
  insufficient_seats: 'cart.status_insufficient',
  departed: 'cart.status_departed',
  unknown_experience: 'cart.status_departed',
  request_pending: 'cart.status_request',
};

const MODE_KEYS = {
  shared: 'cart.mode_shared',
  private: 'cart.mode_private',
  request: 'cart.mode_request',
};

// One trip line inside the cart drawer. `experience` is the commerce record;
// `status` comes from the latest quote ('available' until a re-check lands).
// Request items show preferred dates instead of a departure and carry no price.
export default function CartItem({ item, experience, status = 'available', totalUsd, onEdit, onRemove }) {
  const { t, i18n } = useTranslation('store');
  const { format } = useCurrency();
  const lang = i18n.resolvedLanguage || 'en';
  const isRequest = item.mode === 'request';
  const ok = status === 'available' || status === 'request_pending';

  return (
    <div className={`cart-item${ok ? '' : ' cart-item--blocked'}`}>
      <div className="cart-item__media">
        <ResponsiveImage src={experience.image} alt="" sizes="74px" />
      </div>
      <div className="cart-item__body">
        <div className="cart-item__top">
          <p className="cart-item__title">{experience.title}</p>
          <span className="cart-item__price">
            {isRequest ? t('cart.price_on_request') : format(totalUsd)}
          </span>
        </div>
        <p className="cart-item__meta">
          {isRequest
            ? `${t('cart.requested_dates')}: ${item.requestedDates || t('cart.requested_flexible')}`
            : `${formatDateLabel(lang, item.date)} · ${formatTimeLabel(lang, item.time)}`}
        </p>
        <p className="cart-item__meta">
          {t('cart.guest_count', { count: item.guests })} · {t(MODE_KEYS[item.mode] || MODE_KEYS.shared)}
        </p>
        <div className="cart-item__actions">
          <span className={`cart-item__status${ok ? '' : ' cart-item__status--warn'}${isRequest ? ' cart-item__status--request' : ''}`}>
            {t(STATUS_KEYS[status] || STATUS_KEYS.available)}
          </span>
          <button type="button" className="cart-item__link" onClick={onEdit}>{t('cart.edit')}</button>
          <button type="button" className="cart-item__link cart-item__link--muted" onClick={onRemove}>
            {t('cart.remove')}
          </button>
        </div>
      </div>
    </div>
  );
}
