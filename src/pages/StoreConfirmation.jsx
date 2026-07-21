import { Link, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { CheckIcon } from '../components/store/StoreIcons.jsx';
import { useCurrency } from '../context/useCurrency.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { readLastOrder } from '../lib/storeApi.js';
import { formatDateLabel, formatTimeLabel } from '../lib/storeFormat.js';
import '../styles/store.css';

// Order confirmation: one order header, one card per booked trip with its own
// booking code. Reads the just-placed order from session storage (Phase 1);
// later this becomes the server-backed order-status endpoint. Always noindex.
export default function StoreConfirmation() {
  const { t, i18n, ready } = useTranslation('store');
  const { format } = useCurrency();
  const { reference } = useParams();
  const lang = i18n.resolvedLanguage || 'en';
  const order = readLastOrder(reference);

  usePageMeta({ title: 'Order confirmation · Destination Paradise', noindex: true });

  if (!ready) return null;

  if (!order) {
    return (
      <main className="store-confirm">
        <div className="store-confirm__head">
          <h1 className="store-confirm__title">{t('confirm.missing_title')}</h1>
          <p className="store-confirm__lead">{t('confirm.missing_text')}</p>
          <Link className="store-confirm__back" to="/store">{t('confirm.missing_cta')}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="store-confirm">
      <div className="store-confirm__head">
        <div className="store-confirm__badge" aria-hidden="true">
          <CheckIcon size={34} strokeWidth={2.2} />
        </div>
        <h1 className="store-confirm__title">{t('confirm.title')}</h1>
        <p className="store-confirm__lead">
          <Trans
            t={t}
            i18nKey="confirm.lead"
            values={{ reference: order.reference }}
            components={{ ref: <strong className="store-confirm__ref" /> }}
          />
        </p>
      </div>

      <div className="store-confirm__list">
        {order.items.map((item) => (
          <article className="confirm-card" key={item.bookingCode}>
            <div className="confirm-card__bar" aria-hidden="true" />
            <div className="confirm-card__media">
              <ResponsiveImage src={item.image} alt="" sizes="88px" />
            </div>
            <div className="confirm-card__body">
              <div className="confirm-card__top">
                <p className="confirm-card__title">{item.title}</p>
                <span className="confirm-card__code">{t('confirm.code_prefix')} · {item.bookingCode}</span>
              </div>
              <p className="confirm-card__meta">
                {formatDateLabel(lang, item.date)} · {formatTimeLabel(lang, item.time)} ·{' '}
                {t('cart.guest_count', { count: item.guests })} ·{' '}
                {item.mode === 'private' ? t('cart.mode_private') : t('cart.mode_shared')}
              </p>
              <p className="confirm-card__pickup">{item.pickup}</p>
              <span className="confirm-card__paid">
                <CheckIcon size={14} strokeWidth={2.4} />
                {t('confirm.paid_chip')}
              </span>
            </div>
          </article>
        ))}

        <div className="store-confirm__total">
          <span>{t('confirm.total_paid')}</span>
          <strong>{format(order.totalUsd)}</strong>
        </div>
        <div className="store-confirm__actions">
          <Link className="store-confirm__back" to="/store">{t('confirm.back')}</Link>
        </div>
      </div>
    </main>
  );
}
