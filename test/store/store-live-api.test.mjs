import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const reference = 'DP-2026-123456';
const token = 'a'.repeat(48);
const item = { id: 'ci_live', experienceId: 'safari-blue', mode: 'shared', guests: 2, date: '2026-10-10', time: '08:30' };
const contact = { name: 'Test Guest', email: 'guest@example.com' };
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
const checkout = (overrides = {}) => ({
  ok: true, reference, accessToken: token, status: 'pending_payment', currency: 'USD',
  totalMinor: 25001, chargeMinor: 5001, balanceMinor: 20000,
  paymentPlan: 'deposit_20', depositPercent: 20, payment: { mode: 'pesapal' },
  items: [{ id: item.id, sourceKey: item.experienceId, totalMinor: 25001 }],
  ...overrides,
});

let api;
let storage;
beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_STORE_API', 'live');
  storage = new Map();
  vi.stubGlobal('window', { sessionStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  } });
  vi.stubGlobal('document', { documentElement: { lang: 'en' } });
  api = await import('../../src/lib/storeApi.js');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('live store quote and deposit checkout', () => {
  it('shows the server price and rounds the 20% deposit up to a cent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({
      ok: true, currency: 'USD', subtotalMinor: 25001,
      quotes: [{ id: item.id, status: 'available', seats: 8, price: { totalMinor: 25001 } }],
    })));
    const quote = await api.quoteCartItems([item]);
    expect(quote).toMatchObject({ subtotalUsd: 250.01, chargeUsd: 50.01, balanceUsd: 200, paymentPlan: 'deposit_20' });
    expect(quote.quotes[0].totalUsd).toBe(250.01); // Editorial pricing for this selection is $190.
  });

  it('hands a verified deposit amount to Pesapal and retains the order credentials', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply({ ok: true, paymentUrl: 'https://pay.pesapal.com/iframe/PesapalIframe3/abc' }));
    vi.stubGlobal('fetch', fetch);
    const result = await api.submitCheckout({ items: [item], contact, expectedTotalUsd: 250.01, expectedChargeUsd: 50.01 });
    expect(result).toMatchObject({ ok: true, redirect: 'https://pay.pesapal.com/iframe/PesapalIframe3/abc', reference });
    expect(fetch.mock.calls.map(([path]) => path)).toEqual(['/api/store/checkout', '/api/store/pay']);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ reference, token });
    expect(JSON.parse(storage.get(api.ORDER_CREDENTIALS_KEY))).toEqual({ reference, token });
    expect(fetch.mock.calls[0][1]).toMatchObject({ cache: 'no-store', credentials: 'omit' });
  });

  it('stops before payment when the server changes the price or charge, then allows the reviewed amount', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply({ ok: true, paymentUrl: 'https://cybqa.pesapal.com/iframe/PesapalIframe3/abc' }));
    vi.stubGlobal('fetch', fetch);
    const changed = await api.submitCheckout({ items: [item], contact, expectedTotalUsd: 190, expectedChargeUsd: 38 });
    expect(changed).toMatchObject({ ok: false, error: 'price_changed', quote: { subtotalUsd: 250.01, chargeUsd: 50.01, balanceUsd: 200 } });
    expect(fetch).toHaveBeenCalledTimes(1);
    const reviewed = await api.submitCheckout({ items: [item], contact, expectedTotalUsd: changed.quote.subtotalUsd, expectedChargeUsd: changed.quote.chargeUsd });
    expect(reviewed.ok).toBe(true);
    expect(JSON.parse(fetch.mock.calls[0][1].body).idempotencyKey).toBe(JSON.parse(fetch.mock.calls[1][1].body).idempotencyKey);
  });

  it('does not silently charge the full trip when the guest reviewed only a deposit', async () => {
    const fetch = vi.fn().mockResolvedValue(reply(checkout({ chargeMinor: 25001, balanceMinor: 0, paymentPlan: 'full', depositPercent: 100 })));
    vi.stubGlobal('fetch', fetch);
    expect(await api.submitCheckout({ items: [item], contact, expectedTotalUsd: 250.01, expectedChargeUsd: 50.01 })).toMatchObject({
      ok: false, error: 'price_changed', quote: { chargeUsd: 250.01, balanceUsd: 0, paymentPlan: 'full' },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('returns a retryable checkout failure when the network rejects instead of leaving the caller pending', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));
    expect(await api.submitCheckout({ items: [item], contact })).toMatchObject({ ok: false, error: 'network_unavailable' });
    await expect(api.quoteCartItems([item])).rejects.toThrow('network_unavailable');
    api.adoptOrderCredentials(reference, token);
    expect(await api.acceptQuote(reference)).toEqual({ ok: false, error: 'network_unavailable' });
  });

  it('retains credentials after a hosted-payment network failure for a safe retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(checkout())).mockRejectedValueOnce(new TypeError('Connection lost')));
    expect(await api.submitCheckout({ items: [item], contact })).toMatchObject({ ok: false, error: 'network_unavailable' });
    expect(JSON.parse(storage.get(api.ORDER_CREDENTIALS_KEY))).toEqual({ reference, token });
  });

  it.each([
    [{ ok: false, error: 'payment_create_failed' }, false],
    [{ ok: false, error: 'order_not_payable', status: 'payment_failed' }, false],
    [{ ok: false, error: 'order_not_payable', status: 'requires_review' }, true],
    [{ ok: false, error: 'payment_in_progress' }, true],
  ])('allows a fresh checkout only after a definitive payment failure: %j', async (paymentReply, sameOrder) => {
    const fetch = vi.fn().mockResolvedValueOnce(reply(checkout())).mockResolvedValueOnce(reply(paymentReply, 409))
      .mockResolvedValueOnce(reply(checkout())).mockResolvedValueOnce(reply({ ok: false, error: 'payment_in_progress' }, 409));
    vi.stubGlobal('fetch', fetch);
    await api.submitCheckout({ items: [item], contact });
    await api.submitCheckout({ items: [item], contact });
    const firstKey = JSON.parse(fetch.mock.calls[0][1].body).idempotencyKey;
    const retryKey = JSON.parse(fetch.mock.calls[2][1].body).idempotencyKey;
    expect(retryKey === firstKey).toBe(sameOrder);
  });

  it('accepts a staff quote through the same Pesapal hosted flow', async () => {
    api.adoptOrderCredentials(reference, token);
    const fetch = vi.fn().mockResolvedValueOnce(reply(checkout())).mockResolvedValueOnce(reply({ ok: true, paymentUrl: 'https://pay.pesapal.com/iframe/accepted' }));
    vi.stubGlobal('fetch', fetch);
    expect(await api.acceptQuote(reference)).toEqual({ ok: true, redirect: 'https://pay.pesapal.com/iframe/accepted' });
    expect(fetch.mock.calls.map(([path]) => path)).toEqual(['/api/store/accept', '/api/store/pay']);
  });

  it('stops a changed quote deposit before payment, refreshes accepted order, and continues only after review', async () => {
    api.adoptOrderCredentials(reference, token);
    const fetch = vi.fn().mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply({ ok: true, provider: 'pesapal', paymentUrl: 'https://pay.pesapal.com/iframe/reviewed' }));
    vi.stubGlobal('fetch', fetch);
    const changed = await api.acceptQuote(reference, { expectedTotalUsd: 190, expectedChargeUsd: 38 });
    expect(changed).toMatchObject({ ok: false, error: 'price_changed', order: { status: 'pending_payment', totalUsd: 250.01, chargeUsd: 50.01 } });
    expect(fetch.mock.calls.map(([path]) => path)).toEqual(['/api/store/accept', `/api/store/orders/${reference}`]);
    expect(await api.acceptQuote(reference, { expectedTotalUsd: changed.order.totalUsd, expectedChargeUsd: changed.order.chargeUsd })).toEqual({ ok: true, redirect: 'https://pay.pesapal.com/iframe/reviewed' });
  });

  it('keeps historical DPO hosted payment compatible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(checkout({ payment: { mode: 'dpo' } })))
      .mockResolvedValueOnce(reply({ ok: true, paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=token' })));
    expect(await api.submitCheckout({ items: [item], contact })).toMatchObject({ ok: true, redirect: 'https://secure.3gdirectpay.com/payv2.php?ID=token' });
  });

  it('uses the persisted provider when an old DPO attempt is resumed after selecting Pesapal for new orders', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply({ ok: true, provider: 'dpo', paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=old-token' })));
    expect(await api.submitCheckout({ items: [item], contact })).toMatchObject({ ok: true, redirect: 'https://secure.3gdirectpay.com/payv2.php?ID=old-token' });
  });

  it('maps deposit confirmations without turning historical full payments into deposits', async () => {
    api.adoptOrderCredentials(reference, token);
    const fetch = vi.fn().mockResolvedValueOnce(reply(checkout({ status: 'paid', paymentStatus: 'deposit_paid' })))
      .mockResolvedValueOnce(reply({ ok: true, reference, status: 'paid', totalMinor: 25001, items: [] }));
    vi.stubGlobal('fetch', fetch);
    expect(await api.fetchStoredOrder(reference)).toMatchObject({ status: 'paid', paymentStatus: 'deposit_paid', totalUsd: 250.01, chargeUsd: 50.01, balanceUsd: 200 });
    expect(await api.fetchStoredOrder(reference)).toMatchObject({ status: 'paid', paymentPlan: 'full', totalUsd: 250.01, chargeUsd: 250.01, balanceUsd: 0 });
  });

  it('refreshes a cached paid deposit with authoritative reversal state', async () => {
    api.adoptOrderCredentials(reference, token);
    api.saveLastOrder({ reference, status: 'paid', paymentStatus: 'deposit_paid', totalUsd: 250.01 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(checkout({ status: 'requires_review', paymentStatus: 'requires_review' }))));
    expect(await api.fetchStoredOrder(reference)).toMatchObject({ status: 'requires_review', paymentStatus: 'requires_review' });
    expect(api.readLastOrder(reference).status).toBe('requires_review');
  });

  it('resumes the existing historical full/DPO order without creating another checkout or changing its charge', async () => {
    api.adoptOrderCredentials(reference, token);
    const fetch = vi.fn().mockResolvedValueOnce(reply(checkout({ paymentPlan: 'full', chargeMinor: 25001, balanceMinor: 0 })))
      .mockResolvedValueOnce(reply({ ok: true, provider: 'dpo', paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=old-full' }));
    vi.stubGlobal('fetch', fetch);
    expect(await api.continueOrderPayment(reference, { expectedTotalUsd: 250.01, expectedChargeUsd: 250.01 })).toEqual({ ok: true, redirect: 'https://secure.3gdirectpay.com/payv2.php?ID=old-full' });
    expect(fetch.mock.calls.map(([path]) => path)).toEqual([`/api/store/orders/${reference}`, '/api/store/pay']);
  });

  it('checks resumed amounts and terminal state before requesting any payment', async () => {
    api.adoptOrderCredentials(reference, token);
    const fetch = vi.fn().mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply(checkout({ status: 'requires_review' })))
      .mockResolvedValueOnce(reply(checkout({ status: 'paid', paymentStatus: 'deposit_paid' })));
    vi.stubGlobal('fetch', fetch);
    expect(await api.continueOrderPayment(reference, { expectedTotalUsd: 190, expectedChargeUsd: 38 })).toMatchObject({ ok: false, error: 'price_changed', order: { chargeUsd: 50.01 } });
    expect(await api.continueOrderPayment(reference)).toMatchObject({ ok: false, error: 'order_not_payable', order: { status: 'requires_review' } });
    expect(await api.continueOrderPayment(reference)).toMatchObject({ ok: true, order: { status: 'paid' } });
    expect(fetch.mock.calls.every(([path]) => path === `/api/store/orders/${reference}`)).toBe(true);
  });
});

describe('hosted payment redirect boundary', () => {
  it.each([
    'http://pay.pesapal.com/iframe/abc',
    'https://pay.pesapal.com.evil.example/iframe/abc',
    'https://pay.pesapal.com@evil.example/iframe/abc',
    'https://user:secret@pay.pesapal.com/iframe/abc',
    'https://pay.pesapal.com:444/iframe/abc',
    'javascript:alert(1)',
    '/iframe/abc',
  ])('rejects an unsafe server redirect: %s', async (paymentUrl) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(checkout())).mockResolvedValueOnce(reply({ ok: true, paymentUrl })));
    expect(await api.submitCheckout({ items: [item], contact })).toMatchObject({ ok: false, error: 'payment_unavailable' });
  });
});
