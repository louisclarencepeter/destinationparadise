import { describe, expect, it } from 'vitest';

import {
  alreadyPublishedToday,
  storyDateKey,
} from '../../scripts/instagram-story.mjs';

describe('Instagram Story daily publishing guard', () => {
  it('uses the Zanzibar calendar date', () => {
    expect(storyDateKey('2026-07-12T21:30:00.000Z')).toBe('2026-07-13');
  });

  it('skips another publish on the same Zanzibar day', () => {
    expect(alreadyPublishedToday(
      { lastPublishedAt: '2026-07-12T06:00:00.000Z' },
      new Date('2026-07-12T20:59:59.000Z'),
    )).toBe(true);
  });

  it('allows the next Zanzibar day', () => {
    expect(alreadyPublishedToday(
      { lastPublishedAt: '2026-07-12T20:59:59.000Z' },
      new Date('2026-07-12T21:00:00.000Z'),
    )).toBe(false);
  });

  it('does not skip when the state has no valid publication timestamp', () => {
    expect(alreadyPublishedToday({})).toBe(false);
    expect(alreadyPublishedToday({ lastPublishedAt: 'invalid' })).toBe(false);
  });
});
