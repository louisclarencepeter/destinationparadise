import { useEffect, useState } from 'react';
import {
  FALLBACK_RATES,
  fetchRates,
  getCachedRates,
  isCacheFresh,
} from '../utils/currency.js';
import { CurrencyContext } from './currencyContext.js';

export function CurrencyProvider({ children }) {
  const [rates, setRates] = useState(() => getCachedRates() || FALLBACK_RATES);

  useEffect(() => {
    if (isCacheFresh()) return undefined;
    let active = true;
    fetchRates()
      .then((next) => {
        if (active) setRates(next);
      })
      .catch(() => {
        // keep cached/fallback rates on failure
      });
    return () => {
      active = false;
    };
  }, []);

  return <CurrencyContext.Provider value={rates}>{children}</CurrencyContext.Provider>;
}
