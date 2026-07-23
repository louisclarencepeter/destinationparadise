// Shared helpers for the store API functions (HANDOFF.md Phase 2).
// Underscore-prefixed: library only, not a deployed function.
//
// All commercial logic lives in Postgres functions (one RPC = one
// transaction); this layer only validates input, enforces origin/rate
// limits, and forwards to PostgREST's /rpc endpoint with the service key.
// The browser never sees Supabase credentials — requests terminate here.

import { fetchWithTimeout, requestSourceAllowed } from './_shared.mjs';

export const STORE_ALLOWED_HOSTNAMES = [
  'yournexttriptoparadise.com',
  'www.yournexttriptoparadise.com',
  'destinationparadisezanzibar.netlify.app',
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
];
export const STORE_ALLOWED_HOSTNAME_SUFFIXES = ['--destinationparadisezanzibar.netlify.app'];

// Read lazily so tests (and Netlify context switches) can vary the env
// without re-importing the module.
const supabaseUrl = () => (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const supabaseSecret = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

// The API ships dark: without explicit enablement plus credentials every
// endpoint 404s, so deploying this code changes nothing in production.
export function storeApiEnabled() {
  return process.env.STORE_API_ENABLED === 'true' && Boolean(supabaseUrl()) && Boolean(supabaseSecret());
}

export function devFakePaymentEnabled() {
  return process.env.STORE_DEV_FAKE_PAYMENT === 'true';
}

export const storeDisabledResponse = () =>
  Response.json({ ok: false, error: 'store_disabled' }, { status: 404, headers: noStoreHeaders() });

export function noStoreHeaders(extra = {}) {
  return {
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    ...extra,
  };
}

export const storeJson = (data, status = 200, headers = noStoreHeaders()) =>
  Response.json(data, { status, headers });

export function storeSourceAllowed(req) {
  return requestSourceAllowed(req, STORE_ALLOWED_HOSTNAMES, STORE_ALLOWED_HOSTNAME_SUFFIXES);
}

// ---- PostgREST RPC ----------------------------------------------------------

export class StoreRpcError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'StoreRpcError';
    this.status = status;
    this.body = body;
  }
}

// POST /rest/v1/rpc/<fn> with the service key. Kept dependency-free on
// purpose (no supabase-js): the store only ever calls SQL functions.
export async function callStoreRpc(fnName, args = {}, { timeoutMs = 12_000, fetchFn } = {}) {
  const url = supabaseUrl();
  const secret = supabaseSecret();
  if (!url || !secret) {
    throw new StoreRpcError('store database is not configured');
  }
  const response = await fetchWithTimeout(`${url}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      apikey: secret,
      authorization: `Bearer ${secret}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(args),
  }, timeoutMs, fetchFn ?? fetch);

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new StoreRpcError(`rpc ${fnName} failed (${response.status})`, { status: response.status, body });
  }
  return body;
}

// ---- Input validation -------------------------------------------------------

const SOURCE_KEY_RE = /^[a-z0-9][a-z0-9-]{1,60}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^[0-2]\d:[0-5]\d$/;
const OPTION_CODES = new Set(['shared', 'private']);
const IDEMPOTENCY_RE = /^[A-Za-z0-9_-]{8,80}$/;
export const MAX_CHECKOUT_ITEMS = 20;

export function isSourceKey(value) {
  return typeof value === 'string' && SOURCE_KEY_RE.test(value);
}

export function isIsoDate(value) {
  return typeof value === 'string' && DATE_RE.test(value);
}

export function isLocalTime(value) {
  return typeof value === 'string' && TIME_RE.test(value);
}

// Normalizes the browser cart payload into the exact shape the SQL layer
// accepts. Returns { ok, items } or { ok: false, error }.
export function parseStoreItems(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_CHECKOUT_ITEMS) {
    return { ok: false, error: 'invalid_items' };
  }
  const items = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') return { ok: false, error: 'invalid_items' };
    const guests = Number(entry.guests);
    const item = {
      id: typeof entry.id === 'string' ? entry.id.slice(0, 64) : '',
      sourceKey: entry.sourceKey ?? entry.experienceId,
      optionCode: entry.optionCode ?? entry.mode,
      guests,
      date: entry.date,
      time: entry.time,
    };
    if (
      !item.id ||
      !isSourceKey(item.sourceKey) ||
      !OPTION_CODES.has(item.optionCode) ||
      !Number.isInteger(guests) || guests < 1 || guests > 24 ||
      !isIsoDate(item.date) ||
      !isLocalTime(item.time)
    ) {
      return { ok: false, error: 'invalid_items' };
    }
    items.push(item);
  }
  return { ok: true, items };
}

// Mixed request carts: request items carry preferred dates as free text
// instead of a departure; instant riders keep the strict shape. At least one
// request item is required (pure-instant carts use /api/store/checkout).
export function parseRequestItems(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_CHECKOUT_ITEMS) {
    return { ok: false, error: 'invalid_items' };
  }
  const items = [];
  let requestCount = 0;
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') return { ok: false, error: 'invalid_items' };
    const guests = Number(entry.guests);
    const optionCode = entry.optionCode ?? entry.mode;
    const base = {
      id: typeof entry.id === 'string' ? entry.id.slice(0, 64) : '',
      sourceKey: entry.sourceKey ?? entry.experienceId,
      optionCode,
      guests,
    };
    if (!base.id || !isSourceKey(base.sourceKey) ||
        !Number.isInteger(guests) || guests < 1 || guests > 24) {
      return { ok: false, error: 'invalid_items' };
    }
    if (optionCode === 'request') {
      requestCount += 1;
      items.push({
        ...base,
        requestedDates: String(entry.requestedDates ?? '').slice(0, 300),
      });
    } else if (OPTION_CODES.has(optionCode) && isIsoDate(entry.date) && isLocalTime(entry.time)) {
      items.push({ ...base, date: entry.date, time: entry.time });
    } else {
      return { ok: false, error: 'invalid_items' };
    }
  }
  if (requestCount === 0) return { ok: false, error: 'no_request_items' };
  return { ok: true, items };
}

export function parseIdempotencyKey(value) {
  return typeof value === 'string' && IDEMPOTENCY_RE.test(value) ? value : null;
}

export function parseOrderReference(value) {
  return typeof value === 'string' && /^DP-\d{4}-\d{6}$/.test(value) ? value : null;
}

export function parseOrderToken(value) {
  return typeof value === 'string' && /^[a-f0-9]{48}$/.test(value) ? value : null;
}
