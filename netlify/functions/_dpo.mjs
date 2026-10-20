// DPO Pay adapter (HANDOFF.md Phase 3, "Provider isolation").
// Underscore-prefixed: library only, not a deployed function.
//
// Everything DPO-specific — XML building/escaping, response parsing, result
// codes, amount serialization — lives here so business logic and database
// functions never see provider vocabulary. The exposed operations mirror the
// handoff's adapter sketch:
//   createCheckout(order)          → hosted-payment token + URL
//   verifyPayment(reference/token) → normalized status snapshot
//   acknowledgePayment(token)      → post-finalize verifyToken(1) call
//   mapVerifyResult(xml)           → internal status mapping
//
// Sandbox caveats (flagged in HANDOFF "DPO onboarding checklist"): the exact
// callback contract, VerifyTransaction acknowledgement semantics and the
// authoritative amount fields under currency conversion MUST be confirmed
// against the sandbox before production. The mapping below is deliberately
// conservative: anything ambiguous lands on 'unknown' or 'verification_failed',
// never silently on 'paid'.

import { fetchWithTimeout } from './_shared.mjs';

const DEFAULT_API_URL = 'https://secure.3gdirectpay.com/API/v6/';
const DEFAULT_PAY_URL = 'https://secure.3gdirectpay.com/payv2.php';

const env = () => ({
  companyToken: (process.env.DPO_COMPANY_TOKEN || '').trim(),
  apiUrl: (process.env.DPO_API_URL || DEFAULT_API_URL).trim(),
  payUrl: (process.env.DPO_PAY_URL || DEFAULT_PAY_URL).trim(),
  serviceType: (process.env.DPO_SERVICE_TYPE || '').trim(),
  publicOrigin: (process.env.STORE_PUBLIC_ORIGIN || 'https://yournexttriptoparadise.com').replace(/\/+$/, ''),
});

// DPO is live only when the store API is on AND credentials + the approved
// ServiceType exist. Everything ships dark otherwise.
export function dpoEnabled() {
  const { companyToken, serviceType } = env();
  return process.env.DPO_ENABLED === 'true' && Boolean(companyToken) && Boolean(serviceType);
}

// ---- XML helpers ------------------------------------------------------------

export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Strip control characters that would invalidate the document.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

// Minimal scalar extractor for DPO's flat response documents. Returns the
// text of the FIRST occurrence of <tag>…</tag>, entity-decoded, or null.
export function xmlValue(xml, tag) {
  const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(String(xml || ''));
  if (!match) return null;
  let value = match[1].trim();
  const cdata = /^<!\[CDATA\[([\s\S]*?)\]\]>$/.exec(value);
  if (cdata) value = cdata[1];
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// ---- Amounts ----------------------------------------------------------------

// DPO takes decimal strings; we hold integer minor units. TZS mobile money is
// whole-unit per DPO's MNO advisory (HANDOFF), so it gets no decimals.
const CURRENCY_EXPONENT = { USD: 2, EUR: 2, GBP: 2, TZS: 0 };

export function minorToAmountString(minor, currency) {
  const exponent = CURRENCY_EXPONENT[currency] ?? 2;
  const value = Number(minor) / 10 ** exponent;
  return value.toFixed(exponent);
}

// Parses a DPO-reported decimal amount back into integer minor units.
// Returns null (never 0) for missing/garbled values so mismatch handling
// kicks in instead of a fake zero comparison.
export function amountStringToMinor(amount, currency) {
  const text = String(amount ?? '').trim().replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const exponent = CURRENCY_EXPONENT[currency] ?? 2;
  const [whole, fraction = ''] = text.split('.');
  const paddedFraction = (fraction + '0'.repeat(exponent)).slice(0, exponent);
  const remainder = fraction.slice(exponent);
  if (remainder && /[1-9]/.test(remainder)) return null; // sub-minor precision → suspicious
  return Number(whole) * 10 ** exponent + Number(paddedFraction || 0);
}

// ---- createToken ------------------------------------------------------------

// 'YYYY/MM/DD HH:MM' — DPO's ServiceDate serialization, Zanzibar wall time
// (HANDOFF "Create-token mapping").
export function serviceDateFor(localDate, localTime) {
  return `${String(localDate).replace(/-/g, '/')} ${localTime}`;
}

function splitName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/);
  const first = parts.shift() || 'Guest';
  return { first, last: parts.join(' ') || '—' };
}

// Builds the createToken document: one <Service> per order item so DPO's
// transaction mirrors the multi-trip cart (the database stays the source of
// truth for individual trips).
export function buildCreateTokenXml(order, { ptlMinutes = 15 } = {}) {
  const { companyToken, serviceType, publicOrigin } = env();
  const { first, last } = splitName(order.contactName);
  const returnUrl = `${publicOrigin}/api/payments/dpo/return?reference=${encodeURIComponent(order.reference)}`;
  const backUrl = `${publicOrigin}/store/checkout`;

  const services = order.items.map((item) => `
    <Service>
      <ServiceType>${escapeXml(serviceType)}</ServiceType>
      <ServiceDescription>${escapeXml(`${item.title} · ${item.optionName || item.optionCode} · ${item.guests} guests`)}</ServiceDescription>
      <ServiceDate>${escapeXml(serviceDateFor(item.date, item.time))}</ServiceDate>
    </Service>`).join('');

  return `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${escapeXml(minorToAmountString(order.totalMinor, order.currency))}</PaymentAmount>
    <PaymentCurrency>${escapeXml(order.currency)}</PaymentCurrency>
    <CompanyRef>${escapeXml(order.reference)}</CompanyRef>
    <CompanyRefUnique>1</CompanyRefUnique>
    <PTL>${Math.max(5, Math.floor(ptlMinutes))}</PTL>
    <PTLtype>minutes</PTLtype>
    <RedirectURL>${escapeXml(returnUrl)}</RedirectURL>
    <BackURL>${escapeXml(backUrl)}</BackURL>
    <customerFirstName>${escapeXml(first)}</customerFirstName>
    <customerLastName>${escapeXml(last)}</customerLastName>
    <customerEmail>${escapeXml(order.contactEmail || '')}</customerEmail>
    <customerPhone>${escapeXml(order.contactPhone || '')}</customerPhone>
  </Transaction>
  <Services>${services}
  </Services>
</API3G>`;
}

async function postXml(xml, { fetchFn, timeoutMs = 15_000 } = {}) {
  const { apiUrl } = env();
  const response = await fetchWithTimeout(apiUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/xml' },
    body: xml,
  }, timeoutMs, fetchFn ?? fetch);
  const text = await response.text();
  if (!response.ok) {
    const error = new Error(`DPO request failed (${response.status})`);
    error.status = response.status;
    error.body = text.slice(0, 500);
    throw error;
  }
  return text;
}

// Creates the hosted-checkout transaction. Returns
// { ok, transToken, transRef, paymentUrl } or { ok:false, code, explanation }.
export async function createCheckout(order, options = {}) {
  const xml = buildCreateTokenXml(order, options);
  const responseXml = await postXml(xml, options);
  const code = xmlValue(responseXml, 'Result');
  if (code !== '000') {
    return { ok: false, code: code || 'no_result', explanation: xmlValue(responseXml, 'ResultExplanation') || '' };
  }
  const transToken = xmlValue(responseXml, 'TransToken');
  if (!transToken) return { ok: false, code: 'no_token', explanation: 'createToken returned no TransToken' };
  const { payUrl } = env();
  return {
    ok: true,
    transToken,
    transRef: xmlValue(responseXml, 'TransRef') || '',
    paymentUrl: `${payUrl}?ID=${encodeURIComponent(transToken)}`,
  };
}

// ---- verifyToken ------------------------------------------------------------

export function buildVerifyXml({ transToken, companyRef, verifyTransaction = 0 }) {
  const { companyToken } = env();
  const idElement = transToken
    ? `<TransactionToken>${escapeXml(transToken)}</TransactionToken>`
    : `<CompanyRef>${escapeXml(companyRef)}</CompanyRef>`;
  return `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>verifyToken</Request>
  ${idElement}
  <VerifyTransaction>${verifyTransaction ? 1 : 0}</VerifyTransaction>
</API3G>`;
}

// DPO verify result → internal payment-attempt status. Conservative on
// purpose: only '000' means paid; unfamiliar codes are 'unknown' so
// reconciliation retries instead of guessing.
export function mapVerifyCode(code) {
  switch (code) {
    case '000': return 'paid';
    case '900': return 'pending';
    case '901': return 'failed';        // declined
    case '902': return 'verification_failed'; // data mismatch
    case '903': return 'expired';       // PTL elapsed
    case '904': return 'failed';        // cancelled by customer
    default: return 'unknown';
  }
}

// Runs verifyToken and normalizes the response. `expected` carries the stored
// order values; any amount/currency disagreement downgrades a paid result to
// 'requires_review' per HANDOFF "Payment finalization" step 5.
export async function verifyPayment({ transToken, companyRef, expected, verifyTransaction = 0 }, options = {}) {
  const responseXml = await postXml(buildVerifyXml({ transToken, companyRef, verifyTransaction }), options);
  const code = xmlValue(responseXml, 'Result') || '';
  const status = mapVerifyCode(code);

  const reported = {
    code,
    explanation: xmlValue(responseXml, 'ResultExplanation') || '',
    companyRef: xmlValue(responseXml, 'CompanyRef') || '',
    currency: xmlValue(responseXml, 'TransactionCurrency') || '',
    amount: xmlValue(responseXml, 'TransactionAmount') || '',
    finalCurrency: xmlValue(responseXml, 'TransactionFinalCurrency') || '',
    finalAmount: xmlValue(responseXml, 'TransactionFinalAmount') || '',
    approval: xmlValue(responseXml, 'TransactionApproval') || '',
  };

  if (status !== 'paid') return { status, reported };

  // Paid — but only accept it when the reference and money line up exactly.
  if (expected?.reference && reported.companyRef && reported.companyRef !== expected.reference) {
    return { status: 'requires_review', reported, mismatch: 'company_ref' };
  }
  if (expected?.currency) {
    const reportedCurrency = reported.currency || reported.finalCurrency;
    if (reportedCurrency && reportedCurrency !== expected.currency) {
      return { status: 'requires_review', reported, mismatch: 'currency' };
    }
    const reportedMinor = amountStringToMinor(reported.amount || reported.finalAmount, expected.currency);
    if (reportedMinor === null || reportedMinor !== expected.totalMinor) {
      return { status: 'requires_review', reported, mismatch: 'amount' };
    }
  }
  return { status: 'paid', reported };
}

// Post-finalize acknowledgement (verifyToken with VerifyTransaction=1).
// Failure here must never touch commercial state — the caller records
// 'paid_acknowledgement_pending' and reconciliation retries.
export async function acknowledgePayment({ transToken, companyRef }, options = {}) {
  try {
    const responseXml = await postXml(buildVerifyXml({ transToken, companyRef, verifyTransaction: 1 }), options);
    return { ok: (xmlValue(responseXml, 'Result') || '') === '000' };
  } catch {
    return { ok: false };
  }
}
