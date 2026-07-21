import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { CheckIcon } from '../components/store/StoreIcons.jsx';
import { useBookingCart } from '../context/useBookingCart.js';
import { useCurrency } from '../context/useCurrency.js';
import usePageMeta from '../hooks/usePageMeta.js';
import {
  clearIdempotencyKey,
  fetchStoredOrder,
  isLiveStoreApi,
  readLastOrder,
} from '../lib/storeApi.js';
import { formatDateLabel, formatTimeLabel } from '../lib/storeFormat.js';
import { trackEvent } from '../utils/analytics.js';
import '../styles/store.css';

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 20;

// Order confirmation. Three states:
//  * paid       — per-trip booking codes (fixtures land here directly)
//  * processing — hosted payment still settling; poll the order status
//  * problem    — failed/expired/requires_review; guide the guest back
// Reads session first; in live mode re-fetches with the per-order token
// (also how the DPO return redirect resolves). Always noindex.
export default function StoreConfirmation() {
  const { t, i18n, ready } = useTranslation('store');
  const { format } = useCurrency();
  const { reference } = useParams();
  const { dispatch } = useBookingCart();
  const lang = i18n.resolvedLanguage || 'en';
  const [order, setOrder] = useState(() => readLastOrder(reference));
  const [checking, setChecking] = useState(() => !readLastOrder(reference) && isLiveStoreApi());
  const pollCountRef = useRef(0);
  const settledRef = useRef(false);
  // No session copy ⇒ we arrived via the hosted-payment redirect, so this page
  // owns the purchase event (the checkout page tracked the non-redirect path).
  const cameFromRedirectRef = useRef(!readLastOrder(reference));

  usePageMeta({ title: 'Order confirmation · Destination Paradise', noindex: true });

  const status = order?.status || (order ? 'paid' : null);

  // Initial live fetch when the session copy is missing (e.g. DPO return).
  useEffect(() => {
    if (order || !isLiveStoreApi()) return undefined;
    let active = true;
    fetchStoredOrder(reference)
      .then((fetched) => {
        if (active && fetched) setOrder(fetched);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [order, reference]);

  // Payment still settling server-side: poll until it resolves or we give up
  // (reconciliation keeps working server-side either way).
  useEffect(() => {
    if (!isLiveStoreApi() || status !== 'pending_payment') return undefined;
    if (pollCountRef.current >= POLL_MAX_ATTEMPTS) return undefined;
    const timer = window.setTimeout(() => {
      pollCountRef.current += 1;
      fetchStoredOrder(reference).then((fetched) => {
        if (fetched) setOrder(fetched);
      });
    }, POLL_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [status, order, reference]);

  // Once payment is confirmed: clear the cart + idempotency key exactly once.
  useEffect(() => {
    if (status !== 'paid' || settledRef.current) return;
    settledRef.current = true;
    dispatch({ type: 'clear' });
    clearIdempotencyKey();
    if (isLiveStoreApi() && cameFromRedirectRef.current) {
      trackEvent('purchase', {
        value: order.totalUsd,
        currency: 'USD',
        transaction_id: order.reference,
        items: order.items.length,
      });
    }
  }, [status, order, dispatch]);

  if (!ready || checking) return null;

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

  if (status === 'pending_payment') {
    return (
      <main className="store-confirm">
        <div className="store-confirm__head">
          <div className="store-confirm__badge store-confirm__badge--waiting" aria-hidden="true">
            <span className="store-confirm__spinner" />
          </div>
          <h1 className="store-confirm__title">{t('confirm.processing_title')}</h1>
          <p className="store-confirm__lead" aria-live="polite">
            <Trans
              t={t}
              i18nKey="confirm.processing_text"
              values={{ reference: order.reference }}
              components={{ ref: <strong className="store-confirm__ref" /> }}
            />
          </p>
        </div>
      </main>
    );
  }

  if (status !== 'paid') {
    return (
      <main className="store-confirm">
        <div className="store-confirm__head">
          <h1 className="store-confirm__title">{t('confirm.problem_title')}</h1>
          <p className="store-confirm__lead">
            <Trans
              t={t}
              i18nKey="confirm.problem_text"
              values={{ reference: order.reference }}
              components={{ ref: <strong className="store-confirm__ref" /> }}
            />
          </p>
          <div className="store-confirm__actions">
            <Link className="store-confirm__back" to="/store/checkout">{t('confirm.problem_cta')}</Link>
          </div>
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
          <article className="confirm-card" key={item.bookingCode || `${item.experienceId}-${item.date}-${item.time}`}>
            <div className="confirm-card__bar" aria-hidden="true" />
            <div className="confirm-card__media">
              {item.image && <ResponsiveImage src={item.image} alt="" sizes="88px" />}
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
