import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/useCurrency.js';
import { useBookingCart } from '../../context/useBookingCart.js';
import { newCartItemId, MAX_REQUESTED_DATES_LENGTH } from '../../lib/storeCart.js';
import { trackEvent } from '../../utils/analytics.js';
import GuestPicker from './GuestPicker.jsx';
import { ArrowRightIcon } from './StoreIcons.jsx';

// Request-to-book panel (HANDOFF Phase 5): guests + preferred dates go into
// the same multi-trip cart as instant items. Nothing is charged or held —
// staff confirm availability, then the guest accepts a quote by email.
export default function RequestPanel({ experience }) {
  const { t } = useTranslation('store');
  const { format } = useCurrency();
  const { state: cart, dispatch } = useBookingCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const editId = searchParams.get('edit');
  const editItem = editId
    ? cart.items.find((item) => item.id === editId && item.experienceId === experience.id && item.mode === 'request')
    : null;

  const [guests, setGuests] = useState(2);
  const [requestedDates, setRequestedDates] = useState('');

  const appliedEditRef = useRef(/** @type {string | null} */ (null));
  useEffect(() => {
    if (!editItem || appliedEditRef.current === editItem.id) return;
    appliedEditRef.current = editItem.id;
    setGuests(Math.min(editItem.guests, experience.maxGuests));
    setRequestedDates(editItem.requestedDates || '');
  }, [editItem, experience.maxGuests]);

  const submit = () => {
    const record = {
      experienceId: experience.id,
      mode: 'request',
      guests,
      requestedDates: requestedDates.trim().slice(0, MAX_REQUESTED_DATES_LENGTH),
    };
    if (editItem) {
      dispatch({ type: 'update', id: editItem.id, patch: record });
      navigate(`${location.pathname}${location.hash || '#book'}`, { replace: true });
    } else {
      dispatch({ type: 'add', item: { id: newCartItemId(), ...record } });
      trackEvent('request_availability', { item_id: experience.id, guests });
    }
    dispatch({ type: 'open_drawer' });
  };

  return (
    <div className="booking-panel">
      <div className="booking-panel__bar" aria-hidden="true" />

      <div className="booking-panel__head">
        <span className="booking-panel__price">
          {experience.indicativePriceUsd != null ? (
            <>
              <strong>{format(experience.indicativePriceUsd)}</strong>
              <small>{t('request_panel.indicative')}</small>
            </>
          ) : (
            <strong className="booking-panel__price--muted">{t('card.price_on_request')}</strong>
          )}
        </span>
        <span className="booking-panel__chip booking-panel__chip--request">
          <span className="booking-panel__chip-dot" aria-hidden="true" />
          {t('request_panel.chip')}
        </span>
      </div>

      <p className="booking-panel__request-lead">{t('request_panel.lead')}</p>

      <GuestPicker
        label={t('panel.guests')}
        sublabel={t('panel.max_guests', { count: experience.maxGuests })}
        value={guests}
        min={experience.minGuests}
        max={experience.maxGuests}
        onChange={setGuests}
      />

      <div className="booking-panel__request-dates">
        <label htmlFor={`request-dates-${experience.id}`}>{t('request_panel.dates_label')}</label>
        <input
          id={`request-dates-${experience.id}`}
          type="text"
          value={requestedDates}
          maxLength={MAX_REQUESTED_DATES_LENGTH}
          placeholder={t('request_panel.dates_placeholder')}
          onChange={(event) => setRequestedDates(event.target.value)}
        />
      </div>

      <button type="button" className="booking-panel__submit" onClick={submit}>
        {editItem ? t('panel.update') : t('request_panel.add')}
        <ArrowRightIcon size={17} />
      </button>
      <p className="booking-panel__foot">{t('request_panel.foot')}</p>
    </div>
  );
}
