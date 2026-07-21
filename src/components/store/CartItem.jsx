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
};

// One trip line inside the cart drawer. `experience` is the commerce record;
// `status` comes from the latest quote ('available' until a re-check lands).
export default function CartItem({ item, experience, status = 'available', totalUsd, onEdit, onRemove }) {
  const { t, i18n } = useTranslation('store');
  const { format } = useCurrency();
  const lang = i18n.resolvedLanguage || 'en';
  const ok = status === 'available';

  return (
    <div className={`cart-item${ok ? '' : ' cart-item--blocked'}`}>
      <div className="cart-item__media">
        <ResponsiveImage src={experience.image} alt="" sizes="74px" />
      </div>
      <div className="cart-item__body">
        <div className="cart-item__top">
          <p className="cart-item__title">{experience.title}</p>
          <span className="cart-item__price">{format(totalUsd)}</span>
        </div>
        <p className="cart-item__meta">
          {formatDateLabel(lang, item.date)} · {formatTimeLabel(lang, item.time)}
        </p>
        <p className="cart-item__meta">
          {t('cart.guest_count', { count: item.guests })} · {item.mode === 'private' ? t('cart.mode_private') : t('cart.mode_shared')}
        </p>
        <div className="cart-item__actions">
          <span className={`cart-item__status${ok ? '' : ' cart-item__status--warn'}`}>
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
