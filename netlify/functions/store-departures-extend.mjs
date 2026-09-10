// Weekly rolling-window top-up: regenerates departures from the templates so
// the bookable horizon stays ~60 days without anyone remembering to run the
// seed. Idempotent (the SQL skips existing departures). Note: Netlify runs
// scheduled functions in the production context only — on staging, extend
// manually via the one-liner in docs/store-ops.md.

import { captureFunctionException } from './_sentry.mjs';
import { callStoreRpc, storeApiEnabled } from './_store_shared.mjs';

const FUNCTION_NAME = 'store-departures-extend';

export default async () => {
  if (!storeApiEnabled()) return new Response('store disabled', { status: 200 });

  try {
    const created = await callStoreRpc('store_seed_departures', { p_days: 60 });
    console.log(`${FUNCTION_NAME}: created ${created} departures`);
    return Response.json({ ok: true, created });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME });
    return Response.json({ ok: false }, { status: 500 });
  }
};

export const config = { schedule: '@weekly' };
