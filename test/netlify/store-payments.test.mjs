import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  amountStringToMinor,
  buildCreateTokenXml,
  escapeXml,
  mapVerifyCode,
  minorToAmountString,
  serviceDateFor,
  verifyPayment,
  xmlValue,
} from '../../netlify/functions/_dpo.mjs';
import { verifyAndSettle } from '../../netlify/functions/_store_payments.mjs';
import storePay from '../../netlify/functions/store-pay.mjs';
import paymentReturn from '../../netlify/functions/store-payment-return.mjs';
import paymentCallback from '../../netlify/functions/store-payment-callback.mjs';

const ORIGIN = 'https://yournexttriptoparadise.com';
const REF = 'DP-2026-123456';
const TOKEN48 = 'a'.repeat(48);

function enablePaymentsEnv() {
  vi.stubEnv('STORE_API_ENABLED', 'true');
  vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
  vi.stubEnv('DPO_ENABLED', 'true');
  vi.stubEnv('DPO_COMPANY_TOKEN', 'COMPANY-TOKEN');
  vi.stubEnv('DPO_SERVICE_TYPE', '3854');
}

const verifyXml = (fields) => `<?xml version="1.0"?><API3G>${Object.entries(fields)
  .map(([tag, value]) => `<${tag}>${value}</${tag}>`).join('')}</API3G>`;

// Routes stubbed fetches: PostgREST RPC calls vs DPO XML calls.
function stubNetwork({ rpc, dpo }) {
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    const target = String(url);
    if (target.includes('/rest/v1/rpc/')) {
      const fnName = target.split('/rpc/')[1];
      const args = JSON.parse(options.body);
      const result = await rpc(fnName, args);
      return new Response(JSON.stringify(result), { status: 200 });
    }
    if (target.includes('3gdirectpay')) {
      return new Response(await dpo(options.body), { status: 200 });
    }
    throw new Error(`unexpected fetch ${target}`);
  }));
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('DPO XML primitives', () => {
  it('escapes markup, quotes and control characters', () => {
    expect(escapeXml('Dhow & <spice> "tour"')).toBe('Dhow &amp; &lt;spice&gt; &quot;tour&quot;');
    expect(escapeXml("O'Neill")).toBe('O&apos;Neill');
  });

  it('extracts scalar values incl. CDATA and entities', () => {
    expect(xmlValue('<API3G><Result>000</Result></API3G>', 'Result')).toBe('000');
    expect(xmlValue('<A><X><![CDATA[a & b]]></X></A>', 'X')).toBe('a & b');
    expect(xmlValue('<A><X>a &amp; b</X></A>', 'X')).toBe('a & b');
    expect(xmlValue('<A></A>', 'X')).toBeNull();
  });

  it('serializes and parses amounts per currency exponent', () => {
    expect(minorToAmountString(46000, 'USD')).toBe('460.00');
    expect(minorToAmountString(150000, 'TZS')).toBe('150000');
    expect(amountStringToMinor('460.00', 'USD')).toBe(46000);
    expect(amountStringToMinor('460', 'USD')).toBe(46000);
    expect(amountStringToMinor('460.005', 'USD')).toBeNull();
    expect(amountStringToMinor('', 'USD')).toBeNull();
    expect(amountStringToMinor('abc', 'USD')).toBeNull();
  });

  it('formats ServiceDate as YYYY/MM/DD HH:MM', () => {
    expect(serviceDateFor('2026-08-18', '08:30')).toBe('2026/08/18 08:30');
  });

  it('builds one Service per trip with escaped content', () => {
    enablePaymentsEnv();
    const xml = buildCreateTokenXml({
      reference: REF,
      currency: 'USD',
      totalMinor: 46000,
      contactName: 'Jane & Joe Traveller',
      contactEmail: 'j@example.com',
      items: [
        { title: 'Safari Blue', optionName: 'Shared group', guests: 2, date: '2026-08-18', time: '08:30' },
        { title: 'Spice <Tour>', optionName: 'Private group', guests: 3, date: '2026-08-19', time: '09:00' },
      ],
    }, { ptlMinutes: 12 });
    expect(xml.match(/<Service>/g)).toHaveLength(2);
    expect(xml).toContain('<PaymentAmount>460.00</PaymentAmount>');
    expect(xml).toContain(`<CompanyRef>${REF}</CompanyRef>`);
    expect(xml).toContain('<CompanyRefUnique>1</CompanyRefUnique>');
    expect(xml).toContain('<PTL>12</PTL>');
    expect(xml).toContain('Spice &lt;Tour&gt;');
    expect(xml).toContain('<customerFirstName>Jane</customerFirstName>');
    expect(xml).toContain('<ServiceDate>2026/08/18 08:30</ServiceDate>');
  });

  it('maps provider codes conservatively', () => {
    expect(mapVerifyCode('000')).toBe('paid');
    expect(mapVerifyCode('900')).toBe('pending');
    expect(mapVerifyCode('901')).toBe('failed');
    expect(mapVerifyCode('902')).toBe('verification_failed');
    expect(mapVerifyCode('903')).toBe('expired');
    expect(mapVerifyCode('904')).toBe('failed');
    expect(mapVerifyCode('123')).toBe('unknown');
    expect(mapVerifyCode('')).toBe('unknown');
  });
});

describe('verifyPayment amount/reference guards', () => {
  const expected = { reference: REF, currency: 'USD', totalMinor: 46000 };

  const verify = (fields) =>
    verifyPayment(
      { transToken: 'T', expected },
      { fetchFn: async () => new Response(verifyXml(fields), { status: 200 }) },
    );

  it('accepts a paid result only when everything matches', async () => {
    enablePaymentsEnv();
    const result = await verify({ Result: '000', CompanyRef: REF, TransactionCurrency: 'USD', TransactionAmount: '460.00' });
    expect(result.status).toBe('paid');
  });

  it('routes amount, currency and reference mismatches to review', async () => {
    enablePaymentsEnv();
    expect((await verify({ Result: '000', CompanyRef: REF, TransactionCurrency: 'USD', TransactionAmount: '459.00' })).mismatch).toBe('amount');
    expect((await verify({ Result: '000', CompanyRef: REF, TransactionCurrency: 'EUR', TransactionAmount: '460.00' })).mismatch).toBe('currency');
    expect((await verify({ Result: '000', CompanyRef: 'DP-2026-999999', TransactionCurrency: 'USD', TransactionAmount: '460.00' })).mismatch).toBe('company_ref');
    expect((await verify({ Result: '000', CompanyRef: REF, TransactionCurrency: 'USD' })).status).toBe('requires_review');
  });

  it('passes non-paid codes through without mismatch checks', async () => {
    enablePaymentsEnv();
    expect((await verify({ Result: '900' })).status).toBe('pending');
  });
});

describe('verifyAndSettle pipeline', () => {
  function contextRow(overrides = {}) {
    return {
      ok: true, reference: REF, orderStatus: 'pending_payment', currency: 'USD',
      totalMinor: 46000, providerToken: 'T', ...overrides,
    };
  }

  it('finalizes and acknowledges a verified paid order', async () => {
    enablePaymentsEnv();
    const calls = [];
    stubNetwork({
      rpc: (fn, args) => {
        calls.push(fn);
        if (fn === 'store_payment_context') return contextRow();
        if (fn === 'store_finalize_paid_order') return { ok: true, bookings: [{}] };
        if (fn === 'store_mark_payment_ack') {
          expect(args.p_acknowledged).toBe(true);
          return { ok: true };
        }
        throw new Error(`unexpected rpc ${fn}`);
      },
      dpo: (body) => verifyXml(String(body).includes('<VerifyTransaction>1</VerifyTransaction>')
        ? { Result: '000' }
        : { Result: '000', CompanyRef: REF, TransactionCurrency: 'USD', TransactionAmount: '460.00' }),
    });
    const result = await verifyAndSettle(REF);
    expect(result).toEqual({ ok: true, state: 'paid' });
    expect(calls).toEqual(['store_payment_context', 'store_finalize_paid_order', 'store_mark_payment_ack']);
  });

  it('flags acknowledgement failure without touching the paid order', async () => {
    enablePaymentsEnv();
    let ackFlag = null;
    stubNetwork({
      rpc: (fn, args) => {
        if (fn === 'store_payment_context') return contextRow();
        if (fn === 'store_finalize_paid_order') return { ok: true };
        if (fn === 'store_mark_payment_ack') { ackFlag = args.p_acknowledged; return { ok: true }; }
        throw new Error(`unexpected rpc ${fn}`);
      },
      dpo: (body) => String(body).includes('<VerifyTransaction>1</VerifyTransaction>')
        ? verifyXml({ Result: '904' })
        : verifyXml({ Result: '000', CompanyRef: REF, TransactionCurrency: 'USD', TransactionAmount: '460.00' }),
    });
    const result = await verifyAndSettle(REF);
    expect(result.state).toBe('paid');
    expect(ackFlag).toBe(false);
  });

  it('marks declined payments failed (seats release in SQL)', async () => {
    enablePaymentsEnv();
    let marked = null;
    stubNetwork({
      rpc: (fn, args) => {
        if (fn === 'store_payment_context') return contextRow();
        if (fn === 'store_mark_payment') { marked = args.p_status; return { ok: true }; }
        throw new Error(`unexpected rpc ${fn}`);
      },
      dpo: () => verifyXml({ Result: '901' }),
    });
    const result = await verifyAndSettle(REF);
    expect(result.state).toBe('failed');
    expect(marked).toBe('failed');
  });

  it('records unknown and never guesses when the provider is unreachable', async () => {
    enablePaymentsEnv();
    let marked = null;
    stubNetwork({
      rpc: (fn, args) => {
        if (fn === 'store_payment_context') return contextRow();
        if (fn === 'store_mark_payment') { marked = args.p_status; return { ok: true }; }
        throw new Error(`unexpected rpc ${fn}`);
      },
      dpo: () => { throw new Error('network down'); },
    });
    const result = await verifyAndSettle(REF);
    expect(result.ok).toBe(false);
    expect(marked).toBe('unknown');
  });

  it('short-circuits an already-paid order without calling DPO', async () => {
    enablePaymentsEnv();
    stubNetwork({
      rpc: (fn) => {
        if (fn === 'store_payment_context') return contextRow({ orderStatus: 'paid' });
        throw new Error(`unexpected rpc ${fn}`);
      },
      dpo: () => { throw new Error('must not be called'); },
    });
    expect(await verifyAndSettle(REF)).toEqual({ ok: true, state: 'paid' });
  });
});

describe('store-pay endpoint', () => {
  const payRequest = () => new Request(`${ORIGIN}/api/store/pay`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN },
    body: JSON.stringify({ reference: REF, token: TOKEN48 }),
  });

  it('ships dark without DPO credentials', async () => {
    vi.stubEnv('STORE_API_ENABLED', 'true');
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
    const res = await storePay(payRequest());
    expect(res.status).toBe(404);
  });

  it('creates the hosted checkout and attaches the transaction', async () => {
    enablePaymentsEnv();
    const rpcCalls = [];
    stubNetwork({
      rpc: (fn, args) => {
        rpcCalls.push(fn);
        if (fn === 'store_api_order') return { ok: true, status: 'pending_payment' };
        if (fn === 'store_payment_context') {
          return {
            ok: true, reference: REF, currency: 'USD', totalMinor: 46000,
            contactName: 'Jane', contactEmail: 'j@example.com', contactPhone: '',
            holdExpiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
            items: [{ title: 'Safari Blue', optionName: 'Shared group', guests: 2, date: '2026-08-18', time: '08:30' }],
          };
        }
        if (fn === 'store_attach_payment') {
          expect(args.p_provider_token).toBe('TRANS-TOKEN-1');
          return { ok: true };
        }
        throw new Error(`unexpected rpc ${fn}`);
      },
      dpo: () => verifyXml({ Result: '000', TransToken: 'TRANS-TOKEN-1', TransRef: 'R1' }),
    });
    const res = await storePay(payRequest());
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.paymentUrl).toContain('ID=TRANS-TOKEN-1');
    expect(rpcCalls).toContain('store_attach_payment');
  });

  it('fails the attempt when DPO rejects transaction creation', async () => {
    enablePaymentsEnv();
    let marked = null;
    stubNetwork({
      rpc: (fn, args) => {
        if (fn === 'store_api_order') return { ok: true, status: 'pending_payment' };
        if (fn === 'store_payment_context') {
          return { ok: true, reference: REF, currency: 'USD', totalMinor: 46000, holdExpiresAt: new Date().toISOString(), items: [] };
        }
        if (fn === 'store_mark_payment') { marked = args.p_status; return { ok: true }; }
        throw new Error(`unexpected rpc ${fn}`);
      },
      dpo: () => verifyXml({ Result: '904', ResultExplanation: 'Invalid ServiceType' }),
    });
    const res = await storePay(payRequest());
    expect(res.status).toBe(502);
    expect(marked).toBe('failed');
  });
});

describe('payment return + callback endpoints', () => {
  it('return endpoint redirects to the order page and never trusts params', async () => {
    enablePaymentsEnv();
    stubNetwork({
      rpc: (fn) => {
        if (fn === 'store_payment_context') return { ok: true, reference: REF, orderStatus: 'paid' };
        throw new Error(`unexpected rpc ${fn}`);
      },
      dpo: () => { throw new Error('not needed'); },
    });
    const res = await paymentReturn(new Request(`${ORIGIN}/api/payments/dpo/return?reference=${REF}&Result=000`));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`/store/order/${REF}`);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('return endpoint bounces garbage references to the store', async () => {
    const res = await paymentReturn(new Request(`${ORIGIN}/api/payments/dpo/return?reference=../etc/passwd`));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/store');
  });

  it('callback dedupes identical deliveries', async () => {
    enablePaymentsEnv();
    let eventCount = 0;
    stubNetwork({
      rpc: (fn) => {
        if (fn === 'store_record_provider_event') {
          eventCount += 1;
          return { ok: true, new: eventCount === 1 };
        }
        if (fn === 'store_payment_context') return { ok: true, reference: REF, orderStatus: 'paid' };
        throw new Error(`unexpected rpc ${fn}`);
      },
      dpo: () => { throw new Error('not needed'); },
    });
    const makeRequest = () => new Request(`${ORIGIN}/api/payments/dpo/callback?CompanyRef=${REF}&TransID=X1`);
    const first = await (await paymentCallback(makeRequest())).json();
    const second = await (await paymentCallback(makeRequest())).json();
    expect(first.state).toBe('paid');
    expect(second.duplicate).toBe(true);
  });
});
