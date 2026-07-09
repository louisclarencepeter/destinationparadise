// Shared helpers for the Resend-backed send functions and the planner proxy.
// Underscore-prefixed so Netlify's function scanner ignores it (it is NOT a
// deployed function, just a library imported by the real functions).

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
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

export function normalizeLanguage(value) {
  const lang = String(value || '').slice(0, 2).toLowerCase();
  return ['de', 'pl'].includes(lang) ? lang : 'en';
}

export const sanitizeHeaderLine = (value, max = 400) =>
  trimField(value, max).replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ');

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
export function fetchWithTimeout(url, options = {}, timeoutMs = 10_000, fetchFn = fetch) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  return fetchFn(url, { ...options, signal });
}

function hostnameFromSource(value) {
  if (!value) return null;

  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function requestSourceAllowed(req, allowedHostnames = [], allowedHostnameSuffixes = []) {
  const sources = [
    req.headers.get('origin'),
    req.headers.get('referer'),
  ].filter(Boolean);

  if (sources.length === 0) return { ok: false, reason: 'missing-source' };

  const allowed = new Set(allowedHostnames.map((host) => String(host || '').toLowerCase()).filter(Boolean));
  const suffixes = allowedHostnameSuffixes.map((suffix) => String(suffix || '').toLowerCase()).filter(Boolean);

  for (const source of sources) {
    const hostname = hostnameFromSource(source);
    if (!hostname) continue;
    if (allowed.has(hostname) || suffixes.some((suffix) => hostname.endsWith(suffix))) {
      return { ok: true, hostname };
    }
  }

  return { ok: false, reason: 'disallowed-source' };
}

export function validateSubmissionTiming(startedAt, now = Date.now(), {
  minElapsedMs = 3_000,
  maxElapsedMs = 2 * 60 * 60_000,
} = {}) {
  const started = Number(startedAt);
  if (!Number.isFinite(started) || started <= 0) return { ok: false, reason: 'missing-started-at' };

  const elapsed = now - started;
  if (elapsed < minElapsedMs) return { ok: false, reason: 'too-fast' };
  if (elapsed > maxElapsedMs) return { ok: false, reason: 'stale-form' };

  return { ok: true, elapsed };
}

function signHumanChallenge(payload, secretKey) {
  return createHmac('sha256', String(secretKey || 'destination-paradise-booking-challenge'))
    .update(payload)
    .digest('base64url');
}

function timingSafeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createHumanChallenge({
  secretKey,
  now = Date.now(),
  ttlMs = 10 * 60_000,
  randomBytesFn = randomBytes,
} = {}) {
  const seed = randomBytesFn(14);
  const left = 2 + (seed[0] % 8);
  const right = 3 + (seed[1] % 7);
  const expiresAt = now + ttlMs;
  const nonce = Buffer.from(seed.subarray(2)).toString('base64url');
  const payload = `${left}:${right}:${expiresAt}:${nonce}`;

  return {
    question: `${left} + ${right}`,
    token: `${payload}:${signHumanChallenge(payload, secretKey)}`,
    expiresAt,
  };
}

export function validateHumanChallenge({
  answer,
  token,
  secretKey,
  now = Date.now(),
} = {}) {
  const response = trimField(answer, 20);
  const tokenText = trimField(token, 600);
  if (!response || !tokenText) return { ok: false, reason: 'missing-challenge' };

  const parts = tokenText.split(':');
  if (parts.length !== 5) return { ok: false, reason: 'malformed-token' };

  const [leftRaw, rightRaw, expiresAtRaw, nonce, signature] = parts;
  const left = Number(leftRaw);
  const right = Number(rightRaw);
  const expiresAt = Number(expiresAtRaw);
  if (
    !Number.isInteger(left) ||
    !Number.isInteger(right) ||
    !Number.isFinite(expiresAt) ||
    !nonce ||
    !signature
  ) {
    return { ok: false, reason: 'malformed-token' };
  }

  if (now > expiresAt) return { ok: false, reason: 'expired-token' };

  const payload = `${left}:${right}:${expiresAt}:${nonce}`;
  const expectedSignature = signHumanChallenge(payload, secretKey);
  if (!timingSafeStringEqual(signature, expectedSignature)) {
    return { ok: false, reason: 'signature-mismatch' };
  }

  if (Number(response) !== left + right) {
    return { ok: false, reason: 'wrong-answer' };
  }

  return { ok: true };
}

export function createResendSender(apiKey, timeoutMs = 10_000) {
  return (payload) =>
    fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }, timeoutMs);
}

const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_TEST_SECRET_KEYS = new Set([
  '1x0000000000000000000000000000000AA',
  '2x0000000000000000000000000000000AA',
  '3x0000000000000000000000000000000AA',
]);

export async function verifyTurnstileToken({
  token,
  secretKey,
  remoteIp,
  expectedAction,
  expectedHostnames = [],
  expectedHostnameSuffixes = [],
  fetchFn = fetch,
  timeoutMs = 5_000,
} = {}) {
  const responseToken = trimField(token, 2048);
  const secret = trimField(secretKey, 200);
  if (!secret) return { ok: false, reason: 'missing-secret' };
  if (!responseToken) return { ok: false, reason: 'missing-token' };

  const body = {
    secret,
    response: responseToken,
  };
  if (remoteIp && remoteIp !== 'unknown') body.remoteip = remoteIp;

  let siteverifyResponse;
  try {
    siteverifyResponse = await fetchWithTimeout(TURNSTILE_SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }, timeoutMs, fetchFn);
  } catch {
    return { ok: false, reason: 'siteverify-unreachable' };
  }

  let result;
  try {
    result = await siteverifyResponse.json();
  } catch {
    return { ok: false, reason: 'siteverify-invalid-json' };
  }

  if (!siteverifyResponse.ok || !result?.success) {
    return { ok: false, reason: 'turnstile-failed', result };
  }

  // Cloudflare's dummy test keys return canned action/hostname values. Keep the
  // stricter production checks below for real keys only.
  if (!TURNSTILE_TEST_SECRET_KEYS.has(secret)) {
    if (expectedAction && result.action && result.action !== expectedAction) {
      return { ok: false, reason: 'action-mismatch', result };
    }

    const expected = new Set(expectedHostnames.map((host) => String(host || '').toLowerCase()).filter(Boolean));
    const suffixes = expectedHostnameSuffixes.map((suffix) => String(suffix || '').toLowerCase()).filter(Boolean);
    const hostname = String(result.hostname || '').toLowerCase();
    if (
      hostname &&
      expected.size > 0 &&
      !expected.has(hostname) &&
      !suffixes.some((suffix) => hostname.endsWith(suffix))
    ) {
      return { ok: false, reason: 'hostname-mismatch', result };
    }
  }

  return { ok: true, result };
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
