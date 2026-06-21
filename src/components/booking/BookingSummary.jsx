import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { bookingPriceLabel } from '../../data/bookingPageData.js';
import { useCurrency } from '../../context/useCurrency.js';

export default function BookingSummary({
  accommodationLabel,
  dateSummary,
  form,
  isTransferRequest,
  paymentOptions,
  selectedProduct,
  selectedService,
  selectedTransferTier,
  showDateRange,
  showTravelPreferences,
  summaryFloat,
  summaryRef,
  summarySlotRef,
}) {
  const { t } = useTranslation('booking');
  const { format } = useCurrency();
  const paymentSteps = t('summary.payment_steps', {
    returnObjects: true,
    defaultValue: [
      'We confirm availability and the final price.',
      'You approve the route, date, and terms.',
      'We send a secure online payment link for deposit or full balance.',
    ],
  });

  return (
    <aside className="booking-summary-slot" ref={summarySlotRef}>
      <div
        className={`booking-summary${summaryFloat.mode === 'floating' ? ' booking-summary--floating' : ''}${summaryFloat.mode === 'bottom' ? ' booking-summary--bottom' : ''}`}
        ref={summaryRef}
        style={summaryFloat.mode === 'floating' ? { left: summaryFloat.left, width: summaryFloat.width } : undefined}
      >
        <div className="booking-summary__card reveal" style={{ '--reveal-index': 0 }}>
          <span className="section-eyebrow">{t('summary.eyebrow', { defaultValue: 'Your request' })}</span>
          <h3>{selectedProduct?.label || selectedService?.label || t('summary.custom_plan', { defaultValue: 'Custom plan' })}</h3>
          <p>{selectedProduct?.category || t('summary.flexible_route', { defaultValue: 'Flexible route' })}</p>
          <div className="booking-summary__price">{bookingPriceLabel(selectedProduct, t, format)}</div>
          <dl>
            <div><dt>{t('summary.guests', { defaultValue: 'Guests' })}</dt><dd>{form.guests || t('common.flexible', { defaultValue: 'Flexible' })}</dd></div>
            <div><dt>{showDateRange ? t('summary.dates', { defaultValue: 'Dates' }) : t('summary.date', { defaultValue: 'Date' })}</dt><dd>{dateSummary}</dd></div>
            {isTransferRequest && <div><dt>{t('summary.tier', { defaultValue: 'Tier' })}</dt><dd>{selectedTransferTier?.label || t('summary.default_tier', { defaultValue: 'Standard Private' })}</dd></div>}
            {isTransferRequest && form.pickupLocation && <div><dt>{t('summary.pickup', { defaultValue: 'Pickup' })}</dt><dd>{form.pickupLocation}</dd></div>}
            {isTransferRequest && form.dropoffLocation && <div><dt>{t('summary.dropoff', { defaultValue: 'Drop-off' })}</dt><dd>{form.dropoffLocation}</dd></div>}
            {isTransferRequest && form.transferTime && <div><dt>{t('summary.time', { defaultValue: 'Time' })}</dt><dd>{form.transferTime}</dd></div>}
            {showTravelPreferences && <div><dt>{t('summary.comfort', { defaultValue: 'Comfort' })}</dt><dd>{accommodationLabel}</dd></div>}
            <div><dt>{t('summary.payment', { defaultValue: 'Payment' })}</dt><dd>{paymentOptions.find((item) => item.value === form.paymentPreference)?.label}</dd></div>
          </dl>
        </div>

        <div className="booking-summary__card booking-summary__card--dark reveal" style={{ '--reveal-index': 1 }}>
          <span>{t('summary.payment_title', { defaultValue: 'How payment works' })}</span>
          <ol>
            {Array.isArray(paymentSteps) && paymentSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>{t('summary.payment_note', { defaultValue: 'No card details are entered or stored on this website.' })}</p>
        </div>

        <div className="booking-summary__mini reveal" style={{ '--reveal-index': 2 }}>
          <strong>{t('summary.mini_title', { defaultValue: 'Prefer to plan first?' })}</strong>
          <Link to="/trip-planner">{t('summary.mini_link', { defaultValue: 'Open the AI planner →' })}</Link>
        </div>
      </div>
    </aside>
  );
}
