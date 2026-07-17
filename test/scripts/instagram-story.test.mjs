import { describe, expect, it } from 'vitest';

import {
  alreadyPublishedToday,
  chooseStoryCard,
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

describe('Instagram Story editorial queue', () => {
  const cards = [
    { id: 'first', source: '/assets/images/excursions/first.webp' },
    { id: 'second', source: '/assets/images/excursions/second.webp' },
  ];

  it('uses the first unused approved card rather than a random image', () => {
    expect(chooseStoryCard(cards, { cycle: 1, usedCards: ['first'] }).selected.id).toBe('second');
  });

  it('respects legacy used image paths during the transition', () => {
    expect(chooseStoryCard(cards, { cycle: 1, used: [cards[0].source] }).selected.id).toBe('second');
  });

  it('begins a new cycle only after every approved card is used', () => {
    const result = chooseStoryCard(cards, { cycle: 1, usedCards: ['first', 'second'] });
    expect(result.selected.id).toBe('first');
    expect(result.nextState).toEqual({ cycle: 2, usedCards: ['first'] });
  });
});
