import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/useCurrency.js';
import { useBookingCart } from '../../context/useBookingCart.js';
import { useAvailability } from '../../hooks/useAvailability.js';
import { addDaysIso, BOOKING_WINDOW_DAYS, priceSelection, todayInStoreTz } from '../../lib/storeApi.js';
import { monthIsoOf, shiftMonthIso } from '../../lib/storeFormat.js';
import { newCartItemId } from '../../lib/storeCart.js';
import { trackEvent } from '../../utils/analytics.js';
import AvailabilityCalendar from './AvailabilityCalendar.jsx';
import TimeSlotPicker from './TimeSlotPicker.jsx';
import GuestPicker from './GuestPicker.jsx';
import { ArrowRightIcon } from './StoreIcons.jsx';

export const STORE_GUESTS_KEY = 'dp_store_guests_v1';

function defaultGuests(experience) {
  let stored = 2;
  try {
    stored = Number(window.sessionStorage.getItem(STORE_GUESTS_KEY)) || 2;
  } catch {
    stored = 2;
  }
  return Math.min(Math.max(stored, experience.minGuests), experience.maxGuests);
}

// Instant-booking panel: shared/private toggle, guests, availability calendar,
// departure slots, live price breakdown, add-to-trip. With `?edit=<cartItemId>`
// it loads that cart line and saves changes back to it.
export default function BookingPanel({ experience }) {
  const { t } = useTranslation('store');
  const { format } = useCurrency();
  const { state: cart, dispatch } = useBookingCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const today = todayInStoreTz();
  const minMonth = monthIsoOf(today);
  const maxMonth = monthIsoOf(addDaysIso(today, BOOKING_WINDOW_DAYS));

  const editId = searchParams.get('edit');
  const editItem = editId
    ? cart.items.find((item) =>
        item.id === editId && item.experienceId === experience.id &&
        item.mode !== 'request' && item.date && item.time)
    : null;

  /** @typedef {{ date: string, times: {time: string, seats: number}[] | null }} DaySnapshot */
  const [mode, setMode] = useState('shared');
  const [guests, setGuests] = useState(() => defaultGuests(experience));
  const [monthIso, setMonthIso] = useState(minMonth);
  const [selectedDay, setSelectedDay] = useState(/** @type {DaySnapshot | null} */ (null));
  const [selectedTime, setSelectedTime] = useState(/** @type {string | null} */ (null));

  // Load the cart line being edited exactly once per edit id.
  const appliedEditRef = useRef(/** @type {string | null} */ (null));
  useEffect(() => {
    if (!editItem?.date || !editItem?.time || appliedEditRef.current === editItem.id) return;
    const { date, time } = editItem;
    appliedEditRef.current = editItem.id;
    setMode(editItem.mode);
    setGuests(Math.min(editItem.guests, experience.maxGuests));
    setMonthIso((current) => {
      const target = monthIsoOf(date);
      return target >= minMonth && target <= maxMonth ? target : current;
    });
    setSelectedDay({ date, times: null });
    setSelectedTime(time);
  }, [editItem, experience.maxGuests, minMonth, maxMonth]);

  const { loading, days } = useAvailability(experience.id, monthIso);

  // Keep the selected day's slot snapshot fresh when its month is on screen
  // (also fills in the snapshot for a cart line loaded via ?edit=).
  useEffect(() => {
    if (!days || !selectedDay) return;
    const info = days[selectedDay.date];
    if (info) setSelectedDay((current) => (current ? { ...current, times: info.times } : current));
  }, [days, selectedDay?.date]); // eslint-disable-line react-hooks/exhaustive-deps

  const slots = selectedDay?.times || null;

  // Guests can grow after a time was picked — drop a selection that no longer fits.
  useEffect(() => {
    if (!slots || !selectedTime) return;
    const slot = slots.find((entry) => entry.time === selectedTime);
    if (slot && slot.seats < guests) setSelectedTime(null);
  }, [guests, slots, selectedTime]);

  const price = useMemo(() => priceSelection(experience, mode, guests), [experience, mode, guests]);
  const canSubmit = Boolean(selectedDay?.date && selectedTime);

  const selectDate = (dateIso, info) => {
    setSelectedDay({ date: dateIso, times: info?.times || [] });
    setSelectedTime(null);
  };

  const selectTime = (time) => {
    setSelectedTime(time);
    trackEvent('select_departure', { item_id: experience.id, departure_time: time });
  };

  const submit = () => {
    if (!selectedDay?.date || !selectedTime) return;
    const record = {
      experienceId: experience.id,
      mode,
      guests,
      date: selectedDay.date,
      time: selectedTime,
    };
    if (editItem) {
      dispatch({ type: 'update', id: editItem.id, patch: record });
      // Leave edit mode so the panel returns to "add" behaviour.
      navigate(`${location.pathname}${location.hash || '#book'}`, { replace: true });
    } else {
      dispatch({ type: 'add', item: { id: newCartItemId(), ...record } });
      trackEvent('add_to_cart', {
        item_id: experience.id,
        value: price.totalUsd,
        currency: 'USD',
        guests,
        mode,
      });
    }
    dispatch({ type: 'open_drawer' });
  };

  return (
    <div className="booking-panel">
      <div className="booking-panel__bar" aria-hidden="true" />

      <div className="booking-panel__head">
        <span className="booking-panel__price">
          <strong>{format(experience.priceUsd)}</strong>
          <small>{t('panel.per_person')}</small>
        </span>
        <span className="booking-panel__chip">
          <span className="booking-panel__chip-dot" aria-hidden="true" />
          {t('panel.instant_chip')}
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
        sublabel={t('panel.max_guests', { count: experience.maxGuests })}
        value={guests}
        min={experience.minGuests}
        max={experience.maxGuests}
        onChange={setGuests}
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
        <div className="booking-panel__row">
          <span>
            {format(experience.priceUsd)} × {t('panel.guest_count', { count: guests })}
          </span>
          <span>{format(experience.priceUsd * guests)}</span>
        </div>
        {mode === 'private' && experience.privateSupplementUsd > 0 && (
          <div className="booking-panel__row">
            <span>{t('panel.private_supplement')}</span>
            <span>+{format(experience.privateSupplementUsd)}</span>
          </div>
        )}
        <div className="booking-panel__total">
          <span>{t('panel.total')}</span>
          <strong>{format(price.totalUsd)}</strong>
        </div>
      </div>

      <button type="button" className="booking-panel__submit" disabled={!canSubmit} onClick={submit}>
        {editItem ? t('panel.update') : t('panel.add')}
        <ArrowRightIcon size={17} />
      </button>
      <p className="booking-panel__foot">{t('panel.not_charged')}</p>
    </div>
  );
}
