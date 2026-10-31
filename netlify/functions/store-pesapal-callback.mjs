// Pesapal API3 IPN: receive GET or JSON/form POST, verify the persisted tracking
// ID server-side, then echo the documented receipt. Every delivery is verified,
// including an identical retry after a timeout or a later payment-state change.
import { captureFunctionException } from './_sentry.mjs';
import { parsePesapalNotification, pesapalIpnResponse } from './_pesapal_notification.mjs';
import { verifyAndSettle } from './_store_payments.mjs';
import { callStoreRpc, storeApiEnabled, storeJson } from './_store_shared.mjs';

const FUNCTION_NAME = 'store-pesapal-callback';

export default async (req) => {
  if (!['GET', 'POST'].includes(req.method)) return storeJson({ ok: false, error: 'method_not_allowed' }, 405);
  let payload = {};
  if (req.method === 'POST') {
    const body = await req.text();
    if (body.length > 20_000) return storeJson({ ok: false, error: 'payload_too_large' }, 413);
    try { payload = JSON.parse(body); } catch { payload = Object.fromEntries(new URLSearchParams(body)); }
  }
  const notification = parsePesapalNotification(new URL(req.url), payload);
  if (!notification || notification.notificationType !== 'IPNCHANGE') {
    return storeJson({ ok: false, error: 'invalid_notification' }, 400);
  }
  const receipt = (status, httpStatus = status) => storeJson(pesapalIpnResponse(notification, status), httpStatus);
  if (!storeApiEnabled()) return receipt(500, 503);

  try {
    const result = await verifyAndSettle(notification.reference, {
      expectedProvider: 'pesapal', expectedToken: notification.trackingId,
      reverifyPaid: true,
    });
    if (!result.ok || result.state === 'unknown') return receipt(500);
    await callStoreRpc('store_record_provider_event', {
      p_provider: 'pesapal',
      p_event_key: `pesapal:${notification.trackingId}:${result.state}`,
      p_reference: notification.reference,
      p_payload: { notificationType: notification.notificationType, state: result.state },
    });
    return receipt(200);
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, extra: { stage: 'ipn-verify' } });
    return receipt(500);
  }
};

export const config = { path: '/api/payments/pesapal/ipn' };
