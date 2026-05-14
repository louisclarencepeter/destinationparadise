import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import BookingFlow from '../components/booking/BookingFlow.jsx';
import BookingForm from '../components/booking/BookingForm.jsx';
import BookingHero from '../components/booking/BookingHero.jsx';
import BookingSummary from '../components/booking/BookingSummary.jsx';
import BookingSupportCta from '../components/booking/BookingSupportCta.jsx';
import { DEFAULT_BOOKING_FORM, SERVICE_TYPES, bookingPriceLabel } from '../data/bookingPageData.js';
import { TRANSFER_SERVICE_TIERS } from '../data/transferProducts.js';
import { useBookingProducts } from '../hooks/useBookingProducts.js';
import { useFloatingBookingSummary } from '../hooks/useFloatingBookingSummary.js';
import { buildPlannerHandoff, clearPlannerHandoff, isPlannerHandoffMessage, readPlannerHandoff } from '../utils/plannerHandoff.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/booking.css';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const products = useBookingProducts();
  const [form, setForm] = useState(DEFAULT_BOOKING_FORM);
  const [plannerHandoff, setPlannerHandoff] = useState(null);
  const [status, setStatus] = useState('idle');
  const layoutRef = useRef(null);
  const summarySlotRef = useRef(null);
  const summaryRef = useRef(null);
  const summaryFloat = useFloatingBookingSummary(layoutRef, summarySlotRef, summaryRef, form);

  useEffect(() => {
    document.title = 'Zapytanie rezerwacyjne · Destination Paradise';
  }, []);

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
        serviceType: SERVICE_TYPES.some((service) => service.value === type) ? type : 'custom',
        message: title ? `Interesuje mnie: ${title}. ${current.message}`.trim() : current.message,
      }));
    }
  }, [products.all, searchParams]);

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
  const selectedService = SERVICE_TYPES.find((item) => item.value === form.serviceType);
  const isExcursionRequest = form.serviceType === 'excursion';
  const isTransferRequest = form.serviceType === 'transfer';
  const selectedTransferTier = TRANSFER_SERVICE_TIERS.find((item) => item.value === form.transferTier);
  const showDateRange = !isExcursionRequest && !isTransferRequest;
  const showTravelPreferences = !isExcursionRequest && !isTransferRequest;
  const dateSummary = showDateRange
    ? `${form.startDate || 'Elastycznie'}${form.endDate ? ` do ${form.endDate}` : ''}`
    : form.startDate || 'Elastycznie';
  const productLabel = isTransferRequest ? 'Trasa transferu' : 'Konkretny produkt';
  const productPlaceholder = isTransferRequest
    ? 'Wybierz trasę transferu albo zostaw elastycznie'
    : 'Wybierz produkt albo zostaw elastycznie';
  const messagePlaceholder = isTransferRequest
    ? 'Informacje o przylocie, liczba bagaży, foteliki dziecięce, nazwa hotelu, preferencje VIP albo szczegóły godzin.'
    : isExcursionRequest
    ? 'Preferowana okolica odbioru, nazwa hotelu, prywatnie albo w grupie, wiek dzieci, dieta albo szczegóły godzin.'
    : 'Hotele, które lubisz, tempo, specjalna okazja, wiek dzieci, dieta, loty albo to, czego chcesz uniknąć.';

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
          accommodationLevel: value === 'excursion' || value === 'transfer' ? '' : current.accommodationLevel || 'Średni standard',
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
      accommodationLevel: showTravelPreferences ? form.accommodationLevel : '',
      transferTier: isTransferRequest ? selectedTransferTier?.label || form.transferTier : '',
      pickupLocation: isTransferRequest ? form.pickupLocation : '',
      dropoffLocation: isTransferRequest ? form.dropoffLocation : '',
      flightNumber: isTransferRequest ? form.flightNumber : '',
      transferTime: isTransferRequest ? form.transferTime : '',
      productLabel: selectedProduct?.label || 'Nie wybrano',
      estimatedPrice: bookingPriceLabel(selectedProduct),
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
          <span className="section-eyebrow">Powiedz, co mamy przygotować</span>
          <h2 className="section-title">Poproś o dostępność, wycenę i link do płatności.</h2>
          <p className="section-lead">Nie zbieramy danych karty na tej stronie. Jeśli wybierzesz płatność online, wyślemy bezpieczny link po potwierdzeniu trasy i ceny.</p>
        </div>

        <div className="booking-layout" ref={layoutRef}>
          <BookingForm
            form={form}
            isTransferRequest={isTransferRequest}
            messagePlaceholder={messagePlaceholder}
            onSubmit={submit}
            productLabel={productLabel}
            productPlaceholder={productPlaceholder}
            showDateRange={showDateRange}
            showTravelPreferences={showTravelPreferences}
            status={status}
            update={update}
            visibleProducts={visibleProducts}
          />

          <BookingSummary
            dateSummary={dateSummary}
            form={form}
            isTransferRequest={isTransferRequest}
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
