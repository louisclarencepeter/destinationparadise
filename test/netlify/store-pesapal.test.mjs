import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildPesapalOrder, createCheckout, mapPesapalStatus, pesapalAmountToMinor,
  pesapalEnabled, validPesapalPaymentUrl, verifyPayment,
} from '../../netlify/functions/_pesapal.mjs';
import { verifyAndSettle } from '../../netlify/functions/_store_payments.mjs';
import { devFakePaymentEnabled } from '../../netlify/functions/_store_shared.mjs';
import storePay from '../../netlify/functions/store-pay.mjs';
import storeAccept from '../../netlify/functions/store-accept.mjs';
import pesapalIpn from '../../netlify/functions/store-pesapal-callback.mjs';
import pesapalReturn from '../../netlify/functions/store-pesapal-return.mjs';
import outboxSend from '../../netlify/functions/store-outbox-send.mjs';

const REF = 'DP-2026-123456';
const TRACKING = 'b945e4af-80a5-4ec1-8706-e03f8332fb04';
const OTHER_TRACKING = 'b945e4af-80a5-4ec1-8706-e03f8332fb05';
const IPN_ID = 'fe078e53-78da-4a83-aa89-e7ded5c456e6';
const ORIGIN = 'https://yournexttriptoparadise.com';
const PAYMENT_URL = `https://cybqa.pesapal.com/pesapaliframe/PesapalIframe3/Index/?OrderTrackingId=${TRACKING}`;
const PESAPAL_ORIGINS = new Set(['https://cybqa.pesapal.com', 'https://pay.pesapal.com']);
let requestNumber = 0;

function enable() {
  vi.stubEnv('STORE_API_ENABLED', 'true');
  vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
  vi.stubEnv('STORE_PAYMENT_PROVIDER', 'pesapal');
  vi.stubEnv('PESAPAL_ENABLED', 'true');
  vi.stubEnv('PESAPAL_ENVIRONMENT', 'sandbox');
  vi.stubEnv('PESAPAL_CONSUMER_KEY', 'test-key');
  vi.stubEnv('PESAPAL_CONSUMER_SECRET', 'test-secret');
  vi.stubEnv('PESAPAL_IPN_ID', IPN_ID);
  vi.stubEnv('STORE_RUNTIME_ENVIRONMENT', 'staging');
  vi.stubEnv('CONTEXT', undefined);
}

const statusResponse = (overrides = {}) => ({
  status: '200', status_code: 1, merchant_reference: REF, currency: 'USD',
  amount: 92, error: { code: null, message: null }, ...overrides,
});
const context = (overrides = {}) => ({
  ok: true, reference: REF, orderStatus: 'pending_payment', currency: 'USD',
  totalMinor: 46000, chargeMinor: 9200, paymentPlan: 'deposit_20', balanceMinor: 36800,
  provider: 'pesapal', providerEnvironment: 'sandbox', providerToken: TRACKING,
  attemptStatus: 'pending', holdExpiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  contactName: 'Jane Guest', contactEmail: 'jane@example.com', contactPhone: '+255700000001',
  items: [], ...overrides,
});

function network({ rpc = () => { throw new Error('Unexpected RPC'); }, submit, status = () => statusResponse(), resend } = {}) {
  const calls = [];
  vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
    const target = String(url);
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ target, options, body });
    if (target.includes('/rest/v1/rpc/')) {
      return Response.json(await rpc(target.split('/rpc/')[1], body));
    }
    if (target.includes('/Auth/RequestToken')) return Response.json({ status: '200', token: 'server-bearer', error: null });
    if (target.includes('/SubmitOrderRequest')) {
      return Response.json(submit ? await submit(body) : {
        status: '200', order_tracking_id: TRACKING, merchant_reference: REF, redirect_url: PAYMENT_URL, error: null,
      });
    }
    if (target.includes('/GetTransactionStatus')) return Response.json(await status());
    if (new URL(target).origin === 'https://api.resend.com') return resend(body);
    throw new Error(`Unexpected URL ${target}`);
  }));
  return calls;
}

const payRequest = () => new Request(`${ORIGIN}/api/store/pay`, {
  method: 'POST', headers: { origin: ORIGIN, 'content-type': 'application/json', 'x-forwarded-for': `192.0.2.${++requestNumber}` },
  body: JSON.stringify({ reference: REF, token: 'a'.repeat(48) }),
});
const ipnRequest = (method = 'GET', trackingId = TRACKING) => {
  const fields = { OrderNotificationType: 'IPNCHANGE', OrderTrackingId: trackingId, OrderMerchantReference: REF };
  return method === 'GET'
    ? new Request(`${ORIGIN}/api/payments/pesapal/ipn?${new URLSearchParams(fields)}`)
    : new Request(`${ORIGIN}/api/payments/pesapal/ipn`, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(fields) });
};

beforeEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); enable(); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Pesapal API3 adapter', () => {
  it('requires explicit environment, credentials and registered IPN for checkout', () => {
    expect(pesapalEnabled()).toBe(true);
    vi.stubEnv('PESAPAL_ENVIRONMENT', '');
    expect(pesapalEnabled()).toBe(false);
    vi.stubEnv('PESAPAL_ENVIRONMENT', 'sandbox');
    vi.stubEnv('PESAPAL_IPN_ID', '');
    expect(pesapalEnabled()).toBe(false);
    expect(pesapalEnabled({ checkout: false })).toBe(true);
    expect(pesapalEnabled({ checkout: false, environment: 'live' })).toBe(false);
  });

  it('blocks sandbox and simulated payments in production', () => {
    vi.stubEnv('STORE_RUNTIME_ENVIRONMENT', 'production');
    vi.stubEnv('STORE_DEV_FAKE_PAYMENT', 'true');
    expect(pesapalEnabled()).toBe(false);
    expect(devFakePaymentEnabled()).toBe(false);
    vi.stubEnv('PESAPAL_ENVIRONMENT', 'live');
    expect(pesapalEnabled()).toBe(true);
  });

  it.each([undefined, '', 'preview', 'branch-deploy', 'Production', 'unknown'])('fails closed for sandbox/fake when runtime is %s despite preview build metadata', async (runtime) => {
    vi.stubEnv('STORE_RUNTIME_ENVIRONMENT', runtime);
    vi.stubEnv('CONTEXT', 'branch-deploy');
    vi.stubEnv('STORE_DEV_FAKE_PAYMENT', 'true');
    expect(pesapalEnabled()).toBe(false);
    expect(pesapalEnabled({ checkout: false })).toBe(false);
    expect(devFakePaymentEnabled()).toBe(false);
    const calls = network();
    await expect(createCheckout({ ...context(), totalMinor: 9200 })).rejects.toThrow('environment is not configured');
    await expect(verifyPayment({ transToken: TRACKING, expected: { reference: REF, currency: 'USD', totalMinor: 9200 } })).rejects.toThrow('environment is not configured');
    expect(calls).toEqual([]);
  });

  it.each(['staging', 'development'])('allows sandbox and explicitly enabled simulation in %s without build context', (runtime) => {
    vi.stubEnv('STORE_RUNTIME_ENVIRONMENT', runtime);
    vi.stubEnv('STORE_DEV_FAKE_PAYMENT', 'true');
    expect(pesapalEnabled()).toBe(true);
    expect(devFakePaymentEnabled()).toBe(true);
    vi.stubEnv('STORE_DEV_FAKE_PAYMENT', 'false');
    expect(devFakePaymentEnabled()).toBe(false);
  });

  it.each([undefined, '', 'production', 'unknown'])('preserves live creation/verification when runtime is %s', async (runtime) => {
    vi.stubEnv('STORE_RUNTIME_ENVIRONMENT', runtime);
    vi.stubEnv('PESAPAL_ENVIRONMENT', 'live');
    const livePaymentUrl = PAYMENT_URL.replace('cybqa.pesapal.com', 'pay.pesapal.com');
    const calls = network({ submit: () => ({ status: '200', order_tracking_id: TRACKING, merchant_reference: REF, redirect_url: livePaymentUrl, error: null }) });
    expect(pesapalEnabled()).toBe(true);
    expect(pesapalEnabled({ checkout: false, environment: 'sandbox' })).toBe(false);
    expect((await createCheckout({ ...context(), totalMinor: 9200 })).paymentUrl).toBe(livePaymentUrl);
    expect((await verifyPayment({ transToken: TRACKING, expected: { reference: REF, currency: 'USD', totalMinor: 9200 } })).status).toBe('paid');
    expect(calls.length).toBe(4);
    expect(calls.every((call) => call.target.startsWith('https://pay.pesapal.com/v3/api/'))).toBe(true);
  });

  it.each([undefined, '', 'production', 'unknown'])('rejects HTTP localhost callback when runtime is %s', (runtime) => {
    vi.stubEnv('STORE_RUNTIME_ENVIRONMENT', runtime);
    vi.stubEnv('CONTEXT', 'dev');
    vi.stubEnv('STORE_PUBLIC_ORIGIN', 'http://localhost:8888');
    expect(() => buildPesapalOrder({ ...context(), totalMinor: 9200 })).toThrow('Invalid store public origin');
  });

  it.each(['staging', 'development'])('retains HTTP localhost callbacks for explicit %s', (runtime) => {
    vi.stubEnv('STORE_RUNTIME_ENVIRONMENT', runtime);
    vi.stubEnv('STORE_PUBLIC_ORIGIN', 'http://localhost:8888');
    expect(buildPesapalOrder({ ...context(), totalMinor: 9200 }).callback_url).toBe(`http://localhost:8888/api/payments/pesapal/return?reference=${REF}`);
  });

  it('builds the amount in currency units without inventing a guest country', () => {
    const order = buildPesapalOrder({ ...context(), totalMinor: 9200 });
    expect(order.amount).toBe(92);
    expect(order.notification_id).toBe(IPN_ID);
    expect(order.callback_url).toBe(`${ORIGIN}/api/payments/pesapal/return?reference=${REF}`);
    expect(order.cancellation_url).toBe(order.callback_url);
    expect(order.billing_address).toEqual({ email_address: 'jane@example.com', phone_number: '+255700000001', first_name: 'Jane', last_name: 'Guest' });
    expect(() => buildPesapalOrder({ totalMinor: 50, currency: 'XXX' })).toThrow();
  });

  it('submits JSON with server bearer and accepts only the matching hosted URL', async () => {
    const calls = network();
    const created = await createCheckout({ ...context(), totalMinor: 9200 });
    expect(created).toEqual({ ok: true, transToken: TRACKING, paymentUrl: PAYMENT_URL });
    const submit = calls.find((call) => call.target.includes('/SubmitOrderRequest'));
    expect(submit.options.headers.authorization).toBe('Bearer server-bearer');
    expect(submit.body.amount).toBe(92);
    expect(validPesapalPaymentUrl(PAYMENT_URL, TRACKING)).toBe(true);
    expect(validPesapalPaymentUrl(PAYMENT_URL.replace('cybqa.pesapal.com', 'cybqa.pesapal.com.attacker.com'), TRACKING)).toBe(false);
    expect(validPesapalPaymentUrl(PAYMENT_URL, OTHER_TRACKING)).toBe(false);
    expect(validPesapalPaymentUrl(PAYMENT_URL.replace('https:', 'http:'), TRACKING)).toBe(false);
    expect(validPesapalPaymentUrl(PAYMENT_URL.replace('cybqa.pesapal.com', 'cybqa.pesapal.com:444'), TRACKING)).toBe(false);
    expect(validPesapalPaymentUrl('https://cybqa.pesapal.com/', '')).toBe(false);
  });

  it('rejects mismatched reference or redirect instead of returning unsafe browser navigation', async () => {
    network({ submit: () => ({ status: '200', order_tracking_id: TRACKING, merchant_reference: REF, redirect_url: 'https://attacker.example', error: null }) });
    await expect(createCheckout({ ...context(), totalMinor: 9200 })).rejects.toThrow('did not match');
  });

  it.each([
    [{ merchant_reference: 'DP-2026-999999' }, 'company_ref'],
    [{ merchant_reference: '' }, 'company_ref'],
    [{ currency: 'EUR' }, 'currency'],
    [{ currency: '' }, 'currency'],
    [{ amount: 91.99 }, 'amount'],
    [{ amount: 92.01 }, 'amount'],
    [{ amount: null }, 'amount'],
    [{ amount: 92.001 }, 'amount'],
  ])('routes completed payment with mismatched data to review (%j)', async (fields, mismatch) => {
    network({ status: () => statusResponse(fields) });
    const result = await verifyPayment({ transToken: TRACKING, expected: { reference: REF, currency: 'USD', totalMinor: 9200 } });
    expect(result.status).toBe('requires_review');
    expect(result.mismatch).toBe(mismatch);
  });

  it('uses conservative status and exact safe minor units', () => {
    expect([0, 1, 2, 3, 9].map(mapPesapalStatus)).toEqual(['pending', 'paid', 'failed', 'requires_review', 'unknown']);
    expect(pesapalAmountToMinor(92, 'USD')).toBe(9200);
    expect(pesapalAmountToMinor('92.000', 'USD')).toBe(9200);
    expect(pesapalAmountToMinor('92.001', 'USD')).toBeNull();
    expect(pesapalAmountToMinor('9007199254740993', 'USD')).toBeNull();
    expect(pesapalAmountToMinor('100.50', 'TZS')).toBe(10050);
    expect(buildPesapalOrder({ ...context(), currency: 'TZS', totalMinor: 10050 }).amount).toBe(100.5);
  });

  it('rejects unsafe callback origins before sending an order to the provider', () => {
    vi.stubEnv('STORE_PUBLIC_ORIGIN', 'http://yournexttriptoparadise.com');
    expect(() => buildPesapalOrder({ ...context(), totalMinor: 9200 })).toThrow('Invalid store public origin');
    vi.stubEnv('STORE_PUBLIC_ORIGIN', 'https://name:password@yournexttriptoparadise.com');
    expect(() => buildPesapalOrder({ ...context(), totalMinor: 9200 })).toThrow('Invalid store public origin');
  });
});

describe('Pesapal creation and settlement', () => {
  it.each(['deposit_20', 'full', undefined])('accepts a quote using its stored payment plan (%s)', async (paymentPlan) => {
    network({ rpc: (fn, args) => {
      if (fn === 'store_api_order') return { ok: true, status: 'quoted', paymentPlan };
      if (fn === 'store_api_accept_quote') {
        expect(args.p_payment_plan).toBe(paymentPlan === 'deposit_20' ? 'deposit_20' : 'full');
        return { ok: true, reference: REF, status: 'pending_payment' };
      }
      throw new Error(`Unexpected RPC ${fn}`);
    } });
    expect((await storeAccept(payRequest())).status).toBe(200);
  });

  it('charges only the persisted deposit and attaches provider/environment/URL/claim', async () => {
    const calls = network({ rpc: (fn, args) => {
      if (fn === 'store_api_order') return { ok: true, status: 'pending_payment' };
      if (fn === 'store_payment_context') return context({ providerToken: null, attemptStatus: 'created', providerEnvironment: null });
      if (fn === 'store_begin_payment') {
        expect(args.p_provider).toBe('pesapal');
        expect(args.p_provider_environment).toBe('sandbox');
        return { ok: true, claimed: true };
      }
      if (fn === 'store_attach_payment') {
        expect(args).toMatchObject({ p_provider: 'pesapal', p_provider_token: TRACKING, p_provider_environment: 'sandbox', p_payment_url: PAYMENT_URL });
        expect(args.p_claim_id).toMatch(/^[a-f0-9-]{36}$/);
        return { ok: true };
      }
      throw new Error(`Unexpected RPC ${fn}`);
    } });
    expect((await storePay(payRequest())).status).toBe(200);
    expect(calls.find((call) => call.target.includes('/SubmitOrderRequest')).body.amount).toBe(92);
  });

  it('reuses the stored checkout without calling the provider again', async () => {
    const calls = network({ rpc: (fn) => {
      if (fn === 'store_api_order') return { ok: true, status: 'pending_payment' };
      if (fn === 'store_payment_context') return context();
      if (fn === 'store_begin_payment') return { ok: true, claimed: false, providerToken: TRACKING, paymentUrl: PAYMENT_URL };
      throw new Error(`Unexpected RPC ${fn}`);
    } });
    expect(await (await storePay(payRequest())).json()).toMatchObject({ ok: true, paymentUrl: PAYMENT_URL });
    expect(calls.some((call) => PESAPAL_ORIGINS.has(new URL(call.target).origin))).toBe(false);
  });

  it('reuses a legacy DPO checkout after the configured provider changes to Pesapal', async () => {
    vi.stubEnv('DPO_ENABLED', 'true');
    vi.stubEnv('DPO_COMPANY_TOKEN', 'legacy-company-token');
    vi.stubEnv('DPO_SERVICE_TYPE', '3854');
    const calls = network({ rpc: (fn) => {
      if (fn === 'store_api_order') return { ok: true, status: 'pending_payment' };
      if (fn === 'store_payment_context') return context({ provider: 'dpo', providerToken: 'DPO-T', providerEnvironment: null });
      if (fn === 'store_begin_payment') return { ok: true, claimed: false, providerToken: 'DPO-T', paymentUrl: null };
      throw new Error(`Unexpected RPC ${fn}`);
    } });
    expect(await (await storePay(payRequest())).json()).toMatchObject({
      ok: true, provider: 'dpo', paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=DPO-T',
    });
    expect(calls.some((call) => PESAPAL_ORIGINS.has(new URL(call.target).origin))).toBe(false);
  });

  it('does not verify an existing sandbox attempt with live deployment credentials', async () => {
    vi.stubEnv('PESAPAL_ENVIRONMENT', 'live');
    const calls = network({ rpc: () => context() });
    expect(await verifyAndSettle(REF, { expectedProvider: 'pesapal', expectedToken: TRACKING })).toMatchObject({
      ok: false, error: 'provider_unavailable',
    });
    expect(calls).toHaveLength(1);
  });

  it('never resubmits after a provider timeout: next click sees the SQL claim', async () => {
    let claimed = false;
    let submissions = 0;
    network({
      rpc: (fn) => {
        if (fn === 'store_api_order') return { ok: true, status: 'pending_payment' };
        if (fn === 'store_payment_context') return context({ providerToken: null, attemptStatus: claimed ? 'unknown' : 'created' });
        if (fn === 'store_begin_payment') {
          if (claimed) return { ok: false, error: 'payment_in_progress' };
          claimed = true; return { ok: true, claimed: true };
        }
        throw new Error(`Unexpected RPC ${fn}`);
      },
      submit: () => { submissions++; throw new Error('network timeout'); },
    });
    expect((await storePay(payRequest())).status).toBe(502);
    expect((await storePay(payRequest())).status).toBe(409);
    expect(submissions).toBe(1);
  });

  it('rejects expired holds before claiming or creating a payment', async () => {
    const calls = network({ rpc: (fn) => {
      if (fn === 'store_api_order') return { ok: true, status: 'pending_payment' };
      if (fn === 'store_payment_context') return context({ providerToken: null, holdExpiresAt: new Date(Date.now() - 1000).toISOString() });
      throw new Error(`Unexpected RPC ${fn}`);
    } });
    expect((await storePay(payRequest())).status).toBe(409);
    expect(calls).toHaveLength(2);
  });

  it('validates the deposit, stores verification evidence and finalizes once without DPO acknowledgement', async () => {
    const rpcCalls = [];
    network({ rpc: (fn, args) => {
      rpcCalls.push(fn);
      if (fn === 'store_payment_context') return context();
      if (fn === 'store_mark_payment') {
        expect(args.p_provider_amounts.amount).toBe(92);
        return { ok: true };
      }
      if (fn === 'store_finalize_paid_order') return { ok: true };
      throw new Error(`Unexpected RPC ${fn}`);
    } });
    expect(await verifyAndSettle(REF)).toEqual({ ok: true, state: 'paid' });
    expect(rpcCalls).toEqual(['store_payment_context', 'store_mark_payment', 'store_finalize_paid_order']);
  });

  it.each([
    [{ provider: 'dpo' }, TRACKING],
    [{}, OTHER_TRACKING],
  ])('rejects wrong provider or token before the paid short circuit', async (overrides, token) => {
    const calls = network({ rpc: () => context({ orderStatus: 'paid', ...overrides }) });
    expect(await verifyAndSettle(REF, { expectedProvider: 'pesapal', expectedToken: token })).toMatchObject({ ok: false, error: 'payment_identity_mismatch' });
    expect(calls).toHaveLength(1);
  });
});

describe('Pesapal notifications and deposit receipts', () => {
  it.each(['GET', 'POST'])('returns the exact documented IPN receipt for %s', async (method) => {
    network({ rpc: (fn) => {
      if (fn === 'store_payment_context') return context({ orderStatus: 'paid' });
      if (fn === 'store_record_provider_event') return { ok: true, new: true };
      throw new Error(`Unexpected RPC ${fn}`);
    } });
    const response = await pesapalIpn(ipnRequest(method));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ orderNotificationType: 'IPNCHANGE', orderTrackingId: TRACKING, orderMerchantReference: REF, status: 200 });
  });

  it('allows an identical notification to retry verification after an outage', async () => {
    let checks = 0;
    let finalized = false;
    network({
      rpc: (fn) => {
        if (fn === 'store_payment_context') return context({ orderStatus: finalized ? 'paid' : 'pending_payment' });
        if (fn === 'store_mark_payment') return { ok: true };
        if (fn === 'store_finalize_paid_order') { finalized = true; return { ok: true }; }
        if (fn === 'store_record_provider_event') return { ok: true, new: false };
        throw new Error(`Unexpected RPC ${fn}`);
      },
      status: () => { if (++checks === 1) throw new Error('outage'); return statusResponse(); },
    });
    expect((await pesapalIpn(ipnRequest())).status).toBe(500);
    expect((await pesapalIpn(ipnRequest())).status).toBe(200);
    expect(finalized).toBe(true);
    expect(checks).toBe(2);
  });

  it('flags a reversal after a paid deposit without finalizing again or resending receipts', async () => {
    const rpcCalls = [];
    network({ rpc: (fn) => {
      rpcCalls.push(fn);
      if (fn === 'store_payment_context') return context({ orderStatus: 'paid' });
      if (fn === 'store_flag_payment_review' || fn === 'store_record_provider_event') return { ok: true };
      throw new Error(`Unexpected RPC ${fn}`);
    }, status: () => statusResponse({ status_code: 3 }) });
    expect((await pesapalIpn(ipnRequest())).status).toBe(200);
    expect(rpcCalls).toEqual(['store_payment_context', 'store_flag_payment_review', 'store_record_provider_event']);
  });

  it.each([2, 3])('flags review if another callback finalizes while this notification verifies status %s', async (statusCode) => {
    let persistedStatus = 'pending_payment';
    let reviewFlagged = false;
    network({
      rpc: (fn) => {
        if (fn === 'store_payment_context') return context({ orderStatus: persistedStatus });
        if (fn === 'store_mark_payment') {
          expect(persistedStatus).toBe('paid');
          return { ok: true, skipped: 'order_finalized' };
        }
        if (fn === 'store_flag_payment_review') { reviewFlagged = true; persistedStatus = 'requires_review'; return { ok: true }; }
        if (fn === 'store_record_provider_event') return { ok: true };
        throw new Error(`Unexpected RPC ${fn}`);
      },
      status: () => { persistedStatus = 'paid'; return statusResponse({ status_code: statusCode }); },
    });
    expect((await pesapalIpn(ipnRequest())).status).toBe(200);
    expect(reviewFlagged).toBe(true);
    expect(persistedStatus).toBe('requires_review');
  });

  it('returns retryable failure if recording the verified outcome does not succeed', async () => {
    network({ rpc: (fn) => {
      if (fn === 'store_payment_context') return context();
      if (fn === 'store_mark_payment') return { ok: false, error: 'unknown_order' };
      throw new Error(`Unexpected RPC ${fn}`);
    } });
    expect((await pesapalIpn(ipnRequest())).status).toBe(500);
  });

  it('does not downgrade a concurrently paid order when provider verification fails', async () => {
    let paid = false;
    network({
      rpc: (fn) => {
        if (fn === 'store_payment_context') return context({ orderStatus: paid ? 'paid' : 'pending_payment' });
        if (fn === 'store_mark_payment') {
          expect(paid).toBe(true);
          return { ok: true, skipped: 'order_finalized' };
        }
        if (fn === 'store_record_provider_event') return { ok: true };
        throw new Error(`Unexpected RPC ${fn}`);
      },
      status: () => { paid = true; throw new Error('provider outage after other callback finalized'); },
    });
    expect((await pesapalIpn(ipnRequest())).status).toBe(500);
    expect(paid).toBe(true);
  });

  it('routes failed then completed notifications for the same token to review without new bookings', async () => {
    let orderStatus = 'pending_payment';
    let verificationCount = 0;
    const rpcCalls = [];
    network({
      rpc: (fn, args) => {
        rpcCalls.push(fn);
        if (fn === 'store_payment_context') return context({ orderStatus });
        if (fn === 'store_mark_payment') { expect(args.p_status).toBe('failed'); orderStatus = 'payment_failed'; return { ok: true }; }
        if (fn === 'store_flag_payment_review') { orderStatus = 'requires_review'; return { ok: true }; }
        if (fn === 'store_record_provider_event') return { ok: true };
        throw new Error(`Unexpected RPC ${fn}`);
      },
      status: () => statusResponse({ status_code: ++verificationCount === 1 ? 2 : 1 }),
    });
    expect((await pesapalIpn(ipnRequest())).status).toBe(200);
    expect(orderStatus).toBe('payment_failed');
    expect((await pesapalIpn(ipnRequest())).status).toBe(200);
    expect(orderStatus).toBe('requires_review');
    expect(verificationCount).toBe(2);
    expect(rpcCalls).not.toContain('store_finalize_paid_order');
  });

  it('returns retryable IPN failure for a token mismatch without verifying another transaction', async () => {
    const calls = network({ rpc: () => context() });
    const response = await pesapalIpn(ipnRequest('GET', OTHER_TRACKING));
    expect(response.status).toBe(500);
    expect((await response.json()).status).toBe(500);
    expect(calls).toHaveLength(1);
  });

  it('customer cancellation/return only redirects and never trusts a pushed success', async () => {
    const calls = network();
    const response = await pesapalReturn(new Request(`${ORIGIN}/api/payments/pesapal/return?reference=${REF}&status_code=1`));
    expect(response.headers.get('location')).toBe(`/store/order/${REF}`);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(calls).toHaveLength(0);
  });

  it.each(['en', 'de', 'pl'])('sends accurate deposit totals in the %s guest receipt and team alert', async (language) => {
    vi.stubEnv('RESEND_API_KEY', 'test-resend');
    const emails = [];
    network({
      rpc: (fn) => {
        if (fn === 'store_outbox_due') return [{ id: 'one', kind: 'order_receipt', reference: REF }, { id: 'two', kind: 'booking_confirmations', reference: REF }];
        if (fn === 'store_order_for_notification') return { ...context(), status: 'paid', language, items: [] };
        if (fn === 'store_outbox_mark') return { ok: true };
        throw new Error(`Unexpected RPC ${fn}`);
      },
      resend: (email) => { emails.push(email); return Response.json({ id: 'sent' }); },
    });
    expect((await outboxSend()).status).toBe(200);
    expect(emails).toHaveLength(2);
    for (const email of emails) {
      expect(email.html).toContain('92.00 USD');
      expect(email.html).toContain('460.00 USD');
      expect(email.html).toContain('368.00 USD');
    }
    expect(emails[0].html).not.toContain('Total paid: 460.00');
    expect(emails[1].html).toContain('Deposit received');
  });

  it('keeps a historical full-payment receipt full and shows deposit arithmetic before accepting a new quote', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-resend');
    const emails = [];
    network({
      rpc: (fn, args) => {
        if (fn === 'store_outbox_due') return [
          { id: 'one', kind: 'order_receipt', reference: REF },
          { id: 'two', kind: 'quote_ready', reference: 'DP-2026-999999' },
        ];
        if (fn === 'store_order_for_notification') return args.p_reference === REF
          ? { ...context(), status: 'paid', paymentPlan: 'full', chargeMinor: 46000, balanceMinor: 0, language: 'en' }
          : { ...context(), status: 'quoted', language: 'en' };
        if (fn === 'store_outbox_mark') return { ok: true };
        throw new Error(`Unexpected RPC ${fn}`);
      },
      resend: (email) => { emails.push(email); return Response.json({ id: 'sent' }); },
    });
    expect((await outboxSend()).status).toBe(200);
    expect(emails[0].html).toContain('Total paid: 460.00 USD');
    expect(emails[0].html).not.toContain('20% deposit');
    expect(emails[1].html).toContain('20% deposit due online: 92.00 USD');
    expect(emails[1].html).toContain('368.00 USD');
  });
});
