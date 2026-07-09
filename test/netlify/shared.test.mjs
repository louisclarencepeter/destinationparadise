import { describe, expect, it } from 'vitest';
import {
  createRateLimiter,
  normalizeEmailAddress,
  rateLimitKey,
  requestSourceAllowed,
  validateSubmissionTiming,
  verifyTurnstileToken,
} from '../../netlify/functions/_shared.mjs';

function reqWith(headers) {
  return { headers: { get: (name) => headers[name.toLowerCase()] ?? null } };
}

describe('rateLimitKey', () => {
  it('prefers the trustworthy Netlify client-IP header', () => {
    const req = reqWith({
      'x-nf-client-connection-ip': '203.0.113.7',
      'x-forwarded-for': '1.1.1.1, 2.2.2.2',
    });
    expect(rateLimitKey(req)).toBe('203.0.113.7');
  });

  it('falls back to the LAST X-Forwarded-For value (the real client IP)', () => {
    const req = reqWith({ 'x-forwarded-for': 'spoofed, 9.9.9.9' });
    expect(rateLimitKey(req)).toBe('9.9.9.9');
  });

  it('returns "unknown" when no IP headers are present', () => {
    expect(rateLimitKey(reqWith({}))).toBe('unknown');
  });
});

describe('createRateLimiter', () => {
  it('allows up to max requests then returns a retryAfter', () => {
    const check = createRateLimiter({ windowMs: 60_000, max: 3 });
    expect(check('a').ok).toBe(true);
    expect(check('a').ok).toBe(true);
    expect(check('a').ok).toBe(true);
    const blocked = check('a');
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('tracks separate keys independently', () => {
    const check = createRateLimiter({ windowMs: 60_000, max: 1 });
    expect(check('a').ok).toBe(true);
    expect(check('b').ok).toBe(true);
    expect(check('a').ok).toBe(false);
  });
});

describe('requestSourceAllowed', () => {
  it('allows requests from configured origins', () => {
    const req = reqWith({ origin: 'https://yournexttriptoparadise.com' });

    expect(requestSourceAllowed(req, ['yournexttriptoparadise.com']).ok).toBe(true);
  });

  it('allows configured Netlify preview suffixes', () => {
    const req = reqWith({ referer: 'https://deploy-preview-12--destinationparadisezanzibar.netlify.app/book-now' });

    expect(requestSourceAllowed(req, [], ['--destinationparadisezanzibar.netlify.app']).ok).toBe(true);
  });

  it('blocks requests without origin or referer context', () => {
    expect(requestSourceAllowed(reqWith({}), ['yournexttriptoparadise.com'])).toMatchObject({
      ok: false,
      reason: 'missing-source',
    });
  });
});

describe('validateSubmissionTiming', () => {
  it('accepts submissions inside the elapsed window', () => {
    expect(validateSubmissionTiming(1_000, 5_000, { minElapsedMs: 3_000, maxElapsedMs: 10_000 }).ok).toBe(true);
  });

  it('rejects submissions that are too fast', () => {
    expect(validateSubmissionTiming(4_000, 5_000, { minElapsedMs: 3_000 })).toMatchObject({
      ok: false,
      reason: 'too-fast',
    });
  });

  it('rejects stale or missing timestamps', () => {
    expect(validateSubmissionTiming('', 5_000)).toMatchObject({ ok: false, reason: 'missing-started-at' });
    expect(validateSubmissionTiming(1_000, 20_000, { maxElapsedMs: 10_000 })).toMatchObject({
      ok: false,
      reason: 'stale-form',
    });
  });
});

describe('verifyTurnstileToken', () => {
  it('accepts successful Siteverify responses', async () => {
    const fetchFn = async () => Response.json({
      success: true,
      action: 'booking_request',
      hostname: 'yournexttriptoparadise.com',
    });

    await expect(verifyTurnstileToken({
      token: 'token',
      secretKey: 'real-secret',
      expectedAction: 'booking_request',
      expectedHostnames: ['yournexttriptoparadise.com'],
      fetchFn,
    })).resolves.toMatchObject({ ok: true });
  });

  it('rejects failed Siteverify responses', async () => {
    const fetchFn = async () => Response.json({
      success: false,
      'error-codes': ['invalid-input-response'],
    });

    await expect(verifyTurnstileToken({
      token: 'bad-token',
      secretKey: 'real-secret',
      fetchFn,
    })).resolves.toMatchObject({ ok: false, reason: 'turnstile-failed' });
  });

  it('checks action and hostname for real secret keys', async () => {
    const fetchFn = async () => Response.json({
      success: true,
      action: 'other_action',
      hostname: 'evil.example',
    });

    await expect(verifyTurnstileToken({
      token: 'token',
      secretKey: 'real-secret',
      expectedAction: 'booking_request',
      expectedHostnames: ['yournexttriptoparadise.com'],
      fetchFn,
    })).resolves.toMatchObject({ ok: false, reason: 'action-mismatch' });
  });
});

describe('normalizeEmailAddress', () => {
  it('rejects malformed addresses', () => {
    expect(normalizeEmailAddress('not-an-email')).toBeNull();
    expect(normalizeEmailAddress('a@b')).toBeNull();
    expect(normalizeEmailAddress('a..b@example.com')).toBeNull();
  });

  it('normalizes the domain to lower case', () => {
    expect(normalizeEmailAddress('Guest@Example.COM')).toMatchObject({
      email: 'Guest@example.com',
      domain: 'example.com',
    });
  });
});
