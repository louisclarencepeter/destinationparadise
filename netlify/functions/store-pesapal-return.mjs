// Customer return is only a verification trigger. The authenticated order page
// reads our stored status; query parameters never confirm payment.
import { captureFunctionException } from './_sentry.mjs';
import { parsePesapalNotification } from './_pesapal_notification.mjs';
import { verifyAndSettle } from './_store_payments.mjs';
import { parseOrderReference, storeApiEnabled, storeJson } from './_store_shared.mjs';

const redirect = (location) => new Response(null, {
  status: 302,
  headers: { location, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' },
});

export default async (req) => {
  if (req.method !== 'GET') return storeJson({ ok: false, error: 'method_not_allowed' }, 405);
  const url = new URL(req.url);
  const notification = parsePesapalNotification(url);
  // Cancellation may contain only the merchant reference we put in the URL.
  // It must not mark the order failed: an IPN can arrive after cancellation.
  const reference = notification?.reference || parseOrderReference(url.searchParams.get('reference'));
  if (!reference) return redirect('/store');
  if (storeApiEnabled() && notification) {
    try {
      await verifyAndSettle(reference, { expectedProvider: 'pesapal', expectedToken: notification.trackingId });
    } catch (error) {
      await captureFunctionException(error, { functionName: 'store-pesapal-return', extra: { stage: 'return-verify' } });
    }
  }
  return redirect(`/store/order/${encodeURIComponent(reference)}`);
};

export const config = { path: '/api/payments/pesapal/return' };
