import { createContext } from 'react';
import { FALLBACK_RATES } from '../utils/currency.js';

export const CurrencyContext = createContext(FALLBACK_RATES);
