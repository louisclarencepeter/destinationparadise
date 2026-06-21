// Shared helpers for the Resend-backed send functions and the planner proxy.
// Underscore-prefixed so Netlify's function scanner ignores it (it is NOT a
// deployed function, just a library imported by the real functions).

import { resolve4, resolve6, resolveMx } from 'node:dns/promises';
import { domainToASCII } from 'node:url';

// ---- HTML / field helpers ----
export const escapeHtml = (text) =>
  String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const trimField = (value, max = 400) => String(value || '').trim().slice(0, max);

export const errorResponse = (message, status = 400) =>
  Response.json({ ok: false, error: message }, { status });

// ---- Rate limiting ----
// Prefer Netlify's trustworthy client-IP header. Only fall back to X-Forwarded-For,
// and take the LAST value (Netlify appends the real client IP) so a client cannot
// mint a fresh bucket by prepending an arbitrary value.
export function rateLimitKey(req) {
  const nf = req.headers.get('x-nf-client-connection-ip');
  if (nf) return nf.trim();
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.at(-1) || 'unknown';
}

// In-memory limiter. Best-effort in serverless: resets on cold start and is not
// shared across concurrent instances, so it throttles single-IP bursts rather
// than enforcing a hard quota. Pair money-sensitive endpoints with a provider
// spend cap. Each call returns its own isolated bucket map.
export function createRateLimiter({ windowMs, max }) {
  const buckets = new Map();
  return function check(key) {
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || now - bucket.start > windowMs) {
      buckets.set(key, { start: now, count: 1 });
      return { ok: true };
    }
    if (bucket.count >= max) {
      return { ok: false, retryAfter: Math.max(1, Math.ceil((windowMs - (now - bucket.start)) / 1000)) };
    }
    bucket.count += 1;
    return { ok: true };
  };
}

// ---- Resend ----
export function createResendSender(apiKey) {
  return (payload) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
}

// ---- Email validation (syntax + DNS deliverability) ----
// Uses the broad RFC-ish local-part pattern so it never rejects a deliverable
// address that any single form would have accepted.
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const EMAIL_SYNTAX_MESSAGE = 'That email does not look right. Could you double-check it?';
const EMAIL_DOMAIN_MESSAGE =
  'That email domain does not appear to receive mail. Please check for typos or use another address.';
const EMAIL_DOMAIN_VERIFY_MESSAGE =
  'We could not verify that email domain just now. Please try again in a moment or use another address.';
const EMAIL_DOMAIN_CACHE_TTL_MS = 30 * 60_000;
const PERMANENT_DNS_CODES = new Set(['ENODATA', 'ENOTFOUND', 'ENONAME', 'ENODOMAIN', 'ENOENT', 'NOTFOUND']);
const TEMPORARY_DNS_CODES = new Set(['EAI_AGAIN', 'ETIMEOUT', 'ESERVFAIL', 'SERVFAIL', 'ECONNREFUSED']);
const emailDomainCache = new Map();

export const defaultDnsResolver = { resolveMx, resolve4, resolve6 };

function isValidDnsLabel(label) {
  return label.length > 0 && label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label);
}

export function normalizeEmailAddress(email) {
  if (!EMAIL_REGEX.test(email) || email.length > 254) return null;

  const atIndex = email.lastIndexOf('@');
  const local = email.slice(0, atIndex);
  const domain = domainToASCII(email.slice(atIndex + 1).toLowerCase());
  const labels = domain.split('.');
  const tld = labels.at(-1);

  if (
    !local ||
    local.length > 64 ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    local.includes('..') ||
    !domain ||
    domain.length > 253 ||
    labels.length < 2 ||
    labels.some((label) => !isValidDnsLabel(label)) ||
    !/^[a-z]{2,63}$/i.test(tld)
  ) {
    return null;
  }

  return { email: `${local}@${domain}`, domain };
}

function dnsCode(err) {
  return err?.code || err?.cause?.code || '';
}

function isPermanentDnsError(err) {
  return PERMANENT_DNS_CODES.has(dnsCode(err));
}

function isTemporaryDnsError(err) {
  return TEMPORARY_DNS_CODES.has(dnsCode(err));
}

async function lookupRecords(lookup) {
  try {
    const records = await lookup();
    return { records: Array.isArray(records) ? records : [] };
  } catch (err) {
    return { error: err };
  }
}

async function domainAcceptsMail(domain, resolver = defaultDnsResolver) {
  const cached = emailDomainCache.get(domain);
  if (cached && Date.now() - cached.createdAt < EMAIL_DOMAIN_CACHE_TTL_MS) return cached.result;

  const mx = await lookupRecords(() => resolver.resolveMx(domain));
  const mxRecords = mx.records || [];
  if (mxRecords.some((record) => record.exchange && record.exchange !== '.')) {
    const result = { ok: true };
    emailDomainCache.set(domain, { result, createdAt: Date.now() });
    return result;
  }
  if (mxRecords.some((record) => record.exchange === '.')) {
    const result = { ok: false, status: 400, message: EMAIL_DOMAIN_MESSAGE };
    emailDomainCache.set(domain, { result, createdAt: Date.now() });
    return result;
  }

  const [a, aaaa] = await Promise.all([
    lookupRecords(() => resolver.resolve4(domain)),
    lookupRecords(() => resolver.resolve6(domain)),
  ]);

  if ((a.records || []).length > 0 || (aaaa.records || []).length > 0) {
    const result = { ok: true };
    emailDomainCache.set(domain, { result, createdAt: Date.now() });
    return result;
  }

  const errors = [mx.error, a.error, aaaa.error].filter(Boolean);
  if (errors.some(isTemporaryDnsError) && !errors.every(isPermanentDnsError)) {
    return { ok: false, status: 503, message: EMAIL_DOMAIN_VERIFY_MESSAGE };
  }

  const result = { ok: false, status: 400, message: EMAIL_DOMAIN_MESSAGE };
  emailDomainCache.set(domain, { result, createdAt: Date.now() });
  return result;
}

export async function validateEmailAddress(email, resolver = defaultDnsResolver) {
  const normalized = normalizeEmailAddress(email);
  if (!normalized) return { ok: false, status: 400, message: EMAIL_SYNTAX_MESSAGE };

  const domainResult = await domainAcceptsMail(normalized.domain, resolver);
  if (!domainResult.ok) return domainResult;

  return { ok: true, email: normalized.email, domain: normalized.domain };
}
