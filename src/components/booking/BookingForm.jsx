import { PAYMENT_OPTIONS, SERVICE_TYPES } from '../../data/bookingPageData.js';
import { TRANSFER_SERVICE_TIERS } from '../../data/transferProducts.js';

export default function BookingForm({
  form,
  isTransferRequest,
  messagePlaceholder,
  onSubmit,
  productLabel,
  productPlaceholder,
  showDateRange,
  showTravelPreferences,
  status,
  update,
  visibleProducts,
}) {
  return (
    <form className="booking-form" id="booking-details" onSubmit={onSubmit}>

      <fieldset className="booking-fieldset">
        <legend>What are you booking?</legend>
        <div className="booking-choice-grid">
          {SERVICE_TYPES.map((item) => (
            <label className={`booking-choice${form.serviceType === item.value ? ' is-selected' : ''}`} key={item.value}>
              <input type="radio" name="serviceType" value={item.value} checked={form.serviceType === item.value} onChange={update('serviceType')} />
              <span>{item.label}</span>
              <small>{item.text}</small>
            </label>
          ))}
        </div>
      </fieldset>

      {form.serviceType !== 'custom' && (
        <label className="booking-field">
          <span>{productLabel}</span>
          <select name="product" value={form.product} onChange={update('product')}>
            <option value="">{productPlaceholder}</option>
            {visibleProducts.map((item) => (
              <option value={item.value} key={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
      )}

      <div className="booking-row">
        <label className="booking-field">
          <span>Name</span>
          <input type="text" name="name" value={form.name} onChange={update('name')} required />
        </label>
        <label className="booking-field">
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={update('email')} required />
        </label>
      </div>

      <div className="booking-row">
        <label className="booking-field">
          <span>Phone</span>
          <input type="tel" name="phone" value={form.phone} onChange={update('phone')} placeholder="+255 / +49 / +1 ..." />
        </label>
        <label className="booking-field">
          <span>WhatsApp</span>
          <input type="tel" name="whatsapp" value={form.whatsapp} onChange={update('whatsapp')} placeholder="If different from phone" />
        </label>
      </div>

      <div className={`booking-row${showDateRange ? ' booking-row--thirds' : ''}`}>
        <label className="booking-field">
          <span>{showDateRange ? 'Start date' : 'Date'}</span>
          <input type="date" name="startDate" value={form.startDate} onChange={update('startDate')} />
        </label>
        {showDateRange && (
          <label className="booking-field">
            <span>End date</span>
            <input type="date" name="endDate" value={form.endDate} onChange={update('endDate')} />
          </label>
        )}
        <label className="booking-field">
          <span>Guests</span>
          <select name="guests" value={form.guests} onChange={update('guests')}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6+</option>
            <option>10+</option>
          </select>
        </label>
      </div>

      {isTransferRequest && (
        <fieldset className="booking-fieldset">
          <legend>Transfer details</legend>
          <div className="booking-transfer-tier-grid">
            {TRANSFER_SERVICE_TIERS.map((item) => (
              <label className={`booking-payment${form.transferTier === item.value ? ' is-selected' : ''}`} key={item.value}>
                <input type="radio" name="transferTier" value={item.value} checked={form.transferTier === item.value} onChange={update('transferTier')} />
                <span>{item.label}</span>
                <small>{item.text}</small>
              </label>
            ))}
          </div>
          <div className="booking-row">
            <label className="booking-field">
              <span>Pickup location</span>
              <input type="text" name="pickupLocation" value={form.pickupLocation} onChange={update('pickupLocation')} placeholder="ZNZ Airport, ferry port, hotel..." />
            </label>
            <label className="booking-field">
              <span>Drop-off location</span>
              <input type="text" name="dropoffLocation" value={form.dropoffLocation} onChange={update('dropoffLocation')} placeholder="Hotel, resort, airport..." />
            </label>
          </div>
          <div className="booking-row">
            <label className="booking-field">
              <span>Flight / ferry number</span>
              <input type="text" name="flightNumber" value={form.flightNumber} onChange={update('flightNumber')} placeholder="Optional, but useful for tracking" />
            </label>
            <label className="booking-field">
              <span>Pickup time</span>
              <input type="time" name="transferTime" value={form.transferTime} onChange={update('transferTime')} />
            </label>
          </div>
        </fieldset>
      )}

      {showTravelPreferences && (
        <div className="booking-row">
          <label className="booking-field">
            <span>Budget range</span>
            <select name="budget" value={form.budget} onChange={update('budget')}>
              <option value="">Not sure yet</option>
              <option>Under $1,000 pp</option>
              <option>$1,000 - $2,500 pp</option>
              <option>$2,500 - $5,000 pp</option>
              <option>$5,000 - $8,000 pp</option>
              <option>$8,000+ pp</option>
            </select>
          </label>
          <label className="booking-field">
            <span>Comfort level</span>
            <select name="accommodationLevel" value={form.accommodationLevel} onChange={update('accommodationLevel')}>
              <option>Budget</option>
              <option>Mid-range</option>
              <option>Luxury</option>
              <option>Ultra luxury</option>
              <option>Flexible</option>
            </select>
          </label>
        </div>
      )}

      <fieldset className="booking-fieldset">
        <legend>Online payment</legend>
        <div className="booking-payment-grid">
          {PAYMENT_OPTIONS.map((item) => (
            <label className={`booking-payment${form.paymentPreference === item.value ? ' is-selected' : ''}`} key={item.value}>
              <input type="radio" name="paymentPreference" value={item.value} checked={form.paymentPreference === item.value} onChange={update('paymentPreference')} />
              <span>{item.label}</span>
              <small>{item.text}</small>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="booking-field">
        <span>Anything we should know?</span>
        <textarea name="message" value={form.message} onChange={update('message')} rows={6} placeholder={messagePlaceholder} />
      </label>

      {status === 'sent' && (
        <p className="booking-status booking-status--ok">Asante. We received your request and will come back with availability, a quote, and the payment next step.</p>
      )}
      {status === 'error' && (
        <p className="booking-status booking-status--err">That did not go through. Please try again or message us on WhatsApp.</p>
      )}

      <button className="btn btn--lg booking-submit" type="submit" disabled={status === 'sending' || status === 'sent'}>
        {status === 'sending' ? 'Sending request...' : status === 'sent' ? 'Request sent' : 'Send booking request'}
      </button>
    </form>
  );
}
