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
        <legend>Co chcesz zarezerwować?</legend>
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
          <span>Imię i nazwisko</span>
          <input type="text" name="name" value={form.name} onChange={update('name')} required />
        </label>
        <label className="booking-field">
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={update('email')} required />
        </label>
      </div>

      <div className="booking-row">
        <label className="booking-field">
          <span>Telefon</span>
          <input type="tel" name="phone" value={form.phone} onChange={update('phone')} placeholder="+255 / +49 / +1 ..." />
        </label>
        <label className="booking-field">
          <span>WhatsApp</span>
          <input type="tel" name="whatsapp" value={form.whatsapp} onChange={update('whatsapp')} placeholder="Jeśli inny niż telefon" />
        </label>
      </div>

      <div className={`booking-row${showDateRange ? ' booking-row--thirds' : ''}`}>
        <label className="booking-field">
          <span>{showDateRange ? 'Data rozpoczęcia' : 'Data'}</span>
          <input type="date" name="startDate" value={form.startDate} onChange={update('startDate')} />
        </label>
        {showDateRange && (
          <label className="booking-field">
            <span>Data zakończenia</span>
            <input type="date" name="endDate" value={form.endDate} onChange={update('endDate')} />
          </label>
        )}
        <label className="booking-field">
          <span>Goście</span>
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
          <legend>Szczegóły transferu</legend>
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
              <span>Miejsce odbioru</span>
              <input type="text" name="pickupLocation" value={form.pickupLocation} onChange={update('pickupLocation')} placeholder="Lotnisko ZNZ, port promowy, hotel..." />
            </label>
            <label className="booking-field">
              <span>Miejsce docelowe</span>
              <input type="text" name="dropoffLocation" value={form.dropoffLocation} onChange={update('dropoffLocation')} placeholder="Hotel, resort, lotnisko..." />
            </label>
          </div>
          <div className="booking-row">
            <label className="booking-field">
              <span>Numer lotu / promu</span>
              <input type="text" name="flightNumber" value={form.flightNumber} onChange={update('flightNumber')} placeholder="Opcjonalnie, ale pomaga w śledzeniu" />
            </label>
            <label className="booking-field">
              <span>Godzina odbioru</span>
              <input type="time" name="transferTime" value={form.transferTime} onChange={update('transferTime')} />
            </label>
          </div>
        </fieldset>
      )}

      {showTravelPreferences && (
        <div className="booking-row">
          <label className="booking-field">
            <span>Zakres budżetu</span>
            <select name="budget" value={form.budget} onChange={update('budget')}>
              <option value="">Jeszcze nie wiem</option>
              <option>Poniżej $1,000 za osobę</option>
              <option>$1,000 - $2,500 za osobę</option>
              <option>$2,500 - $5,000 za osobę</option>
              <option>$5,000 - $8,000 za osobę</option>
              <option>$8,000+ za osobę</option>
            </select>
          </label>
          <label className="booking-field">
            <span>Standard komfortu</span>
            <select name="accommodationLevel" value={form.accommodationLevel} onChange={update('accommodationLevel')}>
              <option>Budżet</option>
              <option>Średni standard</option>
              <option>Luksus</option>
              <option>Ultra luksus</option>
              <option>Elastycznie</option>
            </select>
          </label>
        </div>
      )}

      <fieldset className="booking-fieldset">
        <legend>Płatność online</legend>
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
        <span>Co jeszcze powinniśmy wiedzieć?</span>
        <textarea name="message" value={form.message} onChange={update('message')} rows={6} placeholder={messagePlaceholder} />
      </label>

      {status === 'sent' && (
        <p className="booking-status booking-status--ok">Asante. Otrzymaliśmy zapytanie i wrócimy z dostępnością, wyceną oraz kolejnym krokiem płatności.</p>
      )}
      {status === 'error' && (
        <p className="booking-status booking-status--err">Nie udało się wysłać. Spróbuj ponownie albo napisz do nas na WhatsApp.</p>
      )}

      <button className="btn btn--lg booking-submit" type="submit" disabled={status === 'sending' || status === 'sent'}>
        {status === 'sending' ? 'Wysyłanie zapytania...' : status === 'sent' ? 'Zapytanie wysłane' : 'Wyślij zapytanie'}
      </button>
    </form>
  );
}
