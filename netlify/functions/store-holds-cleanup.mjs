// Scheduled maintenance: flag expired capacity holds, expire abandoned
// pending orders, purge stale idempotency keys. Availability math already
// ignores expired holds by predicate, so this is hygiene — correctness never
// depends on it having run (HANDOFF.md availability rules).

import { captureFunctionException } from './_sentry.mjs';
import { callStoreRpc, storeApiEnabled } from './_store_shared.mjs';

const FUNCTION_NAME = 'store-holds-cleanup';

export default async () => {
  if (!storeApiEnabled()) return new Response('store disabled', { status: 200 });

  try {
    const result = await callStoreRpc('store_release_expired_holds');
    console.log(`${FUNCTION_NAME}:`, JSON.stringify(result));
    return Response.json({ ok: true, ...result });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME });
    return Response.json({ ok: false }, { status: 500 });
  }
};

export const config = { schedule: '*/15 * * * *' };
