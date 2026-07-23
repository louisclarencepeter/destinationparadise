import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { ArrowLeftIcon, CheckIcon } from '../components/store/StoreIcons.jsx';
import { useBookingCart } from '../context/useBookingCart.js';
import { useCurrency } from '../context/useCurrency.js';
import { getCartExperience, getInstantExperience } from '../data/commerceCatalog.js';
import usePageMeta from '../hooks/usePageMeta.js';
import {
  isRequestItem,
  priceSelection,
  saveLastOrder,
  submitCheckout,
  submitRequestCheckout,
} from '../lib/storeApi.js';
import { formatDateLabel, formatTimeLabel } from '../lib/storeFormat.js';
import { trackEvent } from '../utils/analytics.js';
import '../styles/store.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checkout shell (HANDOFF.md Phase 1): contact details + simulated payment.
// No card fields — production hands the payment to DPO's hosted page, so the
// browser never touches card data even in the preview.
export default function StoreCheckout() {
  const { t, i18n, ready } = useTranslation('store');
  const { currency, format } = useCurrency();
  const { state, dispatch } = useBookingCart();
  const navigate = useNavigate();
  const lang = i18n.resolvedLanguage || 'en';

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [touched, setTouched] = useState(false);
  const [checking, setChecking] = useState(false);
  const [conflictIds, setConflictIds] = useState(/** @type {string[] | null} */ (null));
  const [checkoutError, setCheckoutError] = useState(/** @type {string | null} */ (null));

  usePageMeta({ title: 'Checkout · Destination Paradise', noindex: true });

  const lines = useMemo(
    () =>
      state.items
        .map((item) => ({ item, experience: getCartExperience(item.experienceId) }))
        .filter((line) => line.experience)
        .map((line) => ({
          ...line,
          totalUsd: isRequestItem(line.item)
            ? null
            : priceSelection(getInstantExperience(line.item.experienceId), line.item.mode, line.item.guests).totalUsd,
        })),
    [state.items],
  );
  const subtotalUsd = lines.reduce((sum, line) => sum + (line.totalUsd || 0), 0);
  // Any request item switches the whole checkout to the no-payment request
  // flow (HANDOFF Phase 5): one awaiting_availability order, staff confirm,
  // guest accepts a quote later — the one-payment promise is kept for the end.
  const requestMode = lines.some((line) => isRequestItem(line.item));

  // An empty cart has nothing to check out — go pick experiences instead.
  useEffect(() => {
    if (lines.length === 0 && !checking) navigate('/store', { replace: true });
  }, [lines.length, checking, navigate]);

  const errors = {
    name: contact.name.trim() ? null : 'name_required',
    email: !contact.email.trim() ? 'email_required' : EMAIL_RE.test(contact.email.trim()) ? null : 'email_invalid',
  };
  const valid = !errors.name && !errors.email;

  const backToTrip = () => {
    navigate('/store');
    dispatch({ type: 'open_drawer' });
  };

  const pay = async () => {
    setTouched(true);
    if (!valid || checking) return;
    setChecking(true);
    setConflictIds(null);
    setCheckoutError(null);

    if (requestMode) {
      const result = await submitRequestCheckout({ items: state.items, contact });
      if (!result.ok || !result.order) {
        setChecking(false);
        setCheckoutError('generic');
        return;
      }
      saveLastOrder(result.order);
      trackEvent('request_availability', { items: state.items.length });
      dispatch({ type: 'clear' });
      navigate(`/store/order/${result.order.reference}`);
      return;
    }

    const result = await submitCheckout({ items: state.items, contact });

    // Hosted payment (DPO): the order + holds exist server-side; hand the
    // browser to the payment page. The cart clears only once payment confirms.
    if (result.ok && result.redirect) {
      trackEvent('payment_redirect', { transaction_id: result.reference });
      window.location.assign(result.redirect);
      return;
    }

    if (!result.ok || !result.order) {
      setChecking(false);
      if (result.conflicts?.length) {
        setConflictIds(result.conflicts.map((conflict) => conflict.id));
        trackEvent('availability_conflict', { items: result.conflicts.length });
      } else {
        setCheckoutError(result.error === 'payment_unavailable' ? 'payment_unavailable' : 'generic');
        trackEvent('payment_failed', { reason: result.error || 'unknown' });
      }
      return;
    }
    saveLastOrder(result.order);
    trackEvent('purchase', {
      value: result.order.totalUsd,
      currency: 'USD',
      transaction_id: result.order.reference,
      items: result.order.items.length,
    });
    dispatch({ type: 'clear' });
    navigate(`/store/order/${result.order.reference}`);
  };

  if (!ready || lines.length === 0) return null;

  const field = (key, type, autoComplete) => (
    <div className="checkout-field">
      <label htmlFor={`checkout-${key}`}>{t(`checkout.${key}_label`)}</label>
      <input
        id={`checkout-${key}`}
        type={type}
        autoComplete={autoComplete}
        value={contact[key]}
        placeholder={t(`checkout.${key}_placeholder`)}
        aria-invalid={touched && errors[key] ? true : undefined}
        onChange={(event) => setContact((current) => ({ ...current, [key]: event.target.value }))}
      />
      {touched && errors[key] && <span className="checkout-field__error">{t(`checkout.errors.${errors[key]}`)}</span>}
    </div>
  );

  return (
    <main className="store-checkout">
      <div className="store-checkout__head">
        <button type="button" className="store-back" onClick={backToTrip}>
          <ArrowLeftIcon size={16} />
          {t('checkout.back')}
        </button>
        <h1 className="store-checkout__title">
          {requestMode ? t('checkout.request_title') : t('checkout.title')}
        </h1>
        <p className="store-checkout__sub">
          {requestMode ? t('checkout.request_sub') : t('checkout.sub', { count: lines.length })}
        </p>
      </div>

      <div className="store-checkout__cols">
        <section className="store-checkout__summary" aria-label={t('checkout.your_trips')}>
          <div className="store-card store-card--tinted">
            <h2 className="store-card__title">{t('checkout.your_trips')}</h2>
            {lines.map(({ item, experience, totalUsd }) => {
              const conflicted = conflictIds?.includes(item.id);
              return (
                <div key={item.id} className={`checkout-line${conflicted ? ' checkout-line--conflict' : ''}`}>
                  <div className="checkout-line__media">
                    <ResponsiveImage src={experience.image} alt="" sizes="60px" />
                  </div>
                  <div className="checkout-line__body">
                    <p className="checkout-line__title">{experience.title}</p>
                    <p className="checkout-line__meta">
                      {isRequestItem(item)
                        ? `${t('cart.requested_dates')}: ${item.requestedDates || t('cart.requested_flexible')}`
                        : `${formatDateLabel(lang, item.date)} · ${formatTimeLabel(lang, item.time)}`}
                    </p>
                    <p className="checkout-line__meta">
                      {t('cart.guest_count', { count: item.guests })} · {isRequestItem(item)
                        ? t('cart.mode_request')
                        : item.mode === 'private' ? t('cart.mode_private') : t('cart.mode_shared')}
                    </p>
                    {conflicted && (
                      <Link className="checkout-line__fix" to={`/excursions/${experience.sourceKey}?edit=${item.id}#book`}>
                        {t('checkout.conflict_fix')}
                      </Link>
                    )}
                  </div>
                  <span className="checkout-line__price">
                    {isRequestItem(item) ? t('cart.price_on_request') : format(totalUsd)}
                  </span>
                </div>
              );
            })}
            <div className="checkout-total">
              <span>{requestMode ? t('checkout.request_total_label') : t('checkout.total_due')}</span>
              <strong>
                {format(subtotalUsd)}
                {requestMode && <small className="checkout-total__note"> {t('cart.plus_request')}</small>}
              </strong>
            </div>
            {requestMode && <p className="checkout-request-hint">{t('checkout.request_pricing_hint')}</p>}
          </div>
        </section>

        <section className="store-checkout__form" aria-label={t('checkout.guest_details')}>
          <div className="store-card">
            <h2 className="store-card__title">{t('checkout.guest_details')}</h2>
            <div className="checkout-fields">
              {field('name', 'text', 'name')}
              <div className="checkout-fields__row">
                {field('email', 'email', 'email')}
                {field('phone', 'tel', 'tel')}
              </div>
            </div>

            <h2 className="store-card__title store-card__title--gap">
              {requestMode ? t('checkout.request_how') : t('checkout.payment')}
            </h2>
            <div className="checkout-payment">
              <CheckIcon size={20} strokeWidth={1.8} />
              <p>
                {requestMode
                  ? t('checkout.request_note')
                  : <Trans t={t} i18nKey="checkout.payment_note" components={{ strong: <strong /> }} />}
              </p>
            </div>

            {conflictIds && <p className="checkout-conflict" role="alert">{t('checkout.conflict')}</p>}
            {checkoutError && (
              <p className="checkout-conflict" role="alert">
                {checkoutError === 'payment_unavailable' ? t('checkout.payment_unavailable') : t('checkout.failed')}
              </p>
            )}

            <button type="button" className="checkout-pay" disabled={checking} onClick={pay}>
              {checking && <span className="checkout-pay__spinner" aria-hidden="true" />}
              {checking
                ? (requestMode ? t('checkout.request_sending') : t('checkout.checking'))
                : (requestMode ? t('checkout.request_cta') : t('checkout.pay', { amount: format(subtotalUsd) }))}
            </button>
            <p className="checkout-footnote">
              {requestMode ? t('checkout.request_footnote') : t('checkout.recheck_note')}
            </p>
            {!requestMode && currency !== 'USD' && <p className="checkout-footnote">{t('checkout.usd_note')}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
