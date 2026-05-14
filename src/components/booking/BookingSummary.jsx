import { Link } from 'react-router-dom';
import { PAYMENT_OPTIONS, bookingPriceLabel } from '../../data/bookingPageData.js';

export default function BookingSummary({
  dateSummary,
  form,
  isTransferRequest,
  selectedProduct,
  selectedService,
  selectedTransferTier,
  showDateRange,
  showTravelPreferences,
  summaryFloat,
  summaryRef,
  summarySlotRef,
}) {
  return (
    <aside className="booking-summary-slot" ref={summarySlotRef}>
      <div
        className={`booking-summary${summaryFloat.mode === 'floating' ? ' booking-summary--floating' : ''}${summaryFloat.mode === 'bottom' ? ' booking-summary--bottom' : ''}`}
        ref={summaryRef}
        style={summaryFloat.mode === 'floating' ? { left: summaryFloat.left, width: summaryFloat.width } : undefined}
      >
        <div className="booking-summary__card">
          <span className="section-eyebrow">Your request</span>
          <h3>{selectedProduct?.label || selectedService?.label || 'Custom plan'}</h3>
          <p>{selectedProduct?.category || 'Flexible route'}</p>
          <div className="booking-summary__price">{bookingPriceLabel(selectedProduct)}</div>
          <dl>
            <div><dt>Guests</dt><dd>{form.guests || 'Flexible'}</dd></div>
            <div><dt>{showDateRange ? 'Dates' : 'Date'}</dt><dd>{dateSummary}</dd></div>
            {isTransferRequest && <div><dt>Tier</dt><dd>{selectedTransferTier?.label || 'Standard Private'}</dd></div>}
            {isTransferRequest && form.pickupLocation && <div><dt>Pickup</dt><dd>{form.pickupLocation}</dd></div>}
            {isTransferRequest && form.dropoffLocation && <div><dt>Drop-off</dt><dd>{form.dropoffLocation}</dd></div>}
            {isTransferRequest && form.transferTime && <div><dt>Time</dt><dd>{form.transferTime}</dd></div>}
            {showTravelPreferences && <div><dt>Comfort</dt><dd>{form.accommodationLevel}</dd></div>}
            <div><dt>Payment</dt><dd>{PAYMENT_OPTIONS.find((item) => item.value === form.paymentPreference)?.label}</dd></div>
          </dl>
        </div>

        <div className="booking-summary__card booking-summary__card--dark">
          <span>How payment works</span>
          <ol>
            <li>We confirm availability and the final price.</li>
            <li>You approve the route, date, and terms.</li>
            <li>We send a secure online payment link for deposit or full balance.</li>
          </ol>
          <p>No card details are entered or stored on this website.</p>
        </div>

        <div className="booking-summary__mini">
          <strong>Prefer to plan first?</strong>
          <Link to="/trip-planner">Open the AI planner →</Link>
        </div>
      </div>
    </aside>
  );
}
