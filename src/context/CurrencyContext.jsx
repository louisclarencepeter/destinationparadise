import { useEffect, useState } from 'react';
import {
  FALLBACK_RATES,
  fetchRates,
  getCachedRates,
  isCacheFresh,
} from '../utils/currency.js';
import { isPrerender } from '../utils/prerender.js';
import { CurrencyContext } from './currencyContext.js';

export function CurrencyProvider({ children }) {
  const [rates, setRates] = useState(() => getCachedRates() || FALLBACK_RATES);

  useEffect(() => {
    // Skip the live FX request during the build-time prerender crawl — fallback
    // rates keep the captured prices deterministic and avoid an external call.
    if (isPrerender()) return undefined;
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
