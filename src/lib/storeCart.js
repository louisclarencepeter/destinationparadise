// Multi-trip cart: pure reducer + (de)serialization, no React and no catalog
// imports so the provider stays cheap in the main bundle and the logic is unit
// testable in node.
//
// A cart item is one independently scheduled trip:
//   { id, experienceId, mode: 'shared'|'private', guests, date: 'YYYY-MM-DD', time: 'HH:MM' }
// Prices are never stored — they are derived from the catalog (later: the
// server) every time the cart renders, per HANDOFF.md ("never treat locally
// stored prices or availability as authoritative").

export const CART_STORAGE_KEY = 'dp_store_cart_v1';
export const CART_VERSION = 1;
export const MAX_CART_ITEMS = 20;
export const MAX_GUESTS_PER_ITEM = 24;

export const CART_MODES = ['shared', 'private', 'request'];
export const MAX_REQUESTED_DATES_LENGTH = 300;

/**
 * Instant items carry a concrete departure (date+time); request items carry
 * the guest's preferred dates as free text and are scheduled by staff later.
 * @typedef {{ id: string, experienceId: string, mode: 'shared'|'private'|'request', guests: number, date?: string, time?: string, requestedDates?: string }} CartItem
 * @typedef {{ items: CartItem[], drawerOpen: boolean }} CartState
 * @typedef {{ type: string, item?: any, id?: string, patch?: object, items?: any[] }} CartAction
 */

/** @type {CartState} */
export const initialCartState = {
  items: [],
  drawerOpen: false,
};

export function newCartItemId() {
  return `ci_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function isValidCartItem(item) {
  const baseValid = Boolean(
    item &&
      typeof item.id === 'string' && item.id &&
      typeof item.experienceId === 'string' && item.experienceId &&
      CART_MODES.includes(item.mode) &&
      Number.isInteger(item.guests) && item.guests >= 1 && item.guests <= MAX_GUESTS_PER_ITEM,
  );
  if (!baseValid) return false;
  if (item.mode === 'request') {
    return item.requestedDates === undefined ||
      (typeof item.requestedDates === 'string' && item.requestedDates.length <= MAX_REQUESTED_DATES_LENGTH);
  }
  return (
    typeof item.date === 'string' && DATE_RE.test(item.date) &&
    typeof item.time === 'string' && TIME_RE.test(item.time)
  );
}

function sanitizeItem(item) {
  const { id, experienceId, mode, guests } = item;
  if (mode === 'request') {
    return { id, experienceId, mode, guests, requestedDates: item.requestedDates || '' };
  }
  return { id, experienceId, mode, guests, date: item.date, time: item.time };
}

/**
 * @param {CartState} state
 * @param {CartAction} action
 * @returns {CartState}
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      if (!isValidCartItem(action.item) || state.items.length >= MAX_CART_ITEMS) return state;
      return { ...state, items: [...state.items, sanitizeItem(action.item)] };
    }
    case 'update': {
      const index = state.items.findIndex((item) => item.id === action.id);
      if (index === -1) return state;
      const merged = { ...state.items[index], ...action.patch, id: state.items[index].id };
      if (!isValidCartItem(merged)) return state;
      const items = state.items.slice();
      items[index] = sanitizeItem(merged);
      return { ...state, items };
    }
    case 'remove': {
      const items = state.items.filter((item) => item.id !== action.id);
      return items.length === state.items.length ? state : { ...state, items };
    }
    case 'clear':
      return state.items.length === 0 ? state : { ...state, items: [] };
    case 'open_drawer':
      return state.drawerOpen ? state : { ...state, drawerOpen: true };
    case 'close_drawer':
      return state.drawerOpen ? { ...state, drawerOpen: false } : state;
    case 'hydrate': {
      const items = Array.isArray(action.items)
        ? action.items.filter(isValidCartItem).slice(0, MAX_CART_ITEMS).map(sanitizeItem)
        : [];
      return { ...state, items };
    }
    default:
      return state;
  }
}

export function cartItemCount(state) {
  return state.items.length;
}

export function serializeCart(state) {
  return JSON.stringify({ v: CART_VERSION, items: state.items.map(sanitizeItem) });
}

/**
 * Returns the persisted items, or [] for missing/corrupt/foreign payloads.
 * @returns {CartItem[]}
 */
export function deserializeCart(raw) {
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== CART_VERSION || !Array.isArray(parsed.items)) return [];
    return parsed.items.filter(isValidCartItem).slice(0, MAX_CART_ITEMS).map(sanitizeItem);
  } catch {
    return [];
  }
}
