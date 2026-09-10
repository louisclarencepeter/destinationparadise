import { useContext } from 'react';
import { BookingCartContext } from './bookingCartContext.js';

export function useBookingCart() {
  return useContext(BookingCartContext);
}
