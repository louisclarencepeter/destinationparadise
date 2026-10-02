import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import StorePaymentFrame from '../components/store/StorePaymentFrame.jsx';
import StorePriceLines from '../components/store/StorePriceLines.jsx';
import { ArrowRightIcon, CheckIcon } from '../components/store/StoreIcons.jsx';
import { useBookingCart } from '../context/useBookingCart.js';
import usePageMeta from '../hooks/usePageMeta.js';
import {
  acceptQuote,
  adoptOrderCredentials,
  clearIdempotencyKey,
  continueOrderPayment,
  fetchStoredOrder,
  isLiveStoreApi,
  isSafePaymentUrl,
  readLastOrder,
} from '../lib/storeApi.js';
import { formatDateLabel, formatStoreMoney, formatTimeLabel } from '../lib/storeFormat.js';
import { applyPendingOrderCheck, pollStoreOrder } from '../lib/pollStoreOrder.js';
import { trackEvent } from '../utils/analytics.js';
import '../styles/store.css';

// Order confirmation. Three states:
//  * paid       — per-trip booking codes (fixtures land here directly)
//  * pending    — embedded Pesapal checkout or payment still settling
//  * problem    — failed/expired/requires_review; guide the guest back
// Reads session first; in live mode re-fetches with the per-order token
// (also how the DPO return redirect resolves). Always noindex.
export default function StoreConfirmation() {
  const { t, i18n, ready } = useTranslation('store');
  const { reference } = useParams();
  const { dispatch } = useBookingCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const lang = i18n.resolvedLanguage || 'en';
  const format = (amountUsd) => formatStoreMoney(lang, amountUsd);

  // Email links carry ?t=<token>: adopt it into the session BEFORE any fetch,
  // then strip it from the address bar. Synchronous on first render on purpose.
  const adoptedRef = useRef(false);
  if (!adoptedRef.current) {
    adoptedRef.current = true;
    const emailToken = searchParams.get('t');
    if (emailToken) adoptOrderCredentials(reference, emailToken);
  }

  const [order, setOrder] = useState(() => readLastOrder(reference));
  const [checking, setChecking] = useState(() => isLiveStoreApi());
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [refreshAttempt, setRefreshAttempt] = useState(0);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState(/** @type {string | null} */ (null));
  const [acceptedAwaitingPayment, setAcceptedAwaitingPayment] = useState(false);
  const [paymentReview, setPaymentReview] = useState(false);
  const [payment, setPayment] = useState(() => {
    const handoff = location.state?.payment;
    return handoff && handoff.reference === reference && handoff.provider === 'pesapal' && isSafePaymentUrl(handoff.paymentUrl, 'pesapal')
      ? { reference, paymentUrl: handoff.paymentUrl }
      : null;
  });
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentCheckFailed, setPaymentCheckFailed] = useState(false);
  const [paymentStatusChecked, setPaymentStatusChecked] = useState(false);
  const settledRef = useRef(false);
  // No session copy ⇒ we arrived via the hosted-payment redirect, so this page
  // owns the purchase event (the checkout page tracked the non-redirect path).
  const cameFromRedirectRef = useRef(!readLastOrder(reference));

  usePageMeta({ title: t('confirm.meta_title'), noindex: true });

  // Keep access tokens out of the URL and provider URLs out of browser history.
  // A refresh can safely resume the existing payment through the server.
  useEffect(() => {
    if (searchParams.get('t') || location.state?.payment) navigate(location.pathname, { replace: true, state: null });
  }, [searchParams, navigate, location.pathname, location.state]);

  // Every live snapshot must be refreshed, including paid orders that may
  // since have been reversed or refunded. A session copy cannot confirm money.
  useEffect(() => {
    if (!isLiveStoreApi()) return undefined;
    let active = true;
    setChecking(true);
    setRefreshFailed(false);
    fetchStoredOrder(reference)
      .then((fetched) => {
        if (!active) return;
        if (fetched) setOrder(fetched);
        else setRefreshFailed(true);
      })
      .catch(() => {
        if (active) setRefreshFailed(true);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [reference, refreshAttempt]);

  const status = order?.status || (order ? 'paid' : null);

  // Payment still settling server-side: poll until it resolves or we give up
  // (reconciliation keeps working server-side either way).
  useEffect(() => {
    if (!isLiveStoreApi() || checking || refreshFailed || status !== 'pending_payment') return undefined;
    return pollStoreOrder({ fetchOrder: () => fetchStoredOrder(reference), onOrder: setOrder });
  }, [status, reference, checking, refreshFailed]);

  // Once payment is confirmed: clear the cart + idempotency key exactly once.
  useEffect(() => {
    if (checking || refreshFailed || status !== 'paid' || settledRef.current) return;
    settledRef.current = true;
    dispatch({ type: 'clear' });
    clearIdempotencyKey();
    if (isLiveStoreApi() && cameFromRedirectRef.current) {
      trackEvent('purchase', {
        value: order.chargeUsd ?? order.totalUsd,
        currency: 'USD',
        items: order.items.length,
      });
    }
  }, [status, order, dispatch, checking, refreshFailed]);

  if (!ready || checking) return null;

  if (refreshFailed) {
    return (
      <main className="store-confirm">
        <div className="store-confirm__head">
          <h1 className="store-confirm__title">{t('confirm.refresh_failed_title')}</h1>
          <p className="store-confirm__lead" role="alert">{t('confirm.refresh_failed_text')}</p>
          <button type="button" className="checkout-pay confirm-request__accept" onClick={() => setRefreshAttempt((value) => value + 1)}>
            {t('confirm.refresh_retry')}
          </button>
        </div>
      </main>
    );
  }

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

  const depositMode = order.paymentPlan === 'deposit_20';
  const chargeUsd = order.chargeUsd ?? order.totalUsd;

  const accept = async () => {
    if (accepting || !reference) return;
    setAccepting(true);
    setAcceptError(null);
    const expected = { expectedTotalUsd: order.totalUsd, expectedChargeUsd: chargeUsd };
    const result = order.status === 'pending_payment'
      ? await continueOrderPayment(reference, expected)
      : await acceptQuote(reference, expected);
    if (result.ok && result.provider === 'pesapal' && result.reference === reference && isSafePaymentUrl(result.paymentUrl, 'pesapal')) {
      setChecking(true);
      setPayment({ reference, paymentUrl: result.paymentUrl });
      setPaymentReview(false);
      setPaymentCheckFailed(false);
      setPaymentStatusChecked(false);
      // Quote acceptance may have changed the order from quoted to pending.
      // Finish the authenticated refresh before mounting the form, avoiding
      // an initial mount followed immediately by a loading-state remount.
      try {
        const refreshed = await fetchStoredOrder(reference);
        if (refreshed) {
          setOrder((current) => current?.reference === reference && ['quoted', 'pending_payment'].includes(current.status) ? refreshed : current);
          setRefreshFailed(false);
        } else setRefreshFailed(true);
      } catch {
        setRefreshFailed(true);
      } finally {
        setChecking(false);
        setAccepting(false);
      }
      return;
    }
    if (result.ok && result.redirect) {
      window.location.assign(result.redirect);
      return;
    }
    setAccepting(false);
    if (result.ok && result.paymentPending) {
      setAcceptedAwaitingPayment(true);
      setPaymentReview(true);
      if (result.order) setOrder(result.order);
      return;
    }
    if (result.ok && result.order) {
      setPaymentReview(false);
      setOrder(result.order);
      return;
    }
    if (result.error === 'price_changed') {
      if (result.order) {
        setOrder(result.order);
        setPaymentReview(true);
      }
      setAcceptError('price_changed');
      return;
    }
    if (result.order) setOrder(result.order);
    setAcceptError(result.error === 'availability_conflict' ? 'conflict' : 'generic');
  };

  const checkPayment = async () => {
    if (checkingPayment) return;
    setCheckingPayment(true);
    setPaymentCheckFailed(false);
    setPaymentStatusChecked(false);
    try {
      const refreshed = await fetchStoredOrder(reference);
      if (refreshed) {
        setOrder((current) => applyPendingOrderCheck(current, refreshed, reference));
        setPaymentStatusChecked(true);
      }
      else setPaymentCheckFailed(true);
    } catch {
      setPaymentCheckFailed(true);
    } finally {
      setCheckingPayment(false);
    }
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
        {item.pickup && <p className="confirm-request__meta">{item.pickup}</p>}
        <StorePriceLines lines={item.priceLines} />
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
              components={{ ref: <strong key="order-reference" className="store-confirm__ref" /> }}
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

  if (status === 'quoted' || (status === 'pending_payment' && paymentReview)) {
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
              components={{ ref: <strong key="order-reference" className="store-confirm__ref" /> }}
            />
          </p>
          {order.quoteNote && <p className="confirm-request__quote-note">{order.quoteNote}</p>}
        </div>
        <div className="store-confirm__list">
          <div className="store-card store-card--tinted confirm-request">
            {order.items.map(requestItemLine)}
            <div className="checkout-total">
              <span>{t('checkout.trip_total')}</span>
              <strong>{format(order.totalUsd)}</strong>
            </div>
            {depositMode && (
              <>
                <div className="checkout-total">
                  <span>{t('checkout.deposit_due', { percent: order.depositPercent || 20 })}</span>
                  <strong>{format(chargeUsd)}</strong>
                </div>
                <div className="checkout-total">
                  <span>{t('checkout.balance_due')}</span>
                  <strong>{format(order.balanceUsd)}</strong>
                </div>
              </>
            )}
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
              {acceptError === 'conflict' ? t('confirm.accept_conflict') : t(acceptError === 'price_changed' ? 'checkout.price_changed' : 'checkout.failed')}
            </p>
          )}
          {acceptedAwaitingPayment ? (
            <p className="confirm-request__footnote" role="status">{t('confirm.accepted_payment_pending')}</p>
          ) : (
            <div className="store-confirm__actions">
              <button type="button" className="checkout-pay confirm-request__accept" disabled={accepting} onClick={accept}>
                {accepting && <span className="checkout-pay__spinner" aria-hidden="true" />}
                {accepting ? t('confirm.accepting') : t(depositMode ? 'confirm.accept_deposit_cta' : 'confirm.accept_cta', { amount: format(chargeUsd) })}
                {!accepting && <ArrowRightIcon size={17} />}
              </button>
            </div>
          )}
          <p className="confirm-request__footnote">{t(depositMode ? 'confirm.accept_note' : 'confirm.accept_note_full')}</p>
        </div>
      </main>
    );
  }

  if (status === 'pending_payment') {
    const embeddedPaymentUrl = payment && payment.reference === reference ? payment.paymentUrl : null;
    return (
      <main className={`store-confirm${embeddedPaymentUrl ? ' store-confirm--payment' : ''}`}>
        <div className="store-confirm__head">
          {!embeddedPaymentUrl && (
            <div className="store-confirm__badge store-confirm__badge--waiting" aria-hidden="true">
              <span className="store-confirm__spinner" />
            </div>
          )}
          <h1 className="store-confirm__title">{t(embeddedPaymentUrl ? (depositMode ? 'payment.deposit_title' : 'payment.full_title') : 'confirm.processing_title')}</h1>
          <p className="store-confirm__lead" aria-live="polite">
            <Trans
              t={t}
              i18nKey={embeddedPaymentUrl ? 'payment.lead' : 'confirm.processing_text'}
              values={{ reference: order.reference }}
              components={{ ref: <strong key="order-reference" className="store-confirm__ref" /> }}
            />
          </p>
          {isLiveStoreApi() && !embeddedPaymentUrl && (
            <div className="store-confirm__actions">
              <p className="confirm-request__footnote">{t('confirm.continue_pending')}</p>
              {acceptError && <p className="checkout-conflict" role="alert">{t('checkout.failed')}</p>}
              <button type="button" className="checkout-pay confirm-request__accept" disabled={accepting} onClick={accept}>
                {accepting ? t('confirm.accepting') : t(depositMode ? 'checkout.pay_deposit' : 'checkout.pay', { amount: format(chargeUsd) })}
              </button>
            </div>
          )}
        </div>
        {embeddedPaymentUrl && (
          <div className="store-confirm__list">
            <div className="store-card store-card--tinted confirm-request">
              {order.items.map(requestItemLine)}
              <div className="checkout-total">
                <span>{t('checkout.trip_total')}</span>
                <strong>{format(order.totalUsd)}</strong>
              </div>
              <div className="checkout-total">
                <span>{t(depositMode ? 'checkout.deposit_due' : 'payment.amount_due', { percent: order.depositPercent || 20 })}</span>
                <strong>{format(chargeUsd)}</strong>
              </div>
              {depositMode && (
                <div className="checkout-total">
                  <span>{t('checkout.balance_due')}</span>
                  <strong>{format(order.balanceUsd)}</strong>
                </div>
              )}
            </div>
            <StorePaymentFrame paymentUrl={embeddedPaymentUrl} onCheckStatus={checkPayment} checking={checkingPayment} />
            {paymentStatusChecked && <p className="confirm-request__footnote" role="status">{t('payment.pending')}</p>}
            {paymentCheckFailed && <p className="checkout-conflict" role="alert">{t('confirm.refresh_failed_text')}</p>}
          </div>
        )}
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
              components={{ ref: <strong key="order-reference" className="store-confirm__ref" /> }}
            />
          </p>
          <div className="store-confirm__actions">
            <Link className="store-confirm__back" to="/store/checkout" onClick={() => {
              if (['payment_failed', 'expired', 'cancelled'].includes(status)) clearIdempotencyKey();
            }}>{t('confirm.problem_cta')}</Link>
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
            i18nKey={depositMode ? 'confirm.deposit_lead' : 'confirm.lead'}
            values={{ reference: order.reference }}
            components={{ ref: <strong key="order-reference" className="store-confirm__ref" /> }}
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
              <StorePriceLines lines={item.priceLines} />
              <span className="confirm-card__paid">
                <CheckIcon size={14} strokeWidth={2.4} />
                {t(depositMode ? 'confirm.deposit_chip' : 'confirm.paid_chip')}
              </span>
            </div>
          </article>
        ))}

        <div className="store-confirm__total">
          <span>{t(depositMode ? 'confirm.deposit_received' : 'confirm.total_paid')}</span>
          <strong>{format(chargeUsd)}</strong>
        </div>
        {depositMode && (
          <>
            <div className="store-confirm__total">
              <span>{t('checkout.trip_total')}</span>
              <strong>{format(order.totalUsd)}</strong>
            </div>
            <div className="store-confirm__total">
              <span>{t('checkout.balance_due')}</span>
              <strong>{format(order.balanceUsd)}</strong>
            </div>
            <p className="confirm-request__footnote">{t('confirm.balance_note')}</p>
          </>
        )}
        <div className="store-confirm__actions">
          <Link className="store-confirm__back" to="/store">{t('confirm.back')}</Link>
        </div>
      </div>
    </main>
  );
}
