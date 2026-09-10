import { useTranslation } from 'react-i18next';
import {
  formatDateLabel,
  formatMonthLabel,
  weekStartFor,
  weekdayLabels,
} from '../../lib/storeFormat.js';
import { ChevronLeftIcon, ChevronRightIcon } from './StoreIcons.jsx';

// Month grid of bookable departure days. `days` maps 'YYYY-MM-DD' →
// { bookable, times } for the shown month (from useAvailability).
export default function AvailabilityCalendar({
  monthIso,
  days,
  loading,
  selectedDate,
  onSelectDate,
  onShiftMonth,
  canPrev,
  canNext,
}) {
  const { t, i18n } = useTranslation('store');
  const lang = i18n.resolvedLanguage || 'en';
  const weekStart = weekStartFor(lang);
  const [year, month] = monthIso.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leadingBlanks = (firstDow - weekStart + 7) % 7;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateIso = `${monthIso}-${String(day).padStart(2, '0')}`;
    cells.push({ day, dateIso, info: days?.[dateIso] });
  }

  return (
    <div className={`avail-cal${loading ? ' is-loading' : ''}`}>
      <div className="avail-cal__head">
        <span className="avail-cal__month" aria-live="polite">{formatMonthLabel(lang, monthIso)}</span>
        <div className="avail-cal__nav">
          <button
            type="button"
            className="avail-cal__nav-btn"
            aria-label={t('panel.prev_month')}
            disabled={!canPrev || loading}
            onClick={() => onShiftMonth(-1)}
          >
            <ChevronLeftIcon size={15} />
          </button>
          <button
            type="button"
            className="avail-cal__nav-btn"
            aria-label={t('panel.next_month')}
            disabled={!canNext || loading}
            onClick={() => onShiftMonth(1)}
          >
            <ChevronRightIcon size={15} />
          </button>
        </div>
      </div>
      <div className="avail-cal__weekdays" aria-hidden="true">
        {weekdayLabels(lang, weekStart).map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="avail-cal__grid">
        {cells.map((cell, index) => {
          if (!cell) return <span key={`blank-${index}`} className="avail-cal__blank" />;
          const bookable = Boolean(cell.info?.bookable);
          const selected = selectedDate === cell.dateIso;
          return (
            <button
              key={cell.dateIso}
              type="button"
              className={`avail-cal__day${selected ? ' is-selected' : ''}`}
              disabled={!bookable}
              aria-pressed={selected}
              aria-label={formatDateLabel(lang, cell.dateIso, { weekday: 'long', month: 'long' })}
              onClick={() => onSelectDate(cell.dateIso, cell.info)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
