import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import BookingFlow from '../components/booking/BookingFlow.jsx';
import BookingForm from '../components/booking/BookingForm.jsx';
import BookingHero from '../components/booking/BookingHero.jsx';
import BookingSummary from '../components/booking/BookingSummary.jsx';
import BookingSupportCta from '../components/booking/BookingSupportCta.jsx';
import {
  BUDGET_OPTIONS,
  COMFORT_OPTIONS,
  DEFAULT_BOOKING_FORM,
  PAYMENT_OPTIONS,
  SERVICE_TYPES,
  bookingPriceLabel,
  translatedLabel,
  translatedList,
} from '../data/bookingPageData.js';
import { TRANSFER_SERVICE_TIERS } from '../data/transferProducts.js';
import { useBookingProducts } from '../hooks/useBookingProducts.js';
import { useFloatingBookingSummary } from '../hooks/useFloatingBookingSummary.js';
import { buildPlannerHandoff, clearPlannerHandoff, isPlannerHandoffMessage, readPlannerHandoff } from '../utils/plannerHandoff.js';
import { useCurrency } from '../context/useCurrency.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/booking.css';

export default function Booking() {
  const { t } = useTranslation('booking');
  const { format } = useCurrency();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const products = useBookingProducts(t);
  const [form, setForm] = useState(DEFAULT_BOOKING_FORM);
  const [plannerHandoff, setPlannerHandoff] = useState(null);
  const [status, setStatus] = useState('idle');
  const layoutRef = useRef(null);
  const summarySlotRef = useRef(null);
  const summaryRef = useRef(null);
  const summaryFloat = useFloatingBookingSummary(layoutRef, summarySlotRef, summaryRef, form);
  const serviceTypes = useMemo(() => translatedList(t, 'service_types', SERVICE_TYPES), [t]);
  const paymentOptions = useMemo(() => translatedList(t, 'payment_options', PAYMENT_OPTIONS), [t]);
  const transferTiers = useMemo(() => translatedList(t, 'transfer_tiers', TRANSFER_SERVICE_TIERS), [t]);
  const budgetOptions = useMemo(() => translatedList(t, 'budget_options', BUDGET_OPTIONS), [t]);
  const comfortOptions = useMemo(() => translatedList(t, 'comfort_options', COMFORT_OPTIONS), [t]);

  useEffect(() => {
    document.title = t('page_title', { defaultValue: 'Booking Request · Destination Paradise' });
  }, [t]);

  useEffect(() => {
    if (location.hash !== '#booking-details') return undefined;

    const timeoutId = window.setTimeout(() => {
      document.getElementById('booking-details')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [location.hash, location.search]);

  useEffect(() => {
    const type = searchParams.get('type');
    const item = searchParams.get('item') || searchParams.get('product');
    if (!type && !item) return;

    const matched = products.all.find((product) => (
      (type ? product.type === type : true) &&
      (product.raw.slug === item || product.raw.id === item || product.value === item)
    ));

    if (matched) {
      setForm((current) => ({
        ...current,
        serviceType: matched.type,
        product: matched.value,
      }));
    } else if (type || item) {
      const title = searchParams.get('title');
      setForm((current) => ({
        ...current,
        serviceType: serviceTypes.some((service) => service.value === type) ? type : 'custom',
        message: title
          ? t('form.unmatched_message', {
            title,
            message: current.message,
            defaultValue: 'I am interested in {{title}}. {{message}}',
          }).trim()
          : current.message,
      }));
    }
  }, [products.all, searchParams, serviceTypes, t]);

  useEffect(() => {
    if (searchParams.get('source') !== 'planner') return undefined;

    const handoff = readPlannerHandoff() || buildPlannerHandoff([], '/trip-planner');
    setPlannerHandoff(handoff);
    setStatus('idle');
    const contact = handoff.contact || {};
    setForm((current) => ({
      ...current,
      serviceType: 'custom',
      product: '',
      paymentPreference: 'later',
      name: !current.name.trim() && contact.name ? contact.name : current.name,
      email: !current.email.trim() && contact.email ? contact.email : current.email,
      phone: !current.phone.trim() && contact.phone ? contact.phone : current.phone,
      message: !current.message.trim() || isPlannerHandoffMessage(current.message)
        ? handoff.message
        : current.message,
    }));

    const timeoutId = window.setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [searchParams]);

  const selectedProduct = products.all.find((item) => item.value === form.product);
  const visibleProducts = form.serviceType === 'custom'
    ? []
    : products.all.filter((item) => item.type === form.serviceType);
  const selectedService = serviceTypes.find((item) => item.value === form.serviceType);
  const isExcursionRequest = form.serviceType === 'excursion';
  const isTransferRequest = form.serviceType === 'transfer';
  const selectedTransferTier = transferTiers.find((item) => item.value === form.transferTier);
  const showDateRange = !isExcursionRequest && !isTransferRequest;
  const showTravelPreferences = !isExcursionRequest && !isTransferRequest;
  const dateSummary = showDateRange
    ? `${form.startDate || t('common.flexible', { defaultValue: 'Flexible' })}${form.endDate ? ` ${t('common.date_to', { defaultValue: 'to' })} ${form.endDate}` : ''}`
    : form.startDate || t('common.flexible', { defaultValue: 'Flexible' });
  const productLabel = isTransferRequest
    ? t('form.product_label_transfer', { defaultValue: 'Transfer route' })
    : t('form.product_label_default', { defaultValue: 'Specific product' });
  const productPlaceholder = isTransferRequest
    ? t('form.product_placeholder_transfer', { defaultValue: 'Choose a transfer route or leave flexible' })
    : t('form.product_placeholder_default', {
      serviceType: form.serviceType,
      defaultValue: 'Choose from {{serviceType}}s or leave flexible',
    });
  const messagePlaceholder = isTransferRequest
    ? t('form.message_placeholder_transfer', { defaultValue: 'Arrival notes, luggage count, child seats, hotel room name, VIP preferences, or timing details.' })
    : isExcursionRequest
    ? t('form.message_placeholder_excursion', { defaultValue: 'Preferred pickup area, hotel name, private/shared preference, kids ages, dietary needs, or timing notes.' })
    : t('form.message_placeholder_default', { defaultValue: "Hotels you like, pace, special occasion, kids' ages, dietary needs, flight details, or what you want to avoid." });
  const accommodationLabel = translatedLabel(comfortOptions, form.accommodationLevel, form.accommodationLevel);
  const budgetLabel = translatedLabel(budgetOptions, form.budget, form.budget);

  const update = (key) => (event) => {
    const value = event.target.value;
    setStatus('idle');
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'serviceType'
        ? {
          product: '',
          endDate: value === 'excursion' || value === 'transfer' ? '' : current.endDate,
          budget: value === 'excursion' || value === 'transfer' ? '' : current.budget,
          accommodationLevel: value === 'excursion' || value === 'transfer' ? '' : current.accommodationLevel || 'Mid-range',
          transferTier: value === 'transfer' ? current.transferTier || 'standard-private' : current.transferTier,
        }
        : {}),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    setStatus('sending');

    const payload = {
      ...form,
      endDate: showDateRange ? form.endDate : '',
      budget: showTravelPreferences ? form.budget : '',
      budgetLabel: showTravelPreferences ? budgetLabel : '',
      accommodationLevel: showTravelPreferences ? accommodationLabel : '',
      transferTier: isTransferRequest ? selectedTransferTier?.label || form.transferTier : '',
      pickupLocation: isTransferRequest ? form.pickupLocation : '',
      dropoffLocation: isTransferRequest ? form.dropoffLocation : '',
      flightNumber: isTransferRequest ? form.flightNumber : '',
      transferTime: isTransferRequest ? form.transferTime : '',
      productLabel: selectedProduct?.label || t('common.not_selected', { defaultValue: 'Not selected' }),
      estimatedPrice: bookingPriceLabel(selectedProduct, t, format),
      source: plannerHandoff ? 'planner' : 'booking',
      plannerDraft: plannerHandoff?.transcript || '',
    };

    try {
      const response = await fetch('/api/booking-send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || 'booking-request-failed');
      setStatus('sent');
      setForm(DEFAULT_BOOKING_FORM);
      clearPlannerHandoff();
      setPlannerHandoff(null);
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="booking-page">
      <BookingHero />
      <BookingFlow />

      <section className="booking-shell" id="booking-form">
        <div className="booking-intro">
          <span className="section-eyebrow">{t('intro.eyebrow', { defaultValue: 'Tell us what to build' })}</span>
          <h2 className="section-title">{t('intro.title', { defaultValue: 'Request availability, quote, and payment link.' })}</h2>
          <p className="section-lead">{t('intro.lead', { defaultValue: 'We do not collect card details on this page. If you choose online payment, we will send a secure payment link after the route and price are confirmed.' })}</p>
        </div>

        <div className="booking-layout" ref={layoutRef}>
          <BookingForm
            budgetOptions={budgetOptions}
            comfortOptions={comfortOptions}
            form={form}
            isTransferRequest={isTransferRequest}
            messagePlaceholder={messagePlaceholder}
            onSubmit={submit}
            paymentOptions={paymentOptions}
            productLabel={productLabel}
            productPlaceholder={productPlaceholder}
            serviceTypes={serviceTypes}
            showDateRange={showDateRange}
            showTravelPreferences={showTravelPreferences}
            status={status}
            transferTiers={transferTiers}
            update={update}
            visibleProducts={visibleProducts}
          />

          <BookingSummary
            accommodationLabel={accommodationLabel}
            dateSummary={dateSummary}
            form={form}
            isTransferRequest={isTransferRequest}
            paymentOptions={paymentOptions}
            selectedProduct={selectedProduct}
            selectedService={selectedService}
            selectedTransferTier={selectedTransferTier}
            showDateRange={showDateRange}
            showTravelPreferences={showTravelPreferences}
            summaryFloat={summaryFloat}
            summaryRef={summaryRef}
            summarySlotRef={summarySlotRef}
          />
        </div>
      </section>

      <BookingSupportCta />
    </main>
  );
}
