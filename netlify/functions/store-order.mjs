// GET /api/store/orders/:reference — order status for the confirmation page.
// Authorized by the per-order bearer token minted at checkout (only its
// sha256 is stored). Responses are never cacheable and never referable.

import { createRateLimiter, rateLimitKey } from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import {
  callStoreRpc,
  parseOrderReference,
  parseOrderToken,
  storeApiEnabled,
  storeDisabledResponse,
  storeJson,
} from './_store_shared.mjs';

const FUNCTION_NAME = 'store-order';
const checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 60 });

export default async (req, context) => {
  if (!storeApiEnabled()) return storeDisabledResponse();
  if (req.method !== 'GET') return storeJson({ ok: false, error: 'method_not_allowed' }, 405);

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) return storeJson({ ok: false, error: 'rate_limited' }, 429);

  const reference = parseOrderReference(context?.params?.reference || '');
  const auth = req.headers.get('authorization') || '';
  const token = parseOrderToken(auth.startsWith('Bearer ') ? auth.slice(7).trim() : '');
  if (!reference || !token) return storeJson({ ok: false, error: 'not_found' }, 404);

  try {
    const result = await callStoreRpc('store_api_order', { p_reference: reference, p_token: token });
    if (!result?.ok) return storeJson({ ok: false, error: 'not_found' }, 404);
    return storeJson(result);
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req });
    return storeJson({ ok: false, error: 'order_unavailable' }, 502);
  }
};

export const config = { path: '/api/store/orders/:reference' };
