// GET /api/store/catalog — sellable experiences with options and prices.

import { captureFunctionException } from './_sentry.mjs';
import {
  callStoreRpc,
  storeApiEnabled,
  storeDisabledResponse,
  storeJson,
} from './_store_shared.mjs';

const FUNCTION_NAME = 'store-catalog';

export default async (req) => {
  if (!storeApiEnabled()) return storeDisabledResponse();
  if (req.method !== 'GET') return storeJson({ ok: false, error: 'method_not_allowed' }, 405);

  try {
    const catalog = await callStoreRpc('store_api_catalog');
    // Catalog is slow-moving config; a short shared cache is safe.
    return storeJson({ ok: true, experiences: catalog }, 200, {
      'cache-control': 'public, max-age=120',
    });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req });
    return storeJson({ ok: false, error: 'catalog_unavailable' }, 502);
  }
};

export const config = { path: '/api/store/catalog' };
