import { useTranslation } from 'react-i18next';
import { formatStoreMoney } from '../../lib/storeFormat.js';

// Render the server's saved breakdown. Cart selections never supply amounts.
/** @param {{ lines?: any[] }} props */
export default function StorePriceLines({ lines = [] }) {
  const { t, i18n } = useTranslation('store');
  const visible = lines.filter((line) =>
    ['group_price', 'pickup_supplement'].includes(line.type) && Number.isFinite(line.amountUsd));
  if (!visible.length) return null;
  return (
    <div className="store-price-breakdown">
      {visible.map((line, index) => (
        <div className="booking-panel__row" key={`${line.type}-${index}`}>
          <span>{t(line.type === 'group_price' ? 'pricing.group_price' : 'pricing.pickup_charge')}</span>
          <span>{formatStoreMoney(i18n.resolvedLanguage || 'en', line.amountUsd)}</span>
        </div>
      ))}
    </div>
  );
}
