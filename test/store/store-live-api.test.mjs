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
  }, localStorage: { setItem: vi.fn() } });
  vi.stubGlobal('document', { documentElement: { lang: 'en' } });
  api = await import('../../src/lib/storeApi.js');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('live store quote and deposit checkout', () => {
  it('uses only explicit approved pickup catalog maps and never editorial price fallback', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(reply({ ok: true, experiences: [{ sourceKey: 'safari-blue', options: [
      { code: 'shared', currency: 'USD', pickupPricingRequired: true, groupPrices: { 2: 16001 }, pickupPrices: { north: 9000 } },
      { code: 'private', currency: 'EUR', pickupPricingRequired: true, groupPrices: { 2: 21000 }, pickupPrices: { north: 9000 } },
    ] }] })).mockResolvedValueOnce(reply({ ok: true, experiences: [] }));
    vi.stubGlobal('fetch', fetch);
    const approved = await api.fetchBookingPricing('safari-blue');
    expect(api.priceSelection({ groupPickupPricing: approved }, 'shared', 2, 'north').totalUsd).toBe(250.01);
    expect(api.priceSelection({ groupPickupPricing: approved }, 'private', 2, 'north').quoteRequired).toBe(true);
    expect(await api.fetchBookingPricing('missing')).toBe(null);
    expect(api.priceSelection({ priceUsd: 95, groupPickupPricing: null }, 'shared', 2, 'north')).toMatchObject({ totalUsd: null, quoteRequired: true });
  });
  it('carries pickup answers and immutable server breakdown through re-quote and changed-price review', async () => {
    const selection = { ...item, pickupZone: 'north', accommodation: '  Local QA hotel  ' };
    const lines = [{ type: 'group_price', guests: 2, amountMinor: 16001 }, { type: 'pickup_supplement', zoneCode: 'north', accommodation: 'Local QA hotel', amountMinor: 9000 }];
    const fetch = vi.fn().mockResolvedValueOnce(reply({ ok: true, subtotalMinor: 25001, quotes: [{ id: item.id, status: 'available', price: { totalMinor: 25001, lines } }] }))
      .mockResolvedValueOnce(reply(checkout({ items: [{ id: item.id, totalMinor: 25001, priceLines: lines, pickup: 'north — Local QA hotel' }] })));
    vi.stubGlobal('fetch', fetch);
    const quote = await api.quoteCartItems([selection]);
    expect(quote.quotes[0].priceLines.map((line) => line.amountUsd)).toEqual([160.01, 90]);
    expect(JSON.parse(fetch.mock.calls[0][1].body).items[0]).toMatchObject({ pickupZone: 'north', accommodation: 'Local QA hotel' });
    const changed = await api.submitCheckout({ items: [selection], contact, expectedTotalUsd: 1, expectedChargeUsd: 0.2 });
    expect(changed.quote.quotes[0]).toMatchObject({ totalUsd: 250.01, pickup: 'north — Local QA hotel' });
    expect(changed.quote.quotes[0].priceLines.map((line) => line.amountUsd)).toEqual([160.01, 90]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('keeps unavailable quoted prices unknown and changes idempotency keys when pickup answers change', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(reply({ ok: true, subtotalMinor: 0, quotes: [{ id: item.id, status: 'quote_required' }] }))
      .mockResolvedValueOnce(reply({ ok: false, error: 'availability_conflict', conflicts: [{ id: item.id, status: 'quote_required' }] }, 409))
      .mockResolvedValueOnce(reply({ ok: false, error: 'availability_conflict', conflicts: [{ id: item.id, status: 'quote_required' }] }, 409));
    vi.stubGlobal('fetch', fetch);
    expect((await api.quoteCartItems([item])).quotes[0].totalUsd).toBe(null);
    await api.submitCheckout({ items: [{ ...item, pickupZone: 'north', accommodation: 'QA hotel A' }], contact });
    await api.submitCheckout({ items: [{ ...item, pickupZone: 'north', accommodation: 'QA hotel B' }], contact });
    expect(JSON.parse(fetch.mock.calls[1][1].body).idempotencyKey).not.toBe(JSON.parse(fetch.mock.calls[2][1].body).idempotencyKey);
  });
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
    expect(result).toEqual({ ok: true, provider: 'pesapal', paymentUrl: 'https://pay.pesapal.com/iframe/PesapalIframe3/abc', redirect: 'https://pay.pesapal.com/iframe/PesapalIframe3/abc', reference });
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
    expect(await api.acceptQuote(reference)).toEqual({ ok: true, provider: 'pesapal', paymentUrl: 'https://pay.pesapal.com/iframe/accepted', redirect: 'https://pay.pesapal.com/iframe/accepted', reference });
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
    expect(await api.acceptQuote(reference, { expectedTotalUsd: changed.order.totalUsd, expectedChargeUsd: changed.order.chargeUsd })).toEqual({ ok: true, provider: 'pesapal', paymentUrl: 'https://pay.pesapal.com/iframe/reviewed', redirect: 'https://pay.pesapal.com/iframe/reviewed', reference });
  });

  it('keeps historical DPO hosted payment compatible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(checkout({ payment: { mode: 'dpo' } })))
      .mockResolvedValueOnce(reply({ ok: true, paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=token' })));
    expect(await api.submitCheckout({ items: [item], contact })).toMatchObject({ ok: true, provider: 'dpo', paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=token', redirect: 'https://secure.3gdirectpay.com/payv2.php?ID=token', reference });
  });

  it('uses the persisted provider when an old DPO attempt is resumed after selecting Pesapal for new orders', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply({ ok: true, provider: 'dpo', paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=old-token' })));
    expect(await api.submitCheckout({ items: [item], contact })).toMatchObject({ ok: true, provider: 'dpo', paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=old-token', redirect: 'https://secure.3gdirectpay.com/payv2.php?ID=old-token', reference });
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
    expect(await api.continueOrderPayment(reference, { expectedTotalUsd: 250.01, expectedChargeUsd: 250.01 })).toEqual({ ok: true, provider: 'dpo', paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=old-full', redirect: 'https://secure.3gdirectpay.com/payv2.php?ID=old-full', reference });
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

describe('transient hosted payment handoff', () => {
  const runFlow = (flow) => flow === 'submitCheckout'
    ? api.submitCheckout({ items: [item], contact, expectedTotalUsd: 250.01, expectedChargeUsd: 50.01 })
    : api[flow](reference, { expectedTotalUsd: 250.01, expectedChargeUsd: 50.01 });

  it.each(['submitCheckout', 'acceptQuote', 'continueOrderPayment'])('%s returns the validated Pesapal handoff without persisting the payment URL', async (flow) => {
    api.adoptOrderCredentials(reference, token);
    const paymentUrl = 'https://cybqa.pesapal.com/pesapaliframe/PesapalIframe3/Index/?OrderTrackingId=private-tracking-id';
    const fetch = vi.fn().mockResolvedValueOnce(reply(checkout({ paymentUrl, providerPaymentUrl: paymentUrl })))
      .mockResolvedValueOnce(reply({ ok: true, provider: 'pesapal', paymentUrl, reference }));
    vi.stubGlobal('fetch', fetch);
    expect(await runFlow(flow)).toEqual({ ok: true, provider: 'pesapal', paymentUrl, reference, redirect: paymentUrl });
    expect(JSON.stringify([...storage.values()])).not.toContain('private-tracking-id');
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    const expectedFirstPath = flow === 'submitCheckout' ? '/api/store/checkout'
      : flow === 'acceptQuote' ? '/api/store/accept' : `/api/store/orders/${reference}`;
    expect(fetch.mock.calls.map(([path]) => path)).toEqual([expectedFirstPath, '/api/store/pay']);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ reference, token });
    if (flow === 'continueOrderPayment') {
      expect(fetch.mock.calls[0][1].headers.authorization).toBe(`Bearer ${token}`);
      expect(api.readLastOrder(reference)).not.toHaveProperty('paymentUrl');
      expect(api.readLastOrder(reference)).not.toHaveProperty('providerPaymentUrl');
    }
  });

  it.each(['acceptQuote', 'continueOrderPayment'])('%s preserves the persisted DPO provider after switching new orders to Pesapal', async (flow) => {
    api.adoptOrderCredentials(reference, token);
    const paymentUrl = 'https://secure.3gdirectpay.com/payv2.php?ID=historical-token';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply({ ok: true, provider: 'dpo', paymentUrl, reference })));
    expect(await runFlow(flow)).toEqual({ ok: true, provider: 'dpo', paymentUrl, reference, redirect: paymentUrl });
  });

  it.each(['submitCheckout', 'acceptQuote', 'continueOrderPayment'])('%s rejects a payment response for a different order', async (flow) => {
    api.adoptOrderCredentials(reference, token);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply({ ok: true, provider: 'pesapal', paymentUrl: 'https://pay.pesapal.com/iframe/other-order', reference: 'DP-2026-654321' })));
    const result = await runFlow(flow);
    expect(result).toMatchObject({ ok: false, error: 'payment_unavailable' });
    expect(result).not.toHaveProperty('paymentUrl');
    expect(result).not.toHaveProperty('redirect');
  });

  it.each([
    ['pesapal', 'https://pay.pesapal.com.evil.example/iframe/abc'],
    ['unknown', 'https://pay.pesapal.com/iframe/abc'],
    ['dpo', 'https://pay.pesapal.com/iframe/abc'],
    [undefined, 'https://pay.pesapal.com/iframe/abc'],
  ])('continuation rejects an unsafe URL/provider pair (%s, %s)', async (provider, paymentUrl) => {
    api.adoptOrderCredentials(reference, token);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(checkout()))
      .mockResolvedValueOnce(reply({ ok: true, provider, paymentUrl, reference })));
    expect(await api.continueOrderPayment(reference)).toEqual({ ok: false, error: 'payment_unavailable' });
  });
});
