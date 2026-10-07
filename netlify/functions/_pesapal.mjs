// Pesapal API 3.0. Notifications only trigger verification; only a server-side
// GetTransactionStatus response with matching money/reference proves payment.
import { fetchWithTimeout } from './_shared.mjs';
import { storeNonProductionRuntime } from './_store_shared.mjs';

const API_URLS = {
  sandbox: 'https://cybqa.pesapal.com/pesapalv3/api',
  live: 'https://pay.pesapal.com/v3/api',
};
// ISO 4217 minor units. DPO's historical whole-unit TZS convention is kept
// separately in its adapter; it must not alter Pesapal's currency arithmetic.
const CURRENCY_EXPONENT = { USD: 2, EUR: 2, GBP: 2, TZS: 2 };
const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export const pesapalEnvironment = () => (process.env.PESAPAL_ENVIRONMENT || '').trim();
const credentials = () => ({
  consumer_key: (process.env.PESAPAL_CONSUMER_KEY || '').trim(),
  consumer_secret: (process.env.PESAPAL_CONSUMER_SECRET || '').trim(),
});

export function parsePesapalTrackingId(value) {
  return typeof value === 'string' && UUID_RE.test(value) ? value.toLowerCase() : null;
}

export function pesapalEnabled({ checkout = true, environment = pesapalEnvironment() } = {}) {
  const keys = credentials();
  return process.env.PESAPAL_ENABLED === 'true' && Boolean(API_URLS[environment]) &&
    environment === pesapalEnvironment() && Boolean(keys.consumer_key && keys.consumer_secret) &&
    (environment === 'live' || storeNonProductionRuntime()) &&
    (!checkout || Boolean(parsePesapalTrackingId(process.env.PESAPAL_IPN_ID || '')));
}

function hasError(error) {
  if (!error) return false;
  if (typeof error !== 'object') return true;
  return Object.values(error).some((value) => value !== null && value !== '');
}

async function apiRequest(path, { method = 'POST', body, token, environment = pesapalEnvironment(), fetchFn } = {}) {
  if (!API_URLS[environment] || environment !== pesapalEnvironment() ||
      (environment !== 'live' && !storeNonProductionRuntime())) {
    throw new Error('Pesapal environment is not configured for this payment');
  }
  const response = await fetchWithTimeout(`${API_URLS[environment]}/${path}`, {
    method,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }, 15_000, fetchFn ?? fetch);
  let data;
  try { data = await response.json(); } catch { throw new Error('Pesapal returned an invalid response'); }
  // Never attach provider response bodies to errors: they may contain tokens,
  // customer details, or credentials echoed by an intermediary.
  if (!response.ok) throw new Error(`Pesapal request failed (${response.status})`);
  if (!data || typeof data !== 'object') throw new Error('Pesapal returned an invalid response');
  return data;
}

async function authenticate(options) {
  const data = await apiRequest('Auth/RequestToken', { ...options, body: credentials() });
  if (String(data.status) !== '200' || hasError(data.error) || typeof data.token !== 'string' || !data.token) {
    throw new Error('Pesapal authentication failed');
  }
  return data.token;
}

export function pesapalAmountToMinor(value, currency) {
  const exponent = CURRENCY_EXPONENT[currency];
  if (exponent === undefined || (typeof value !== 'string' && typeof value !== 'number')) return null;
  const text = String(value).trim();
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  if (/[1-9]/.test(fraction.slice(exponent))) return null;
  const minor = Number(whole) * 10 ** exponent + Number((fraction + '0'.repeat(exponent)).slice(0, exponent) || 0);
  return Number.isSafeInteger(minor) ? minor : null;
}

export function validPesapalPaymentUrl(value, trackingId, environment = pesapalEnvironment()) {
  try {
    const url = new URL(value);
    const host = environment === 'sandbox' ? 'cybqa.pesapal.com' : environment === 'live' ? 'pay.pesapal.com' : '';
    const storedTrackingId = parsePesapalTrackingId(trackingId);
    return Boolean(storedTrackingId) && url.protocol === 'https:' && url.hostname === host && !url.port && !url.username && !url.password &&
      parsePesapalTrackingId(url.searchParams.get('OrderTrackingId')) === storedTrackingId;
  } catch { return false; }
}

export function buildPesapalOrder(order) {
  const exponent = CURRENCY_EXPONENT[order.currency];
  if (exponent === undefined || !Number.isSafeInteger(order.totalMinor) || order.totalMinor <= 0) {
    throw new Error('Unsupported Pesapal order amount');
  }
  const originUrl = new URL(process.env.STORE_PUBLIC_ORIGIN || 'https://yournexttriptoparadise.com');
  const localDevelopment = storeNonProductionRuntime() &&
    ['localhost', '127.0.0.1', '0.0.0.0'].includes(originUrl.hostname) && originUrl.protocol === 'http:';
  if ((!localDevelopment && originUrl.protocol !== 'https:') || originUrl.username || originUrl.password ||
      originUrl.pathname !== '/' || originUrl.search || originUrl.hash) {
    throw new Error('Invalid store public origin');
  }
  const publicOrigin = originUrl.origin;
  const names = String(order.contactName || '').trim().split(/\s+/);
  const callback = `${publicOrigin}/api/payments/pesapal/return?reference=${encodeURIComponent(order.reference)}`;
  return {
    id: order.reference,
    currency: order.currency,
    amount: order.totalMinor / 10 ** exponent,
    description: `Destination Paradise ${order.reference}`.slice(0, 100),
    callback_url: callback,
    cancellation_url: callback,
    redirect_mode: 'TOP_WINDOW',
    notification_id: process.env.PESAPAL_IPN_ID,
    billing_address: {
      email_address: order.contactEmail || '',
      phone_number: order.contactPhone || '',
      first_name: names.shift() || 'Guest',
      last_name: names.join(' '),
    },
  };
}

export async function createCheckout(order, options = {}) {
  const body = buildPesapalOrder(order);
  const token = await authenticate(options);
  const data = await apiRequest('Transactions/SubmitOrderRequest', { ...options, token, body });
  const trackingId = parsePesapalTrackingId(data.order_tracking_id);
  if (hasError(data.error) || String(data.status) !== '200') {
    // A returned tracking ID makes creation ambiguous even with an error.
    if (trackingId) throw new Error('Pesapal checkout creation was ambiguous');
    return { ok: false, code: String(data.error?.code || data.status || 'create_rejected') };
  }
  if (!trackingId || data.merchant_reference !== order.reference ||
      !validPesapalPaymentUrl(data.redirect_url, trackingId, options.environment)) {
    throw new Error('Pesapal checkout response did not match the order');
  }
  return { ok: true, transToken: trackingId, paymentUrl: data.redirect_url };
}

export function mapPesapalStatus(code) {
  switch (String(code)) {
    case '0': return 'pending'; // INVALID can mean no completed payment yet.
    case '1': return 'paid';
    case '2': return 'failed';
    case '3': return 'requires_review'; // A reversal needs manual booking/refund review.
    default: return 'unknown';
  }
}

export async function verifyPayment({ transToken, expected }, options = {}) {
  const trackingId = parsePesapalTrackingId(transToken);
  if (!trackingId) throw new Error('Invalid stored Pesapal tracking ID');
  const token = await authenticate(options);
  const data = await apiRequest(`Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`, {
    ...options, method: 'GET', token,
  });
  if (hasError(data.error) || String(data.status) !== '200') throw new Error('Pesapal verification failed');
  const status = mapPesapalStatus(data.status_code);
  const reported = {
    code: String(data.status_code ?? ''),
    companyRef: String(data.merchant_reference || ''),
    currency: String(data.currency || ''),
    amount: data.amount ?? null,
    confirmationCode: String(data.confirmation_code || ''),
  };
  if (reported.companyRef && expected?.reference && reported.companyRef !== expected.reference) {
    return { status: 'requires_review', reported, mismatch: 'company_ref' };
  }
  if (status !== 'paid') return { status, reported };
  if (!expected?.reference || reported.companyRef !== expected.reference) {
    return { status: 'requires_review', reported, mismatch: 'company_ref' };
  }
  if (!expected?.currency || reported.currency !== expected.currency) {
    return { status: 'requires_review', reported, mismatch: 'currency' };
  }
  if (!Number.isSafeInteger(expected.totalMinor) || pesapalAmountToMinor(reported.amount, expected.currency) !== expected.totalMinor) {
    return { status: 'requires_review', reported, mismatch: 'amount' };
  }
  return { status: 'paid', reported };
}
