import { describe, expect, it, vi } from 'vitest';
import bookingSend, { validateEmailAddress } from '../../netlify/functions/booking-send.mjs';

function dnsError(code) {
  return Object.assign(new Error(code), { code });
}

function bookingRequest(body, headers = {}) {
  return new Request('https://yournexttriptoparadise.com/api/booking-send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://yournexttriptoparadise.com',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('booking anti-spam guards', () => {
  it('rejects direct posts without a trusted source header', async () => {
    const res = await bookingSend(bookingRequest({}, { origin: '' }));

    expect(res.status).toBe(403);
  });

  it('rejects booking posts that did not come through a fresh form render', async () => {
    const res = await bookingSend(bookingRequest({
      name: 'Guest',
      email: 'guest@example.com',
    }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/refresh the booking form/i);
  });

  it('silently drops filled honeypot submissions before sending mail', async () => {
    const res = await bookingSend(bookingRequest({
      botField: 'https://spam.example',
      name: 'Guest',
      email: 'guest@example.com',
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('rejects fresh timed booking posts without a completed verification', async () => {
    const res = await bookingSend(bookingRequest({
      name: 'Guest',
      email: 'guest@example.com',
      serviceType: 'retreat',
      product: 'Flexible — retreat',
      formStartedAt: Date.now() - 5_000,
    }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/verification/i);
  });
});

describe('booking email validation', () => {
  it('rejects malformed email addresses before DNS checks', async () => {
    const resolver = {
      resolveMx: vi.fn(),
      resolve4: vi.fn(),
      resolve6: vi.fn(),
    };

    const result = await validateEmailAddress('not-an-email', resolver);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(resolver.resolveMx).not.toHaveBeenCalled();
  });

  it('rejects syntactically valid addresses whose domain does not resolve', async () => {
    const resolver = {
      resolveMx: vi.fn().mockRejectedValue(dnsError('ENOTFOUND')),
      resolve4: vi.fn().mockRejectedValue(dnsError('ENOTFOUND')),
      resolve6: vi.fn().mockRejectedValue(dnsError('ENOTFOUND')),
    };

    const result = await validateEmailAddress('sbshs@hshs.dhdhs', resolver);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toMatch(/domain does not appear to receive mail/i);
  });

  it('accepts domains with MX records', async () => {
    const resolver = {
      resolveMx: vi.fn().mockResolvedValue([{ priority: 10, exchange: 'mail.example.com' }]),
      resolve4: vi.fn(),
      resolve6: vi.fn(),
    };

    const result = await validateEmailAddress('guest@example.com', resolver);

    expect(result).toMatchObject({ ok: true, email: 'guest@example.com', domain: 'example.com' });
    expect(resolver.resolve4).not.toHaveBeenCalled();
    expect(resolver.resolve6).not.toHaveBeenCalled();
  });

  it('accepts domains with no MX record but an address record fallback', async () => {
    const resolver = {
      resolveMx: vi.fn().mockRejectedValue(dnsError('ENODATA')),
      resolve4: vi.fn().mockResolvedValue(['203.0.113.10']),
      resolve6: vi.fn().mockRejectedValue(dnsError('ENODATA')),
    };

    const result = await validateEmailAddress('guest@fallback-mail.example', resolver);

    expect(result.ok).toBe(true);
    expect(result.domain).toBe('fallback-mail.example');
  });

  it('treats temporary DNS failures as retryable verification failures', async () => {
    const resolver = {
      resolveMx: vi.fn().mockRejectedValue(dnsError('EAI_AGAIN')),
      resolve4: vi.fn().mockRejectedValue(dnsError('EAI_AGAIN')),
      resolve6: vi.fn().mockRejectedValue(dnsError('EAI_AGAIN')),
    };

    const result = await validateEmailAddress('guest@temporarily-unreachable.example', resolver);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
    expect(result.message).toMatch(/could not verify/i);
  });

  it('rejects null MX domains that explicitly refuse email', async () => {
    const resolver = {
      resolveMx: vi.fn().mockResolvedValue([{ priority: 0, exchange: '.' }]),
      resolve4: vi.fn(),
      resolve6: vi.fn(),
    };

    const result = await validateEmailAddress('guest@null-mx.example', resolver);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(resolver.resolve4).not.toHaveBeenCalled();
  });
});
