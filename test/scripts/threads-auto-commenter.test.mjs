import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  apiRequest,
  buildReply,
  classifyCandidate,
  isTransientApiError,
  zanzibarDateKey,
} from '../../scripts/threads-auto-commenter.mjs';

const NOW = new Date('2026-07-13T10:00:00.000Z');

function post(text, overrides = {}) {
  return {
    id: 'post-123',
    text,
    timestamp: '2026-07-13T09:00:00.000Z',
    permalink: 'https://www.threads.net/@traveler/post/example',
    ...overrides,
  };
}

describe('Threads candidate safety filter', () => {
  it('accepts a fresh, specific Zanzibar travel question', () => {
    const candidate = classifyCandidate(
      post('Where should we stay in Zanzibar: Nungwi or Paje? We care most about swimming.'),
      NOW,
    );
    expect(candidate).toMatchObject({ category: 'stay', id: 'post-123' });
  });

  it.each([
    'Our Zanzibar tour package is 20% off. Book now and DM me!',
    'Terrible Zanzibar hotel, how can I get a refund?',
    'What are the Tanzania visa and yellow fever vaccine requirements?',
    'Breaking news: Tanzania election results and government reaction',
    'Zanzibar is beautiful today',
  ])('rejects unsafe or ambiguous content: %s', (text) => {
    expect(classifyCandidate(post(text), NOW)).toBeNull();
  });

  it('rejects quotes, replies, stale posts, and missing destinations', () => {
    expect(classifyCandidate(post('Any advice for Zanzibar?', { is_quote_post: true }), NOW)).toBeNull();
    expect(classifyCandidate(post('Any advice for Zanzibar?', { is_reply: true }), NOW)).toBeNull();
    expect(classifyCandidate(post('Any advice for Zanzibar?', { timestamp: '2026-07-10T09:00:00Z' }), NOW)).toBeNull();
    expect(classifyCandidate(post('Any advice for our beach holiday?'), NOW)).toBeNull();
  });
});

describe('Threads contextual reply builder', () => {
  it('gives specific coast advice without a promotional link', () => {
    const candidate = classifyCandidate(
      post('Where should we stay in Zanzibar: Nungwi or Paje? We care most about swimming.'),
      NOW,
    );
    const reply = buildReply(candidate);
    expect(reply).toMatch(/Nungwi|Kendwa/);
    expect(reply).toMatch(/Paje|Jambiani/);
    expect(reply).not.toContain('https://');
    expect(reply.length).toBeLessThanOrEqual(500);
  });

  it('uses the stated trip length and a useful deep link', () => {
    const itinerary = classifyCandidate(post('How should we plan a 7 day Zanzibar itinerary?'), NOW);
    const safari = classifyCandidate(post('Can anyone recommend a short Tanzania safari from Zanzibar?'), NOW);
    expect(buildReply(itinerary)).toContain('With 7 days');
    expect(buildReply(safari)).toContain('https://yournexttriptoparadise.com/safaris');
  });

  it('varies replies deterministically across post IDs', () => {
    const first = classifyCandidate(post('Where should we stay in Zanzibar, Nungwi or Paje?'), NOW);
    const second = classifyCandidate(post('Where should we stay in Zanzibar, Nungwi or Paje?', { id: 'post-456' }), NOW);
    expect(buildReply(first)).not.toBe(buildReply(second));
    expect(buildReply(first)).toBe(buildReply(first));
  });
});

describe('Threads daily cap date', () => {
  it('uses the Zanzibar calendar day', () => {
    expect(zanzibarDateKey('2026-07-12T21:30:00.000Z')).toBe('2026-07-13');
  });
});

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

describe('Threads API transient error classification', () => {
  it('treats retryable statuses and the Meta token-parse flake as transient', () => {
    expect(isTransientApiError({ httpStatus: 500, code: 10 })).toBe(true);
    expect(isTransientApiError({ httpStatus: 401, code: 190 })).toBe(true);
    for (const httpStatus of [408, 429, 502, 503, 504]) {
      expect(isTransientApiError({ httpStatus })).toBe(true);
    }
  });

  it('does not treat other auth or client errors as transient', () => {
    expect(isTransientApiError({ httpStatus: 401, code: 104 })).toBe(false);
    expect(isTransientApiError({ httpStatus: 403, code: 10 })).toBe(false);
    expect(isTransientApiError({ httpStatus: 400, code: 100 })).toBe(false);
  });
});

describe('Threads API safe retries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('retries a GET through the transient failures seen in production', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, {
        error: { message: 'Invalid OAuth access token - Cannot parse access token', code: 190 },
      }))
      .mockResolvedValueOnce(jsonResponse(500, {
        error: { message: 'Application does not have permission for this action', code: 10 },
      }))
      .mockResolvedValueOnce(jsonResponse(200, { id: '123', username: 'yournexttriptoparadise' }));
    vi.stubGlobal('fetch', fetchMock);

    const promise = apiRequest('token', 'me', { params: { fields: 'id,username' } });
    await vi.advanceTimersByTimeAsync(3_000);
    await expect(promise).resolves.toMatchObject({ id: '123' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('gives up after the retry budget and surfaces the API error', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(500, {
      error: { message: 'Application does not have permission for this action', code: 10 },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const promise = apiRequest('token', 'me', {});
    const assertion = expect(promise).rejects.toMatchObject({ httpStatus: 500, code: 10 });
    await vi.advanceTimersByTimeAsync(3_000);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('fails a GET immediately on a non-transient error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(400, {
      error: { message: 'Unsupported request.', code: 100 },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('token', 'me', {})).rejects.toMatchObject({ httpStatus: 400, code: 100 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never retries a POST and keeps its uncertain marker', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(500, {
      error: { message: 'Application does not have permission for this action', code: 10 },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('token', 'me/threads_publish', { method: 'POST', body: { creation_id: '1' } }))
      .rejects.toMatchObject({ httpStatus: 500, uncertain: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
