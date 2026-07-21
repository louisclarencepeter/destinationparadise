import { useTranslation } from 'react-i18next';

// Accessible − / + stepper for guest counts.
/**
 * @param {{ label?: string | null, sublabel?: string | null, value: number, min?: number,
 *   max?: number, onChange: (next: number) => void, size?: 'md' | 'sm' }} props
 */
export default function GuestPicker({ label = null, sublabel = null, value, min = 1, max = 8, onChange, size = 'md' }) {
  const { t } = useTranslation('store');

  const clamp = (next) => Math.min(max, Math.max(min, next));

  return (
    <div className={`guest-picker guest-picker--${size}`}>
      {(label || sublabel) && (
        <div className="guest-picker__copy">
          {label && <span className="guest-picker__label">{label}</span>}
          {sublabel && <span className="guest-picker__sub">{sublabel}</span>}
        </div>
      )}
      <div className="guest-picker__controls">
        <button
          type="button"
          className="guest-picker__btn"
          aria-label={t('guests.decrease')}
          disabled={value <= min}
          onClick={() => onChange(clamp(value - 1))}
        >
          −
        </button>
        <span className="guest-picker__value" aria-live="polite">{value}</span>
        <button
          type="button"
          className="guest-picker__btn"
          aria-label={t('guests.increase')}
          disabled={value >= max}
          onClick={() => onChange(clamp(value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
