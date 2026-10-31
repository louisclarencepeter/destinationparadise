import { useEffect, useMemo, useReducer, useState } from 'react';
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
  // Keep contact fields during shopping/editing in this page session only.
  // They are deliberately excluded from the persisted cart and clear with it.
  const [checkoutContact, setCheckoutContact] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (state.items.length === 0) setCheckoutContact({ name: '', email: '', phone: '' });
  }, [state.items.length]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(state));
    } catch {
      // storage unavailable (private mode, quota) — cart still works in memory
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, checkoutContact, setCheckoutContact }), [state, checkoutContact]);

  return <BookingCartContext.Provider value={value}>{children}</BookingCartContext.Provider>;
}
