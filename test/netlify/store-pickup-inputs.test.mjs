import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseRequestItems, parseStoreItems } from '../../netlify/functions/_store_shared.mjs';
import storeQuote from '../../netlify/functions/store-quote.mjs';
import outboxSend from '../../netlify/functions/store-outbox-send.mjs';

const ORIGIN = 'https://yournexttriptoparadise.com';
const REF = 'DP-2026-123456';
let requestNumber = 0;
const instant = (overrides = {}) => ({
  id: 'instant_1', experienceId: 'spice-tour', mode: 'shared', guests: 2,
  date: '2026-10-05', time: '09:00', ...overrides,
});
const request = (overrides = {}) => ({
  id: 'request_1', experienceId: 'safari-blue', mode: 'request', guests: 2,
  requestedDates: 'Early October', ...overrides,
});
const quoteRequest = (items) => new Request(`${ORIGIN}/api/store/quote`, {
  method: 'POST',
  headers: { origin: ORIGIN, 'content-type': 'application/json', 'x-forwarded-for': `192.0.2.${++requestNumber}` },
  body: JSON.stringify({ items }),
});

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function enableStore() {
  vi.stubEnv('STORE_API_ENABLED', 'true');
  vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'synthetic-service-key');
}

describe('optional pickup input contract', () => {
  it('keeps older instant and mixed carts unchanged without inventing a pickup zone', () => {
    expect(parseStoreItems([instant()])).toEqual({ ok: true, items: [{
      id: 'instant_1', sourceKey: 'spice-tour', optionCode: 'shared', guests: 2,
      date: '2026-10-05', time: '09:00',
    }] });
    expect(parseRequestItems([request(), instant()])).toEqual({ ok: true, items: [{
      id: 'request_1', sourceKey: 'safari-blue', optionCode: 'request', guests: 2,
      requestedDates: 'Early October',
    }, {
      id: 'instant_1', sourceKey: 'spice-tour', optionCode: 'shared', guests: 2,
      date: '2026-10-05', time: '09:00',
    }] });
  });

  it.each(['stone-town', 'north', 'east', 'south', 'other'])('retains the recognized %s zone and trimmed accommodation in both cart flows', (pickupZone) => {
    const fields = { pickupZone, accommodation: '  QA Hôtel Zanzibar  ' };
    const expected = { pickupZone, accommodation: 'QA Hôtel Zanzibar' };
    expect(parseStoreItems([instant(fields)]).items[0]).toMatchObject(expected);
    const mixed = parseRequestItems([request(fields), instant(fields)]);
    expect(mixed.ok).toBe(true);
    for (const item of mixed.items) expect(item).toMatchObject(expected);
  });

  it('allows a quote selection with a zone and no hotel, retaining only supplied fields', () => {
    const parsed = parseStoreItems([instant({ pickupZone: 'north' })]);
    expect(parsed.ok).toBe(true);
    expect(parsed.items[0].pickupZone).toBe('north');
    expect(Object.hasOwn(parsed.items[0], 'accommodation')).toBe(false);
    const hotelOnly = parseStoreItems([instant({ accommodation: 'QA Hotel' })]);
    expect(hotelOnly.ok).toBe(true);
    expect(Object.hasOwn(hotelOnly.items[0], 'pickupZone')).toBe(false);
  });

  it('accepts a hotel up to 200 characters without truncation and preserves the existing 24-guest parser boundary', () => {
    const accommodation = 'H'.repeat(200);
    const parsed = parseStoreItems([instant({ accommodation, guests: 24 })]);
    expect(parsed.ok).toBe(true);
    expect(parsed.items[0]).toMatchObject({ accommodation, guests: 24 });
    expect(parseStoreItems([instant({ guests: 25 })]).ok).toBe(false);
    expect(parseRequestItems([request({ guests: 24 })]).ok).toBe(true);
    expect(parseRequestItems([request({ guests: 25 })]).ok).toBe(false);
  });

  it.each([
    { pickupZone: 'Stone Town' }, { pickupZone: 'north ' }, { pickupZone: '' },
    { pickupZone: null }, { pickupZone: undefined }, { pickupZone: ['north'] },
    { accommodation: 'H'.repeat(201) }, { accommodation: '' }, { accommodation: '   ' },
    { accommodation: null }, { accommodation: undefined }, { accommodation: 123 },
    { accommodation: { name: 'QA Hotel' } }, { accommodation: 'QA\nHotel' },
    { accommodation: 'QA\u0000Hotel' },
  ])('rejects malformed supplied pickup fields for instant and mixed/request items (%j)', (fields) => {
    expect(parseStoreItems([instant(fields)])).toEqual({ ok: false, error: 'invalid_items' });
    expect(parseRequestItems([request(), instant(fields)])).toEqual({ ok: false, error: 'invalid_items' });
    expect(parseRequestItems([request(fields)])).toEqual({ ok: false, error: 'invalid_items' });
  });

  it('drops client amounts, fake breakdowns and unrelated fields instead of forwarding pricing authority', () => {
    const extras = {
      pickupZone: 'east', accommodation: 'QA Hotel', totalMinor: 1, pickupMinor: 0,
      groupPrice: 1, price: { totalMinor: 1 }, priceLines: [{ type: 'pickup_supplement', amountMinor: 0 }],
      paymentPlan: 'full', unexpected: 'ignored',
    };
    const parsed = parseStoreItems([instant(extras)]).items[0];
    expect(parsed).toEqual({
      id: 'instant_1', sourceKey: 'spice-tour', optionCode: 'shared', guests: 2,
      date: '2026-10-05', time: '09:00', pickupZone: 'east', accommodation: 'QA Hotel',
    });
    const mixed = parseRequestItems([request(extras), instant(extras)]);
    for (const item of mixed.items) {
      expect(item).not.toHaveProperty('totalMinor');
      expect(item).not.toHaveProperty('priceLines');
      expect(item).not.toHaveProperty('paymentPlan');
      expect(item).not.toHaveProperty('unexpected');
    }
  });
});

describe('pickup HTTP quote boundary', () => {
  it('forwards the selection only and returns the server quote instead of a client price', async () => {
    enableStore();
    const fetchSpy = vi.fn(async (url, options) => {
      expect(url).toBe('https://example.supabase.co/rest/v1/rpc/store_api_quote');
      expect(JSON.parse(options.body)).toEqual({ p_items: [{
        id: 'instant_1', sourceKey: 'spice-tour', optionCode: 'shared', guests: 2,
        date: '2026-10-05', time: '09:00', pickupZone: 'north',
      }] });
      return Response.json({ currency: 'USD', subtotalMinor: 30001, quotes: [{
        id: 'instant_1', status: 'available', price: { totalMinor: 30001 },
      }] });
    });
    vi.stubGlobal('fetch', fetchSpy);
    const response = await storeQuote(quoteRequest([instant({
      pickupZone: 'north', totalMinor: 1, pickupMinor: 0, price: { totalMinor: 1 },
    })]));
    expect(response.status).toBe(200);
    expect((await response.json()).subtotalMinor).toBe(30001);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it('keeps missing pickup data absent and passes the database pickup_required rejection through', async () => {
    enableStore();
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      expect(JSON.parse(options.body).p_items[0]).not.toHaveProperty('pickupZone');
      expect(JSON.parse(options.body).p_items[0]).not.toHaveProperty('accommodation');
      return Response.json({ error: 'pickup_required' });
    }));
    const response = await storeQuote(quoteRequest([instant()]));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: 'pickup_required' });
  });

  it('rejects malformed supplied fields before any database request', async () => {
    enableStore();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await storeQuote(quoteRequest([instant({ pickupZone: 'unknown' })]));
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// All prices/contacts here are synthetic test data. The email transport and
// database are mocked; these tests cannot send messages or configure fares.
const notificationOrder = (overrides = {}) => ({
  ok: true, reference: REF, status: 'paid', language: 'en', currency: 'USD',
  contactName: 'QA Guest', contactEmail: 'qa@example.com', contactPhone: '',
  paymentPlan: 'deposit_20', totalMinor: 30000, chargeMinor: 6000, balanceMinor: 24000,
  items: [{
    title: 'QA Spice Tour', guests: 2, optionName: 'Shared', kind: 'instant',
    date: '2026-10-05', time: '09:00', pickup: 'North Zanzibar — QA <Lodge> & Beach',
    bookingCode: 'QA-SP-1234', totalMinor: 30000,
    priceLines: [
      { type: 'group_price', guests: 2, quantity: 1, amountMinor: 25000 },
      { type: 'pickup_supplement', zoneCode: 'north', accommodation: 'QA <Lodge> & Beach', quantity: 1, unitMinor: 5000, amountMinor: 5000 },
    ],
  }], ...overrides,
});

function stubNotifications(order, kind = 'order_receipt') {
  enableStore();
  vi.stubEnv('RESEND_API_KEY', 'synthetic-mail-key');
  const messages = [];
  const rpcCalls = [];
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    const target = String(url);
    const body = JSON.parse(options.body);
    if (target.startsWith('https://example.supabase.co/rest/v1/rpc/')) {
      const fn = target.split('/rpc/')[1];
      rpcCalls.push({ fn, body });
      if (fn === 'store_outbox_due') return Response.json([{ id: 'qa-outbox', reference: REF, kind, accessToken: kind === 'quote_ready' ? 'a'.repeat(48) : null }]);
      if (fn === 'store_order_for_notification') return Response.json(order);
      if (['store_outbox_mark', 'store_outbox_redact'].includes(fn)) return Response.json({ ok: true });
    }
    if (target === 'https://api.resend.com/emails') {
      messages.push(body);
      return Response.json({ id: 'synthetic-message' });
    }
    throw new Error('Unexpected test transport');
  }));
  return { messages, rpcCalls };
}

describe('group and pickup notification snapshots', () => {
  it.each([
    ['en', 'Group price', 'Pickup supplement', 'North Zanzibar'],
    ['de', 'Gruppenpreis', 'Abholzuschlag', 'Norden von Sansibar'],
    ['pl', 'Cena grupowa', 'Dopłata za odbiór', 'Północ Zanzibaru'],
  ])('renders the whole-group and pickup amounts with escaped hotel details in %s', async (language, groupLabel, pickupLabel, zoneLabel) => {
    const { messages } = stubNotifications(notificationOrder({ language }));
    const response = await outboxSend();
    expect(await response.json()).toEqual({ ok: true, sent: 1 });
    expect(messages).toHaveLength(1);
    const html = messages[0].html;
    expect(html).toContain(groupLabel);
    expect(html).toContain('250.00 USD');
    expect(html).not.toContain('500.00 USD');
    expect(html).toContain(pickupLabel);
    expect(html).toContain(zoneLabel);
    expect(html).toContain('50.00 USD');
    expect(html).toContain('QA &lt;Lodge&gt; &amp; Beach');
    expect(html).not.toContain('QA <Lodge>');
    expect(html).toContain('60.00 USD');
    expect(html).toContain('240.00 USD');
    expect(html).toContain('300.00 USD');
  });

  it('includes configured zero pickup without inventing a fare, and preserves quote-link redaction', async () => {
    const order = notificationOrder({ status: 'quoted', totalMinor: 25000, chargeMinor: 5000, balanceMinor: 20000 });
    order.items[0].totalMinor = 25000;
    order.items[0].priceLines[1].amountMinor = 0;
    order.items[0].priceLines[1].unitMinor = 0;
    const { messages, rpcCalls } = stubNotifications(order, 'quote_ready');
    expect((await outboxSend()).status).toBe(200);
    expect(messages).toHaveLength(1);
    expect(messages[0].html).toContain('Pickup supplement · North Zanzibar · QA &lt;Lodge&gt; &amp; Beach: 0.00 USD');
    expect(messages[0].html).toContain('Group price (2 guests): 250.00 USD');
    expect(messages[0].html).toContain('Trip total: 250.00 USD');
    expect(messages[0].html).toContain('20% deposit due online: 50.00 USD');
    expect(rpcCalls).toContainEqual({ fn: 'store_outbox_redact', body: { p_id: 'qa-outbox' } });
  });

  it('exposes pickup and group snapshots in operational booking emails', async () => {
    const { messages } = stubNotifications(notificationOrder(), 'booking_confirmations');
    expect((await outboxSend()).status).toBe(200);
    expect(messages).toHaveLength(1);
    expect(messages[0].html).toContain('Group price (2 guests): 250.00 USD');
    expect(messages[0].html).toContain('Pickup supplement · North Zanzibar · QA &lt;Lodge&gt; &amp; Beach: 50.00 USD');
    expect(messages[0].html).toContain('Remaining balance due on the day');
  });

  it('keeps historical full-payment receipts unchanged when new price lines are absent', async () => {
    const order = notificationOrder({ paymentPlan: 'full', chargeMinor: 30000, balanceMinor: 0 });
    delete order.items[0].priceLines;
    const { messages } = stubNotifications(order);
    expect((await outboxSend()).status).toBe(200);
    expect(messages).toHaveLength(1);
    expect(messages[0].html).toContain('Total paid: 300.00 USD');
    expect(messages[0].html).not.toContain('Group price');
    expect(messages[0].html).not.toContain('Pickup supplement');
    expect(messages[0].html).not.toContain('20% deposit');
  });
});
