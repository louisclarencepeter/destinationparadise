import { createContext } from 'react';
import { initialCartState } from '../lib/storeCart.js';

export const BookingCartContext = createContext({
  state: initialCartState,
  /** @type {import('react').Dispatch<import('../lib/storeCart.js').CartAction>} */
  dispatch: () => {},
});
