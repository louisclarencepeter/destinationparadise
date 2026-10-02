import { createContext } from 'react';
import { initialCartState } from '../lib/storeCart.js';

export const BookingCartContext = createContext({
  state: initialCartState,
  /** @type {import('react').Dispatch<import('../lib/storeCart.js').CartAction>} */
  dispatch: () => {},
  checkoutContact: { name: '', email: '', phone: '' },
  /** @type {import('react').Dispatch<import('react').SetStateAction<{ name: string, email: string, phone: string }>>} */
  setCheckoutContact: () => {},
});
