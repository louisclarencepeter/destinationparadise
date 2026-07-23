import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { ArrowRightIcon, CheckIcon } from '../components/store/StoreIcons.jsx';
import { useBookingCart } from '../context/useBookingCart.js';
import { useCurrency } from '../context/useCurrency.js';
import usePageMeta from '../hooks/usePageMeta.js';
import {
  acceptQuote,
  adoptOrderCredentials,
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
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const lang = i18n.resolvedLanguage || 'en';

  // Email links carry ?t=<token>: adopt it into the session BEFORE any fetch,
  // then strip it from the address bar. Synchronous on first render on purpose.
  const adoptedRef = useRef(false);
  if (!adoptedRef.current) {
    adoptedRef.current = true;
    const emailToken = searchParams.get('t');
    if (emailToken) adoptOrderCredentials(reference, emailToken);
  }

  const [order, setOrder] = useState(() => readLastOrder(reference));
  const [checking, setChecking] = useState(() => !readLastOrder(reference) && isLiveStoreApi());
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState(/** @type {string | null} */ (null));
  const [acceptedAwaitingPayment, setAcceptedAwaitingPayment] = useState(false);
  const pollCountRef = useRef(0);
  const settledRef = useRef(false);
  // No session copy ⇒ we arrived via the hosted-payment redirect, so this page
  // owns the purchase event (the checkout page tracked the non-redirect path).
  const cameFromRedirectRef = useRef(!readLastOrder(reference));

  usePageMeta({ title: 'Order confirmation · Destination Paradise', noindex: true });

  // Drop the token from the URL once adopted (fresh render keeps working via session).
  useEffect(() => {
    if (searchParams.get('t')) navigate(location.pathname, { replace: true });
  }, [searchParams, navigate, location.pathname]);

  // Live orders may have advanced server-side (e.g. staff quoted while the
  // guest kept an old tab open) — refresh non-terminal states on mount.
  useEffect(() => {
    if (!isLiveStoreApi() || !order) return;
    if (['awaiting_availability', 'quoted'].includes(order.status)) {
      fetchStoredOrder(reference).then((fetched) => {
        if (fetched) setOrder(fetched);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

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

  const accept = async () => {
    if (accepting) return;
    setAccepting(true);
    setAcceptError(null);
    const result = await acceptQuote(reference);
    if (result.ok && result.redirect) {
      window.location.assign(result.redirect);
      return;
    }
    setAccepting(false);
    if (result.ok && result.order) {
      setOrder(result.order);
      return;
    }
    if (result.ok && result.paymentPending) {
      setAcceptedAwaitingPayment(true);
      if (result.order) setOrder(result.order);
      return;
    }
    setAcceptError(result.error === 'availability_conflict' ? 'conflict' : 'generic');
  };

  const requestItemLine = (item) => (
    <div className="confirm-request__line" key={`${item.experienceId}-${item.requestedDates || item.date}`}>
      <div className="confirm-request__media">
        {item.image && <ResponsiveImage src={item.image} alt="" sizes="60px" />}
      </div>
      <div className="confirm-request__body">
        <p className="confirm-request__title">{item.title}</p>
        <p className="confirm-request__meta">
          {item.kind === 'request' && !item.date
            ? `${t('cart.requested_dates')}: ${item.requestedDates || t('cart.requested_flexible')}`
            : `${formatDateLabel(lang, item.date)} · ${formatTimeLabel(lang, item.time)}`}
          {' · '}{t('cart.guest_count', { count: item.guests })}
        </p>
        {item.staffNote && <p className="confirm-request__note">{item.staffNote}</p>}
      </div>
      <span className="confirm-request__price">
        {item.totalUsd != null ? format(item.totalUsd) : t('cart.price_on_request')}
      </span>
    </div>
  );

  if (status === 'awaiting_availability') {
    return (
      <main className="store-confirm">
        <div className="store-confirm__head">
          <div className="store-confirm__badge store-confirm__badge--waiting" aria-hidden="true">
            <CheckIcon size={30} strokeWidth={2} />
          </div>
          <h1 className="store-confirm__title">{t('confirm.request_title')}</h1>
          <p className="store-confirm__lead">
            <Trans
              t={t}
              i18nKey="confirm.request_lead"
              values={{ reference: order.reference }}
              components={{ ref: <strong className="store-confirm__ref" /> }}
            />
          </p>
        </div>
        <div className="store-confirm__list">
          <div className="store-card store-card--tinted confirm-request">
            {order.items.map(requestItemLine)}
          </div>
          <p className="confirm-request__footnote">{t('confirm.request_footnote')}</p>
          <div className="store-confirm__actions">
            <Link className="store-confirm__back" to="/store">{t('confirm.back')}</Link>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'quoted') {
    return (
      <main className="store-confirm">
        <div className="store-confirm__head">
          <div className="store-confirm__badge" aria-hidden="true">
            <CheckIcon size={34} strokeWidth={2.2} />
          </div>
          <h1 className="store-confirm__title">{t('confirm.quote_title')}</h1>
          <p className="store-confirm__lead">
            <Trans
              t={t}
              i18nKey="confirm.quote_lead"
              values={{ reference: order.reference }}
              components={{ ref: <strong className="store-confirm__ref" /> }}
            />
          </p>
          {order.quoteNote && <p className="confirm-request__quote-note">{order.quoteNote}</p>}
        </div>
        <div className="store-confirm__list">
          <div className="store-card store-card--tinted confirm-request">
            {order.items.map(requestItemLine)}
            <div className="checkout-total">
              <span>{t('checkout.total_due')}</span>
              <strong>{format(order.totalUsd)}</strong>
            </div>
          </div>
          {order.quoteExpiresAt && (
            <p className="confirm-request__footnote">
              {t('confirm.quote_expiry', {
                date: formatDateLabel(lang, order.quoteExpiresAt.slice(0, 10), { weekday: 'long', month: 'long' }),
              })}
            </p>
          )}
          {acceptError && (
            <p className="checkout-conflict" role="alert">
              {acceptError === 'conflict' ? t('confirm.accept_conflict') : t('checkout.failed')}
            </p>
          )}
          {acceptedAwaitingPayment ? (
            <p className="confirm-request__footnote" role="status">{t('confirm.accepted_payment_pending')}</p>
          ) : (
            <div className="store-confirm__actions">
              <button type="button" className="checkout-pay confirm-request__accept" disabled={accepting} onClick={accept}>
                {accepting && <span className="checkout-pay__spinner" aria-hidden="true" />}
                {accepting ? t('confirm.accepting') : t('confirm.accept_cta', { amount: format(order.totalUsd) })}
                {!accepting && <ArrowRightIcon size={17} />}
              </button>
            </div>
          )}
          <p className="confirm-request__footnote">{t('confirm.accept_note')}</p>
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

  const titleWords = t('confirm.title').split(' ');

  return (
    <main className="store-confirm">
      <div className="store-confirm__head">
        <div className="store-confirm__badge" aria-hidden="true">
          <CheckIcon size={34} strokeWidth={2.2} />
        </div>
        {/* Brand tagline, hand-lettered in word by word (screen readers get the
            plain sentence; the per-word spans are presentation only). */}
        <h1
          className="store-confirm__title store-confirm__title--animated"
          aria-label={t('confirm.title')}
          style={{ '--word-count': titleWords.length }}
        >
          {titleWords.map((word, index) => (
            <span aria-hidden="true" className="store-confirm__word" style={{ '--word-index': index }} key={`${word}-${index}`}>
              {word}
            </span>
          ))}
        </h1>
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
