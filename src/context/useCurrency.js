import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CurrencyContext } from './currencyContext.js';
import { currencyForLang, formatPrice } from '../utils/currency.js';

// Returns the active display currency and a `format(usdValue)` helper bound to
// the current language and latest exchange rates.
export function useCurrency() {
  const rates = useContext(CurrencyContext);
  const { i18n } = useTranslation();
  const currency = currencyForLang(i18n.resolvedLanguage);
  const format = useCallback(
    (usdValue, opts) => formatPrice(usdValue, currency, rates, opts),
    [currency, rates],
  );
  return { currency, format, rates };
}
