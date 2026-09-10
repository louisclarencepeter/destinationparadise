// POST /api/store/quote — re-price and re-check a set of cart items.
// Never trusts client prices; every quote is computed from the database.

import { createRateLimiter, rateLimitKey } from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import {
  callStoreRpc,
  parseStoreItems,
  storeApiEnabled,
  storeDisabledResponse,
  storeJson,
  storeSourceAllowed,
} from './_store_shared.mjs';

const FUNCTION_NAME = 'store-quote';
const MAX_REQUEST_BYTES = 20_000;
const checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 60 });

export default async (req) => {
  if (!storeApiEnabled()) return storeDisabledResponse();
  if (req.method !== 'POST') return storeJson({ ok: false, error: 'method_not_allowed' }, 405);
  if (!storeSourceAllowed(req).ok) return storeJson({ ok: false, error: 'forbidden' }, 403);

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) return storeJson({ ok: false, error: 'rate_limited' }, 429);

  let payload;
  try {
    const raw = await req.text();
    if (raw.length > MAX_REQUEST_BYTES) return storeJson({ ok: false, error: 'payload_too_large' }, 413);
    payload = JSON.parse(raw);
  } catch {
    return storeJson({ ok: false, error: 'invalid_json' }, 400);
  }

  const parsed = parseStoreItems(payload?.items);
  if (!parsed.ok) return storeJson({ ok: false, error: parsed.error }, 400);

  try {
    const result = await callStoreRpc('store_api_quote', { p_items: parsed.items });
    if (result?.error) return storeJson({ ok: false, error: result.error }, 400);
    return storeJson({ ok: true, ...result });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req });
    return storeJson({ ok: false, error: 'quote_unavailable' }, 502);
  }
};

export const config = { path: '/api/store/quote' };
