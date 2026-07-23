import { useTranslation } from 'react-i18next';
import { formatTimeLabel } from '../../lib/storeFormat.js';

// Departure-time chips for the selected day, with live seat feedback.
export default function TimeSlotPicker({ slots, guests, selectedTime, onSelect }) {
  const { t, i18n } = useTranslation('store');
  const lang = i18n.resolvedLanguage || 'en';

  return (
    <div className="slot-grid" role="group" aria-label={t('panel.times_label')}>
      {slots.map((slot) => {
        const soldOut = slot.seats === 0;
        const short = !soldOut && slot.seats < guests;
        const low = !soldOut && !short && slot.seats <= 2;
        const disabled = soldOut || short;
        const selected = selectedTime === slot.time;
        let sub;
        if (soldOut) sub = t('panel.slot_sold_out');
        else if (short || low) sub = t('panel.slot_left', { count: slot.seats });
        else sub = t('panel.slot_available');
        return (
          <button
            key={slot.time}
            type="button"
            className={`slot-grid__slot${selected ? ' is-selected' : ''}${soldOut ? ' is-soldout' : ''}`}
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSelect(slot.time)}
          >
            <span className="slot-grid__time">{formatTimeLabel(lang, slot.time)}</span>
            <span className="slot-grid__sub">{sub}</span>
          </button>
        );
      })}
    </div>
  );
}
