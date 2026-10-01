import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/useCurrency.js';
import { useBookingCart } from '../../context/useBookingCart.js';
import { useAvailability } from '../../hooks/useAvailability.js';
import { BOOKING_END_DATE, depositBreakdown, fetchBookingPricing, priceSelection, todayInStoreTz } from '../../lib/storeApi.js';
import { monthIsoOf, shiftMonthIso } from '../../lib/storeFormat.js';
import { MAX_GUESTS_PER_ITEM, newCartItemId } from '../../lib/storeCart.js';
import { MAX_INSTANT_GUESTS, PICKUP_ZONES } from '../../lib/storePricing.js';
import { convert } from '../../utils/currency.js';
import { trackEvent } from '../../utils/analytics.js';
import AvailabilityCalendar from './AvailabilityCalendar.jsx';
import TimeSlotPicker from './TimeSlotPicker.jsx';
import GuestPicker from './GuestPicker.jsx';
import PickupFields from './PickupFields.jsx';
import { ArrowRightIcon } from './StoreIcons.jsx';

export const STORE_GUESTS_KEY = 'dp_store_guests_v1';

function defaultGuests(experience) {
  let stored = 2;
  try {
    stored = Number(window.sessionStorage.getItem(STORE_GUESTS_KEY)) || 2;
  } catch {
    stored = 2;
  }
  return Math.min(Math.max(Math.trunc(stored), experience.minGuests), MAX_GUESTS_PER_ITEM);
}

// Instant-booking panel: shared/private toggle, guests, availability calendar,
// departure slots, live price breakdown, add-to-trip. With `?edit=<cartItemId>`
// it loads that cart line and saves changes back to it.
export default function BookingPanel({ experience }) {
  const { t, i18n } = useTranslation('store');
  const { currency, rates } = useCurrency();
  // Preserve the selected display currency, with cents for the quote breakdown.
  // These are estimates when converted; checkout reviews the USD amounts.
  const format = (amountUsd) => new Intl.NumberFormat(i18n.resolvedLanguage || 'en', {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(convert(amountUsd, currency, rates));
  const { state: cart, dispatch } = useBookingCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const today = todayInStoreTz();
  const minMonth = monthIsoOf(today);
  const maxMonth = monthIsoOf(BOOKING_END_DATE);

  const editId = searchParams.get('edit');
  const editItem = editId
    ? cart.items.find((item) =>
        item.id === editId && item.experienceId === experience.id &&
        item.mode !== 'request' && item.date && item.time)
    : null;

  /** @typedef {{ date: string, bookable: boolean, times: {time: string, seats: number}[] | null }} DaySnapshot */
  const [mode, setMode] = useState('shared');
  const [guests, setGuests] = useState(() => defaultGuests(experience));
  const [monthIso, setMonthIso] = useState(minMonth);
  const [selectedDay, setSelectedDay] = useState(/** @type {DaySnapshot | null} */ (null));
  const [selectedTime, setSelectedTime] = useState(/** @type {string | null} */ (null));
  const [pickupZone, setPickupZone] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [pricing, setPricing] = useState(
    /** @type {{ experienceId: string, value: any, loading: boolean, failed: boolean }} */
    ({ experienceId: '', value: null, loading: true, failed: false }),
  );

  useEffect(() => {
    let active = true;
    setPricing({ experienceId: experience.id, value: null, loading: true, failed: false });
    fetchBookingPricing(experience.id).then((value) => {
      if (active) setPricing({ experienceId: experience.id, value, loading: false, failed: false });
    }).catch(() => {
      if (active) setPricing({ experienceId: experience.id, value: null, loading: false, failed: true });
    });
    return () => { active = false; };
  }, [experience.id]);

  // Load the cart line being edited exactly once per edit id.
  const appliedEditRef = useRef(/** @type {string | null} */ (null));
  useEffect(() => {
    if (!editItem?.date || !editItem?.time || appliedEditRef.current === editItem.id) return;
    const { date, time } = editItem;
    appliedEditRef.current = editItem.id;
    setMode(editItem.mode);
    setGuests(Math.min(editItem.guests, MAX_GUESTS_PER_ITEM));
    setPickupZone(editItem.pickupZone || '');
    setAccommodation((editItem.accommodation || '').slice(0, 200));
    setMonthIso((current) => {
      const target = monthIsoOf(date);
      return target >= minMonth && target <= maxMonth ? target : current;
    });
    setSelectedDay({ date, bookable: false, times: null });
    setSelectedTime(time);
  }, [editItem, minMonth, maxMonth]);

  const { loading, days } = useAvailability(experience.id, monthIso);

  // Keep the selected day's slot snapshot fresh when its month is on screen
  // (also fills in the snapshot for a cart line loaded via ?edit=).
  useEffect(() => {
    if (!days || !selectedDay) return;
    const info = days[selectedDay.date];
    if (info) setSelectedDay((current) => (current ? { ...current, bookable: Boolean(info.bookable), times: info.times } : current));
  }, [days, selectedDay?.date]); // eslint-disable-line react-hooks/exhaustive-deps

  const slots = selectedDay?.times || null;

  // Guests can grow after a time was picked — drop a selection that no longer fits.
  useEffect(() => {
    if (!slots || !selectedTime) return;
    const slot = slots.find((entry) => entry.time === selectedTime);
    if (slot && slot.seats < guests) setSelectedTime(null);
  }, [guests, slots, selectedTime]);

  const currentPricing = pricing.experienceId === experience.id ? pricing : null;
  const pricingLoading = !currentPricing || currentPricing.loading;
  const price = useMemo(() => priceSelection({
    ...experience, groupPickupPricing: currentPricing?.value || null,
  }, mode, guests, pickupZone), [experience, currentPricing?.value, mode, guests, pickupZone]);
  const priceUnavailable = pricingLoading || price.quoteRequired || price.totalUsd == null || !Number.isFinite(price.totalUsd);
  const pickupComplete = PICKUP_ZONES.includes(pickupZone) && Boolean(accommodation.trim());
  const eligibleGroup = Number.isInteger(guests) && guests >= experience.minGuests && guests <= MAX_INSTANT_GUESTS;
  const selectedSlot = slots?.find((slot) => slot.time === selectedTime);
  const departureBookable = Boolean(selectedDay?.bookable && selectedDay.date >= today &&
    selectedDay.date <= BOOKING_END_DATE && selectedSlot && selectedSlot.seats >= guests);
  const canSubmit = eligibleGroup && pickupComplete && pickupZone !== 'other' && departureBookable;
  const payment = !priceUnavailable && price.totalUsd != null ? depositBreakdown(price.totalUsd) : null;
  const quoteHint = guests > MAX_INSTANT_GUESTS ? 'panel.quote_large_group' : pickupZone === 'other' ? 'panel.quote_other_area' :
    pricingLoading ? 'panel.loading_prices' : currentPricing?.failed ? 'panel.pricing_failed' : 'panel.quote_unpriced';

  const selectDate = (dateIso, info) => {
    setSelectedDay({ date: dateIso, bookable: Boolean(info?.bookable), times: info?.times || [] });
    setSelectedTime(null);
  };

  const selectTime = (time) => {
    setSelectedTime(time);
    trackEvent('select_departure', { item_id: experience.id, departure_time: time });
  };

  const submit = () => {
    if (!canSubmit) return;
    if (!selectedDay?.date || !selectedTime) return;
    const record = {
      experienceId: experience.id,
      mode,
      guests,
      date: selectedDay.date,
      time: selectedTime,
      pickupZone,
      accommodation: accommodation.trim().slice(0, 200),
    };
    if (editItem) {
      dispatch({ type: 'update', id: editItem.id, patch: record });
      // Leave edit mode so the panel returns to "add" behaviour.
      navigate(`${location.pathname}${location.hash || '#book'}`, { replace: true });
    } else {
      dispatch({ type: 'add', item: { id: newCartItemId(), ...record } });
      trackEvent('add_to_cart', {
        item_id: experience.id,
        ...(!priceUnavailable ? { value: price.totalUsd } : {}),
        currency: 'USD',
        guests,
        mode,
      });
    }
    dispatch({ type: 'open_drawer' });
  };

  return (
    <div className="booking-panel booking-panel--pickup">
      <div className="booking-panel__bar" aria-hidden="true" />

      <div className="booking-panel__head">
        <span className="booking-panel__price">
          <strong className={priceUnavailable ? 'booking-panel__price--muted' : undefined}>
            {priceUnavailable ? t('panel.price_unavailable') : format(price.totalUsd)}
          </strong>
          {!priceUnavailable && <small>{t('panel.group_total')}</small>}
        </span>
        <span className="booking-panel__chip">
          <span className="booking-panel__chip-dot" aria-hidden="true" />
          {t(priceUnavailable ? 'panel.quote_chip' : 'panel.instant_chip')}
        </span>
      </div>

      <div className="booking-panel__modes" role="group" aria-label={t('panel.mode_label')}>
        <button
          type="button"
          className={`booking-panel__mode${mode === 'shared' ? ' is-active' : ''}`}
          aria-pressed={mode === 'shared'}
          onClick={() => setMode('shared')}
        >
          {t('panel.shared')}
        </button>
        <button
          type="button"
          className={`booking-panel__mode${mode === 'private' ? ' is-active' : ''}`}
          aria-pressed={mode === 'private'}
          onClick={() => setMode('private')}
        >
          {t('panel.private')}
        </button>
      </div>

      <GuestPicker
        label={t('panel.guests')}
        sublabel={t('panel.small_car_hint')}
        value={guests}
        min={experience.minGuests}
        max={MAX_INSTANT_GUESTS}
        onChange={setGuests}
      />

      <PickupFields
        pickupZone={pickupZone}
        accommodation={accommodation}
        onPickupZoneChange={setPickupZone}
        onAccommodationChange={setAccommodation}
      />

      <div className="booking-panel__calendar">
        <div className="booking-panel__tz">
          <span>{t('panel.dates_label')}</span>
          <small>{t('panel.timezone')}</small>
        </div>
        <AvailabilityCalendar
          monthIso={monthIso}
          days={days}
          loading={loading}
          selectedDate={selectedDay?.date || null}
          onSelectDate={selectDate}
          onShiftMonth={(delta) => setMonthIso((current) => shiftMonthIso(current, delta))}
          canPrev={monthIso > minMonth}
          canNext={monthIso < maxMonth}
        />
      </div>

      <div className="booking-panel__times">
        <span className="booking-panel__times-label">{t('panel.times_label')}</span>
        {slots ? (
          <TimeSlotPicker slots={slots} guests={guests} selectedTime={selectedTime} onSelect={selectTime} />
        ) : (
          <p className="booking-panel__hint">{t('panel.pick_date_hint')}</p>
        )}
      </div>

      <div className="booking-panel__pricing">
        {priceUnavailable ? (
          <p className="booking-panel__quote-hint" role="status">{t(quoteHint)}</p>
        ) : (
          <>
            {price.lines.map((line, index) => (
              <div className="booking-panel__row" key={`${line.type}-${index}`}>
                <span>{t(line.type === 'pickup_supplement' ? 'pricing.pickup_charge' : 'pricing.group_price')}</span>
                <span>{format(line.amountUsd)}</span>
              </div>
            ))}
            <div className="booking-panel__total">
              <span>{t('panel.total')}</span>
              <strong>{format(price.totalUsd)}</strong>
            </div>
            {price.effectivePerPersonUsd != null && (
              <div className="booking-panel__row booking-panel__row--secondary">
                <span>{t('panel.effective_per_person')}</span>
                <span>{format(price.effectivePerPersonUsd)}</span>
              </div>
            )}
            {payment && (
              <>
                <div className="booking-panel__row"><span>{t('panel.deposit')}</span><span>{format(payment.chargeUsd)}</span></div>
                <div className="booking-panel__row"><span>{t('panel.balance')}</span><span>{format(payment.balanceUsd)}</span></div>
              </>
            )}
            {currency !== 'USD' && <p className="booking-panel__hint">{t('panel.currency_estimate')}</p>}
          </>
        )}
        {!pickupComplete && <p className="booking-panel__hint">{t('pickup.required_hint')}</p>}
      </div>

      <button type="button" className="booking-panel__submit" disabled={!canSubmit} onClick={submit}>
        {editItem ? t('panel.update') : t('panel.add')}
        <ArrowRightIcon size={17} />
      </button>
      <p className="booking-panel__foot">{t('panel.not_charged')}</p>
    </div>
  );
}
