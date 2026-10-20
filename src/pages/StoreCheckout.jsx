import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { ArrowLeftIcon, CheckIcon } from '../components/store/StoreIcons.jsx';
import { useBookingCart } from '../context/useBookingCart.js';
import { getCartExperience } from '../data/commerceCatalog.js';
import { buildLocalizedExcursions } from '../data/localizedCatalog.js';
import usePageMeta from '../hooks/usePageMeta.js';
import {
  isRequestItem,
  isLiveStoreApi,
  quoteCartItems,
  saveLastOrder,
  submitCheckout,
} from '../lib/storeApi.js';
import { formatDateLabel, formatStoreMoney, formatTimeLabel } from '../lib/storeFormat.js';
import { quoteOnlyDepartureItems, selectionReviewStatus } from '../lib/storePricing.js';
import StorePriceLines from '../components/store/StorePriceLines.jsx';
import { suspendGoogleAnalytics, trackEvent } from '../utils/analytics.js';
import '../styles/store.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Payment details are entered in Pesapal's cross-origin form on our order page.
// This checkout collects only the guest's booking contact details.
export default function StoreCheckout() {
  const { t, i18n, ready } = useTranslation(['store', 'catalog']);
  const catalogLanguage = ready ? i18n.resolvedLanguage : '';
  const { state, dispatch, checkoutContact: contact, setCheckoutContact: setContact } = useBookingCart();
  const navigate = useNavigate();
  const lang = i18n.resolvedLanguage || 'en';
  const format = (amountUsd) => formatStoreMoney(lang, amountUsd);

  const [touched, setTouched] = useState(false);
  const [checking, setChecking] = useState(false);
  const [conflictIds, setConflictIds] = useState(/** @type {string[] | null} */ (null));
  const [checkoutError, setCheckoutError] = useState(/** @type {string | null} */ (null));
  const [pricing, setPricing] = useState(
    /** @type {{items: typeof state.items | null, quote: Awaited<ReturnType<typeof quoteCartItems>> | null, failed: boolean}} */
    ({ items: null, quote: null, failed: false }),
  );
  const [quoteRetry, setQuoteRetry] = useState(0);
  const currentPricing = pricing.items === state.items ? pricing : null;
  const currentQuote = currentPricing?.quote;

  usePageMeta({ title: t('store:checkout.meta_title'), noindex: true });

  const catalog = useMemo(() => ({
    excursions: catalogLanguage ? buildLocalizedExcursions(t) : [],
    operationalCopy: t('store:catalog', { returnObjects: true, defaultValue: {} }),
  }), [t, catalogLanguage]);

  const lines = useMemo(
    () =>
      state.items
        .map((item) => ({ item, experience: getCartExperience(item.experienceId, catalog.excursions, catalog.operationalCopy) }))
        .filter((line) => line.experience)
        .map((line) => ({
          ...line,
          totalUsd: isRequestItem(line.item) ? null :
            currentQuote?.quotes.find((quote) => quote.id === line.item.id)?.totalUsd ?? null,
        })),
    [catalog, state.items, currentQuote],
  );
  const subtotalUsd = currentQuote?.subtotalUsd ?? null;
  const chargeUsd = currentQuote?.chargeUsd ?? null;
  const balanceUsd = currentQuote?.balanceUsd ?? null;
  const depositMode = currentQuote?.paymentPlan === 'deposit_20';
  // Older carts can contain enquiry items. Keep their selections, but never
  // turn this online checkout into a request or charge only part of the cart.
  const requestMode = state.items.some(isRequestItem);
  const oversized = quoteOnlyDepartureItems(state.items);
  const reviewFor = (item) => selectionReviewStatus(item, oversized) ||
    currentQuote?.quotes.find((quote) => quote.id === item.id)?.status;
  const pickupReview = lines.some(({ item }) => reviewFor(item) === 'pickup_required');
  const quoteRequired = lines.some(({ item }) => reviewFor(item) === 'quote_required');
  const availabilityReview = Boolean(currentQuote && lines.some(({ item, totalUsd }) =>
    !isRequestItem(item) && !['pickup_required', 'quote_required'].includes(reviewFor(item)) &&
    (reviewFor(item) !== 'available' || !Number.isFinite(totalUsd) || totalUsd <= 0)));
  const quotedTotalMinor = lines.reduce((sum, line) => sum + Math.round((line.totalUsd ?? 0) * 100), 0);
  const subtotalMinor = Math.round((subtotalUsd ?? 0) * 100);
  const chargeMinor = Math.round((chargeUsd ?? 0) * 100);
  const balanceMinor = Math.round((balanceUsd ?? 0) * 100);
  const amountsReady = depositMode && typeof subtotalUsd === 'number' && Number.isFinite(subtotalUsd) && subtotalUsd > 0 &&
    typeof chargeUsd === 'number' && Number.isFinite(chargeUsd) && chargeUsd > 0 &&
    typeof balanceUsd === 'number' && Number.isFinite(balanceUsd) && balanceUsd >= 0 &&
    Number.isSafeInteger(subtotalMinor) && subtotalMinor === quotedTotalMinor &&
    chargeMinor === Math.ceil(subtotalMinor / 5) && balanceMinor === subtotalMinor - chargeMinor;
  const paymentReady = Boolean(currentQuote && amountsReady && lines.length === state.items.length &&
    !requestMode && !pickupReview && !quoteRequired && !availabilityReview);
  const pricingReview = Boolean(currentQuote && !requestMode && !pickupReview && !quoteRequired &&
    !availabilityReview && !amountsReady);

  useEffect(() => {
    if (!catalogLanguage || state.items.length === 0) return undefined;
    let active = true;
    setPricing({ items: state.items, quote: null, failed: false });
    quoteCartItems(state.items).then((quote) => {
      if (active) setPricing({ items: state.items, quote, failed: false });
    }).catch(() => {
      if (active) setPricing({ items: state.items, quote: null, failed: true });
    });
    return () => { active = false; };
  }, [catalogLanguage, state.items, quoteRetry]);

  // An empty cart has nothing to check out — go pick experiences instead.
  useEffect(() => {
    if (catalogLanguage && lines.length === 0 && !checking) navigate('/store', { replace: true });
  }, [catalogLanguage, lines.length, checking, navigate]);

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
    if (!paymentReady || checking) return;
    setTouched(true);
    if (!valid) return;
    setChecking(true);
    setConflictIds(null);
    setCheckoutError(null);

    const result = await submitCheckout({ items: state.items, contact, expectedTotalUsd: subtotalUsd, expectedChargeUsd: chargeUsd });

    // The order and holds exist server-side. Keep Pesapal inside our private
    // order page; historical DPO payments retain their hosted-page handoff.
    // The cart clears only once the server verifies payment.
    if (result.ok && result.provider === 'pesapal' && result.paymentUrl && result.reference) {
      trackEvent('payment_started', { items: state.items.length });
      suspendGoogleAnalytics();
      navigate(`/store/order/${result.reference}`, {
        state: { payment: { reference: result.reference, provider: result.provider, paymentUrl: result.paymentUrl } },
      });
      return;
    }
    if (result.ok && result.redirect) {
      trackEvent('payment_redirect', { items: state.items.length });
      window.location.assign(result.redirect);
      return;
    }

    if (!result.ok || !result.order) {
      setChecking(false);
      if (result.conflicts?.length) {
        setConflictIds(result.conflicts.map((conflict) => conflict.id));
        if (currentQuote) {
          const latest = new Map(result.conflicts.map((conflict) => [conflict.id, conflict.status]));
          setPricing({ items: state.items, quote: { ...currentQuote, quotes: currentQuote.quotes.map((quote) =>
            latest.has(quote.id) ? { ...quote, status: latest.get(quote.id) || 'unavailable' } : quote) }, failed: false });
        }
        trackEvent('availability_conflict', { items: result.conflicts.length });
      } else {
        if (result.error === 'price_changed' && result.quote) {
          setPricing({ items: state.items, quote: result.quote, failed: false });
        }
        setCheckoutError(['payment_unavailable', 'price_changed'].includes(result.error) ? result.error : 'generic');
        trackEvent('payment_failed', { reason: result.error || 'unknown' });
      }
      return;
    }
    saveLastOrder(result.order);
    trackEvent('purchase', {
      value: result.order.chargeUsd ?? result.order.totalUsd,
      currency: 'USD',
      items: result.order.items.length,
    });
    dispatch({ type: 'clear' });
    suspendGoogleAnalytics();
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
          {t('checkout.title')}
        </h1>
        <p className="store-checkout__sub">
          {t('checkout.sub', { count: lines.length })}
        </p>
      </div>

      <div className="store-checkout__cols">
        <section className="store-checkout__summary" aria-label={t('checkout.your_trips')}>
          <div className="store-card store-card--tinted">
            <h2 className="store-card__title">{t('checkout.your_trips')}</h2>
            {lines.map(({ item, experience, totalUsd }) => {
              const reviewStatus = reviewFor(item);
              const conflicted = conflictIds?.includes(item.id) ||
                (!isRequestItem(item) && reviewStatus && reviewStatus !== 'available');
              const priceIsStatus = isRequestItem(item) || conflicted || totalUsd == null;
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
                    {item.pickupZone && <p className="checkout-line__meta">{t(`pickup.zones.${item.pickupZone}`)} · {item.accommodation}</p>}
                    {!isRequestItem(item) && (
                      <Link className="checkout-line__fix" to={`/excursions/${experience.sourceKey}?edit=${item.id}#book`} state={{ returnToCheckout: true }}>
                        {t(conflicted ? (['pickup_required', 'quote_required'].includes(reviewStatus) ? 'checkout.review_selection' : 'checkout.conflict_fix') : 'cart.edit')}
                      </Link>
                    )}
                  </div>
                  {!conflicted && <StorePriceLines lines={currentQuote?.quotes.find((quote) => quote.id === item.id)?.priceLines || []} />}
                  <span className={`checkout-line__price${priceIsStatus ? ' checkout-line__price--status' : ''}`}>
                    {isRequestItem(item) || reviewStatus === 'quote_required' ? t('cart.price_on_request') : conflicted ? t('cart.price_unavailable') : totalUsd == null ? t(currentPricing?.failed ? 'cart.price_unavailable' : 'cart.checking_prices') : format(totalUsd)}
                  </span>
                </div>
              );
            })}
            <div className={`checkout-total${paymentReady ? '' : ' checkout-total--status'}`}>
              <span>{t('checkout.trip_total')}</span>
              <strong>
                {requestMode || pickupReview || availabilityReview || pricingReview ? t('cart.price_unavailable') : quoteRequired ? t('cart.price_on_request') : subtotalUsd == null ? t(currentPricing?.failed ? 'cart.price_unavailable' : 'cart.checking_prices') : format(subtotalUsd)}
              </strong>
            </div>
            {paymentReady && (
              <>
                <div className="checkout-total">
                  <span>{t('checkout.deposit_due', { percent: 20 })}</span>
                  <strong>{format(chargeUsd)}</strong>
                </div>
                <div className="checkout-total">
                  <span>{t('checkout.balance_due')}</span>
                  <strong>{format(balanceUsd)}</strong>
                </div>
              </>
            )}
            {requestMode && <p className="checkout-request-hint" role="status">
              {t('checkout.online_only')}{' '}
              <Link to="/book-now#booking-contact" state={{ storeEnquiry: { items: state.items.map((item) => ({
                experienceId: item.experienceId, mode: item.mode, guests: item.guests,
                pickupZone: item.pickupZone, accommodation: item.accommodation,
                preferredDate: item.date || item.requestedDates || '', preferredTime: item.time || '',
              })), contact } }}>{t('checkout.separate_enquiry')}</Link>
            </p>}
            {pickupReview && <p className="checkout-conflict" role="status">{t('checkout.pickup_review')}</p>}
            {quoteRequired && <p className="checkout-request-hint" role="status">
              {t('checkout.quote_required')}{' '}
              <button type="button" className="cart-item__link" onClick={() => setQuoteRetry((value) => value + 1)}>
                {t('checkout.retry_quote')}
              </button>
            </p>}
            {availabilityReview && <p className="checkout-conflict" role="status">{t('checkout.conflict')}</p>}
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

            <p className="checkout-terms">
              <Trans
                t={t}
                i18nKey="checkout.privacy_notice"
                components={{ privacy: <Link key="privacy-policy" to="/privacy-policy" /> }}
              />
            </p>

            <h2 className="store-card__title store-card__title--gap">
              {t('checkout.payment')}
            </h2>
            <div className="checkout-payment">
              <CheckIcon size={20} strokeWidth={1.8} />
              <p>
                <Trans t={t} i18nKey={isLiveStoreApi() ? 'checkout.payment_note' : 'checkout.payment_note_preview'} components={{ strong: <strong key="payment-partner" /> }} />
              </p>
            </div>

            {conflictIds && <p className="checkout-conflict" role="alert">{t('checkout.conflict')}</p>}
            {checkoutError && (
              <p className="checkout-conflict" role="alert">
                {t(checkoutError === 'generic' ? 'checkout.failed' : `checkout.${checkoutError}`)}
              </p>
            )}
            {(currentPricing?.failed || pricingReview) && !requestMode && (
              <p className="checkout-conflict" role="alert">
                {t('checkout.quote_failed')}{' '}
                <button type="button" className="cart-item__link" onClick={() => setQuoteRetry((value) => value + 1)}>
                  {t('checkout.retry_quote')}
                </button>
              </p>
            )}

            {/* Terms have to be in front of the guest before payment, not after —
                the Booking Policy treats completing checkout as acceptance. */}
            <p className="checkout-terms">
              <Trans
                t={t}
                i18nKey="checkout.terms_ack"
                components={{
                  booking: <Link key="booking-policy" to="/booking-policy" />,
                  terms: <Link key="terms-of-service" to="/terms-of-service" />,
                }}
              />
            </p>

            <button type="button" className="checkout-pay" disabled={checking || !paymentReady} aria-busy={checking} onClick={pay}>
              {checking && <span className="checkout-pay__spinner" aria-hidden="true" />}
              {checking
                ? t('checkout.checking')
                : (!paymentReady ? t(currentQuote || currentPricing?.failed ? 'checkout.review_selection' : 'cart.checking_prices') : t('checkout.pay_deposit', { amount: format(chargeUsd) }))}
            </button>
            <p className="checkout-footnote">
              {t('checkout.recheck_note')}
            </p>
            <p className="checkout-footnote">{t('checkout.usd_note')}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
