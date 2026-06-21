import { useTranslation } from 'react-i18next';

export default function BookingForm({
  budgetOptions,
  comfortOptions,
  errorMessage,
  form,
  isRetreatRequest,
  isTransferRequest,
  messagePlaceholder,
  onDepartureChange,
  onSubmit,
  paymentOptions,
  productLabel,
  productPlaceholder,
  retreatDepartures,
  serviceTypes,
  showDateRange,
  showTravelPreferences,
  status,
  transferTiers,
  update,
  visibleProducts,
}) {
  const { t } = useTranslation('booking');

  return (
    <form className="booking-form" id="booking-details" onSubmit={onSubmit}>

      <fieldset className="booking-fieldset">
        <legend>{t('form.booking_legend', { defaultValue: 'What are you booking?' })}</legend>
        <div className="booking-choice-grid">
          {serviceTypes.map((item) => (
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
          <span>{t('form.name', { defaultValue: 'Name' })}</span>
          <input type="text" name="name" value={form.name} onChange={update('name')} required />
        </label>
        <label className="booking-field">
          <span>{t('form.email', { defaultValue: 'Email' })}</span>
          <input type="email" name="email" value={form.email} onChange={update('email')} required />
        </label>
      </div>

      <div className="booking-row">
        <label className="booking-field">
          <span>{t('form.phone', { defaultValue: 'Phone' })}</span>
          <input type="tel" name="phone" value={form.phone} onChange={update('phone')} placeholder={t('form.phone_placeholder', { defaultValue: '+255 / +49 / +1 ...' })} />
        </label>
        <label className="booking-field">
          <span>{t('form.whatsapp', { defaultValue: 'WhatsApp' })}</span>
          <input type="tel" name="whatsapp" value={form.whatsapp} onChange={update('whatsapp')} placeholder={t('form.whatsapp_placeholder', { defaultValue: 'If different from phone' })} />
        </label>
      </div>

      <div className={`booking-row${showDateRange && !isRetreatRequest ? ' booking-row--thirds' : ''}`}>
        {isRetreatRequest ? (
          <label className="booking-field">
            <span>{t('form.retreat_departure', { defaultValue: 'Retreat departure' })}</span>
            <select name="retreatDeparture" value={form.startDate} onChange={onDepartureChange}>
              <option value="">{t('form.retreat_departure_placeholder', { defaultValue: 'Choose a departure' })}</option>
              {retreatDepartures.map((departure) => (
                <option value={departure.start} key={departure.start}>{departure.label}</option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className="booking-field">
              <span>{showDateRange ? t('form.start_date', { defaultValue: 'Start date' }) : t('form.date', { defaultValue: 'Date' })}</span>
              <input type="date" name="startDate" value={form.startDate} onChange={update('startDate')} />
            </label>
            {showDateRange && (
              <label className="booking-field">
                <span>{t('form.end_date', { defaultValue: 'End date' })}</span>
                <input type="date" name="endDate" value={form.endDate} onChange={update('endDate')} />
              </label>
            )}
          </>
        )}
        <label className="booking-field">
          <span>{t('form.guests', { defaultValue: 'Guests' })}</span>
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
          <legend>{t('form.transfer_legend', { defaultValue: 'Transfer details' })}</legend>
          <div className="booking-transfer-tier-grid">
            {transferTiers.map((item) => (
              <label className={`booking-payment${form.transferTier === item.value ? ' is-selected' : ''}`} key={item.value}>
                <input type="radio" name="transferTier" value={item.value} checked={form.transferTier === item.value} onChange={update('transferTier')} />
                <span>{item.label}</span>
                <small>{item.text}</small>
              </label>
            ))}
          </div>
          <div className="booking-row">
            <label className="booking-field">
              <span>{t('form.pickup_location', { defaultValue: 'Pickup location' })}</span>
              <input type="text" name="pickupLocation" value={form.pickupLocation} onChange={update('pickupLocation')} placeholder={t('form.pickup_placeholder', { defaultValue: 'ZNZ Airport, ferry port, hotel...' })} />
            </label>
            <label className="booking-field">
              <span>{t('form.dropoff_location', { defaultValue: 'Drop-off location' })}</span>
              <input type="text" name="dropoffLocation" value={form.dropoffLocation} onChange={update('dropoffLocation')} placeholder={t('form.dropoff_placeholder', { defaultValue: 'Hotel, resort, airport...' })} />
            </label>
          </div>
          <div className="booking-row">
            <label className="booking-field">
              <span>{t('form.flight_number', { defaultValue: 'Flight / ferry number' })}</span>
              <input type="text" name="flightNumber" value={form.flightNumber} onChange={update('flightNumber')} placeholder={t('form.flight_placeholder', { defaultValue: 'Optional, but useful for tracking' })} />
            </label>
            <label className="booking-field">
              <span>{t('form.pickup_time', { defaultValue: 'Pickup time' })}</span>
              <input type="time" name="transferTime" value={form.transferTime} onChange={update('transferTime')} />
            </label>
          </div>
        </fieldset>
      )}

      {showTravelPreferences && (
        <div className="booking-row">
          <label className="booking-field">
            <span>{t('form.budget_range', { defaultValue: 'Budget range' })}</span>
            <select name="budget" value={form.budget} onChange={update('budget')}>
              {budgetOptions.map((item) => (
                <option value={item.value} key={item.value || 'empty'}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="booking-field">
            <span>{t('form.comfort_level', { defaultValue: 'Comfort level' })}</span>
            <select name="accommodationLevel" value={form.accommodationLevel} onChange={update('accommodationLevel')}>
              {comfortOptions.map((item) => (
                <option value={item.value} key={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <fieldset className="booking-fieldset">
        <legend>{t('form.online_payment', { defaultValue: 'Online payment' })}</legend>
        <div className="booking-payment-grid">
          {paymentOptions.map((item) => (
            <label className={`booking-payment${form.paymentPreference === item.value ? ' is-selected' : ''}`} key={item.value}>
              <input type="radio" name="paymentPreference" value={item.value} checked={form.paymentPreference === item.value} onChange={update('paymentPreference')} />
              <span>{item.label}</span>
              <small>{item.text}</small>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="booking-field">
        <span>{t('form.message_label', { defaultValue: 'Anything we should know?' })}</span>
        <textarea name="message" value={form.message} onChange={update('message')} rows={6} placeholder={messagePlaceholder} />
      </label>

      <div className="booking-status-region" role="status" aria-live="polite">
        {status === 'sent' && (
          <p className="booking-status booking-status--ok">{t('form.status_sent', { defaultValue: 'Asante. We received your request and will come back with availability, a quote, and the payment next step.' })}</p>
        )}
      </div>
      {status === 'error' && (
        <p className="booking-status booking-status--err" role="alert">
          {errorMessage || t('form.status_error', { defaultValue: 'That did not go through. Please try again or message us on WhatsApp.' })}
        </p>
      )}

      <button className="btn btn--lg booking-submit" type="submit" disabled={status === 'sending' || status === 'sent'}>
        {status === 'sending'
          ? t('form.submit_sending', { defaultValue: 'Sending request...' })
          : status === 'sent'
          ? t('form.submit_sent', { defaultValue: 'Request sent' })
          : t('form.submit_idle', { defaultValue: 'Send booking request' })}
      </button>
    </form>
  );
}
