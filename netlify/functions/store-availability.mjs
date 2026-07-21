// GET /api/store/availability?experience=<sourceKey>&from=YYYY-MM-DD&to=YYYY-MM-DD
// Live departure availability (capacity − confirmed − active holds).

import { createRateLimiter, rateLimitKey } from './_shared.mjs';
import { captureFunctionException } from './_sentry.mjs';
import {
  callStoreRpc,
  isIsoDate,
  isSourceKey,
  storeApiEnabled,
  storeDisabledResponse,
  storeJson,
} from './_store_shared.mjs';

const FUNCTION_NAME = 'store-availability';
const checkRateLimit = createRateLimiter({ windowMs: 10 * 60_000, max: 120 });

export default async (req) => {
  if (!storeApiEnabled()) return storeDisabledResponse();
  if (req.method !== 'GET') return storeJson({ ok: false, error: 'method_not_allowed' }, 405);

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) return storeJson({ ok: false, error: 'rate_limited' }, 429);

  const url = new URL(req.url);
  const experience = url.searchParams.get('experience') || '';
  const from = url.searchParams.get('from') || '';
  const to = url.searchParams.get('to') || '';
  if (!isSourceKey(experience) || !isIsoDate(from) || !isIsoDate(to)) {
    return storeJson({ ok: false, error: 'invalid_request' }, 400);
  }

  try {
    const result = await callStoreRpc('store_api_availability', {
      p_source_key: experience,
      p_from: from,
      p_to: to,
    });
    if (result?.error) return storeJson({ ok: false, error: result.error }, 400);
    return storeJson({ ok: true, ...result });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req });
    return storeJson({ ok: false, error: 'availability_unavailable' }, 502);
  }
};

export const config = { path: '/api/store/availability' };
