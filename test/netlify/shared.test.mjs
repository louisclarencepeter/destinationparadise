import { describe, expect, it } from 'vitest';
import {
  createRateLimiter,
  normalizeEmailAddress,
  rateLimitKey,
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
