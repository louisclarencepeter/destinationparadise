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
          <span className="section-eyebrow">Twoje zapytanie</span>
          <h3>{selectedProduct?.label || selectedService?.label || 'Plan na miarę'}</h3>
          <p>{selectedProduct?.category || 'Elastyczna trasa'}</p>
          <div className="booking-summary__price">{bookingPriceLabel(selectedProduct)}</div>
          <dl>
            <div><dt>Goście</dt><dd>{form.guests || 'Elastycznie'}</dd></div>
            <div><dt>{showDateRange ? 'Daty' : 'Data'}</dt><dd>{dateSummary}</dd></div>
            {isTransferRequest && <div><dt>Poziom</dt><dd>{selectedTransferTier?.label || 'Standard prywatny'}</dd></div>}
            {isTransferRequest && form.pickupLocation && <div><dt>Odbiór</dt><dd>{form.pickupLocation}</dd></div>}
            {isTransferRequest && form.dropoffLocation && <div><dt>Cel</dt><dd>{form.dropoffLocation}</dd></div>}
            {isTransferRequest && form.transferTime && <div><dt>Godzina</dt><dd>{form.transferTime}</dd></div>}
            {showTravelPreferences && <div><dt>Komfort</dt><dd>{form.accommodationLevel}</dd></div>}
            <div><dt>Płatność</dt><dd>{PAYMENT_OPTIONS.find((item) => item.value === form.paymentPreference)?.label}</dd></div>
          </dl>
        </div>

        <div className="booking-summary__card booking-summary__card--dark">
          <span>Jak działa płatność</span>
          <ol>
            <li>Potwierdzamy dostępność i końcową cenę.</li>
            <li>Akceptujesz trasę, datę i warunki.</li>
            <li>Wysyłamy bezpieczny link online na zaliczkę albo pełną kwotę.</li>
          </ol>
          <p>Na tej stronie nie wpisujesz i nie zapisujemy danych karty.</p>
        </div>

        <div className="booking-summary__mini">
          <strong>Wolisz najpierw zaplanować?</strong>
          <Link to="/trip-planner">Otwórz planer AI →</Link>
        </div>
      </div>
    </aside>
  );
}
