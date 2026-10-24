import { parsePesapalTrackingId } from './_pesapal.mjs';
import { parseOrderReference } from './_store_shared.mjs';

export function parsePesapalNotification(url, payload = {}) {
  const field = (name) => payload?.[name] ?? url.searchParams.get(name);
  const reference = parseOrderReference(field('OrderMerchantReference'));
  const trackingId = parsePesapalTrackingId(field('OrderTrackingId'));
  const notificationType = field('OrderNotificationType');
  const returnReference = url.searchParams.get('reference');
  if (!reference || !trackingId || (returnReference && returnReference !== reference)) return null;
  return { reference, trackingId, notificationType };
}

export function pesapalIpnResponse(notification, status) {
  return {
    orderNotificationType: notification.notificationType,
    orderTrackingId: notification.trackingId,
    orderMerchantReference: notification.reference,
    status,
  };
}
