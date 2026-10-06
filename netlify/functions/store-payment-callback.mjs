// /api/payments/dpo/callback — server-to-server notification endpoint.
// DPO's exact callback contract (method, payload, retries) must be confirmed
// during onboarding (HANDOFF checklist), so this accepts GET and POST,
// extracts the reference defensively from query/form/XML/JSON, dedupes the
// delivery, and treats it purely as a reconciliation trigger: the decision
// always comes from our own verifyToken call, never the pushed payload.

import { createHash } from 'node:crypto';
import { captureFunctionException } from './_sentry.mjs';
import { dpoEnabled, xmlValue } from './_dpo.mjs';
import { verifyAndSettle } from './_store_payments.mjs';
import {
  callStoreRpc,
  parseOrderReference,
  storeApiEnabled,
  storeJson,
} from './_store_shared.mjs';

const FUNCTION_NAME = 'store-payment-callback';
const MAX_BODY_BYTES = 20_000;

function referenceFrom(url, body) {
  const candidates = [
    url.searchParams.get('CompanyRef'),
    url.searchParams.get('companyref'),
    url.searchParams.get('reference'),
  ];
  if (body) {
    candidates.push(xmlValue(body, 'CompanyRef'));
    try {
      const json = JSON.parse(body);
      candidates.push(json?.CompanyRef, json?.reference);
    } catch {
      // not JSON — fine
    }
    const form = new URLSearchParams(body);
    candidates.push(form.get('CompanyRef'), form.get('reference'));
  }
  for (const candidate of candidates) {
    const parsed = parseOrderReference(String(candidate || ''));
    if (parsed) return parsed;
  }
  return null;
}

function providerTokenFrom(url, body) {
  const fromQuery = url.searchParams.get('TransactionToken') || url.searchParams.get('TransID') || '';
  if (fromQuery) return fromQuery.slice(0, 120);
  const fromXml = body ? xmlValue(body, 'TransactionToken') : null;
  return (fromXml || '').slice(0, 120) || null;
}

export default async (req) => {
  // Callbacks answer 200 even when disabled so the provider stops retrying
  // against an endpoint that will never act.
  if (!storeApiEnabled() || !dpoEnabled()) return storeJson({ ok: true, ignored: true });

  let body = '';
  if (req.method === 'POST') {
    body = (await req.text()).slice(0, MAX_BODY_BYTES);
  }
  const url = new URL(req.url);

  let reference = referenceFrom(url, body);
  try {
    if (!reference) {
      // Fall back to the transaction token we stored at creation time.
      const providerToken = providerTokenFrom(url, body);
      if (providerToken) {
        reference = parseOrderReference(
          String(await callStoreRpc('store_reference_for_provider_token', { p_provider_token: providerToken }) || ''),
        );
      }
    }
    if (!reference) return storeJson({ ok: true, ignored: true });

    // Dedupe replays of the same delivery; replays are harmless (settlement
    // is idempotent) but there is no reason to re-verify a byte-identical push.
    const eventKey = `dpo:${reference}:${createHash('sha256').update(`${url.search}|${body}`).digest('hex').slice(0, 32)}`;
    const recorded = await callStoreRpc('store_record_provider_event', {
      p_provider: 'dpo',
      p_event_key: eventKey,
      p_reference: reference,
      p_payload: { query: url.search.slice(0, 1000), body: body.slice(0, 2000) },
    });
    if (recorded?.new === false) return storeJson({ ok: true, duplicate: true });

    const result = await verifyAndSettle(reference);
    return storeJson({ ok: true, state: result.state });
  } catch (error) {
    await captureFunctionException(error, { functionName: FUNCTION_NAME, req, extra: { stage: 'callback' } });
    // Non-200 lets the provider retry later — settlement is idempotent.
    return storeJson({ ok: false }, 500);
  }
};

export const config = { path: '/api/payments/dpo/callback' };
