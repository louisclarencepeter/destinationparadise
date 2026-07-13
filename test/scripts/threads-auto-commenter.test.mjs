import { describe, expect, it } from 'vitest';

import {
  buildReply,
  classifyCandidate,
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
