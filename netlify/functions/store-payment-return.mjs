// GET /api/payments/dpo/return — the customer's browser lands here after the
// hosted payment page. Query parameters are UNTRUSTED notification data: this
// endpoint only triggers a server-side verify, then sends the browser to the
// order page, which polls the internal order status (never DPO params).

import { captureFunctionException } from './_sentry.mjs';
import { dpoEnabled } from './_dpo.mjs';
import { verifyAndSettle } from './_store_payments.mjs';
import { parseOrderReference, storeApiEnabled } from './_store_shared.mjs';

const FUNCTION_NAME = 'store-payment-return';

const redirect = (location) =>
  new Response(null, {
    status: 302,
    headers: {
      location,
      'cache-control': 'no-store',
      'referrer-policy': 'no-referrer',
    },
  });

export default async (req) => {
  const url = new URL(req.url);
  const reference = parseOrderReference(url.searchParams.get('reference') || url.searchParams.get('CompanyRef') || '');

  if (!reference) return redirect('/store');

  if (storeApiEnabled() && dpoEnabled()) {
    try {
      await verifyAndSettle(reference);
    } catch (error) {
      // Verification hiccups must not strand the customer — the order page
      // shows pending state and reconciliation retries server-side.
      await captureFunctionException(error, { functionName: FUNCTION_NAME, req, extra: { stage: 'return-verify' } });
    }
  }

  return redirect(`/store/order/${encodeURIComponent(reference)}`);
};

export const config = { path: '/api/payments/dpo/return' };
