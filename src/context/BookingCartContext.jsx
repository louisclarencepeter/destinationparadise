import { useEffect, useMemo, useReducer } from 'react';
import {
  CART_STORAGE_KEY,
  cartReducer,
  deserializeCart,
  initialCartState,
  serializeCart,
} from '../lib/storeCart.js';
import { BookingCartContext } from './bookingCartContext.js';

function initCartState(base) {
  try {
    return { ...base, items: deserializeCart(window.localStorage.getItem(CART_STORAGE_KEY)) };
  } catch {
    return base;
  }
}

// Holds the multi-trip cart (items + drawer visibility) and persists the items
// locally for convenience. Deliberately catalog-free so mounting it site-wide
// costs nothing while the store feature flag is off; prices and availability
// are always re-derived by the components that render the cart.
export function BookingCartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState, initCartState);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(state));
    } catch {
      // storage unavailable (private mode, quota) — cart still works in memory
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <BookingCartContext.Provider value={value}>{children}</BookingCartContext.Provider>;
}
