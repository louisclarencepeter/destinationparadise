import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { INSTAGRAM_STORY_CARDS } from '../../data/instagramStoryCards.mjs';
import {
  alreadyPublishedToday,
  chooseStoryCard,
  isStoryMediaError,
  partitionPublishableCards,
  StoryMediaError,
  storyDateKey,
  verifyImage,
} from '../../scripts/instagram-story.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

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

describe('Instagram Story media validation', () => {
  const photoCard = { id: 'photo', source: '/assets/images/excursions/photo.webp' };

  it('keeps approved photo sources publishable', () => {
    const { publishable, rejected } = partitionPublishableCards([photoCard]);
    expect(publishable).toEqual([photoCard]);
    expect(rejected).toEqual([]);
  });

  it('rejects non-photo media so one bad asset cannot reach the publish API', () => {
    const { publishable, rejected } = partitionPublishableCards([
      photoCard,
      { id: 'reel', source: '/assets/images/excursions/promo-reel.mp4' },
      { id: 'doc', source: '/assets/images/excursions/itinerary.pdf' },
      { id: 'broken', source: undefined },
    ]);
    expect(publishable).toEqual([photoCard]);
    expect(rejected.map((entry) => entry.card.id)).toEqual(['reel', 'doc', 'broken']);
    expect(rejected.every((entry) => entry.reason === 'unsupported-media-source')).toBe(true);
  });

  it('rejects sources outside the published image directories', () => {
    const { publishable } = partitionPublishableCards([
      { id: 'escape', source: '/assets/images/excursions/../../secret.webp' },
      { id: 'elsewhere', source: '/assets/videos/clip.webp' },
    ]);
    expect(publishable).toEqual([]);
  });

  it('raises a skippable media error when the Story image is not a JPEG', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      headers: { 'content-type': 'text/html' },
      status: 200,
    })));
    const error = await verifyImage('https://example.com/story', photoCard).catch((raised) => raised);
    expect(error).toBeInstanceOf(StoryMediaError);
    expect(isStoryMediaError(error)).toBe(true);
    expect(error.source).toBe(photoCard.source);
  });

  it('raises a skippable media error when the Story image is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })));
    const error = await verifyImage('https://example.com/story', photoCard).catch((raised) => raised);
    expect(error).toBeInstanceOf(StoryMediaError);
    expect(error.cardId).toBe(photoCard.id);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
});

describe('Meta media rejection classification', () => {
  it('treats the code 9004 media-type rejection as a bad asset, not a fatal run', () => {
    const error = new Error('Only photo or video can be accepted as media type.');
    error.code = 9004;
    error.subcode = 2207052;
    expect(isStoryMediaError(error)).toBe(true);
  });

  it('recognises the rejection by subcode or message alone', () => {
    const bySubcode = new Error('The Graph API rejected the upload.');
    bySubcode.subcode = 2207052;
    expect(isStoryMediaError(bySubcode)).toBe(true);
    expect(isStoryMediaError(new Error('Only photo or video can be accepted as media type.'))).toBe(true);
  });

  it('leaves transient and auth failures fatal so they still fail the run', () => {
    const rateLimited = new Error('Application request limit reached');
    rateLimited.code = 4;
    expect(isStoryMediaError(rateLimited)).toBe(false);
    const badToken = new Error('Invalid OAuth access token.');
    badToken.code = 190;
    expect(isStoryMediaError(badToken)).toBe(false);
    expect(isStoryMediaError(new Error('GET request failed after 3 attempts: fetch failed.'))).toBe(false);
  });
});

describe('Approved Story queue audit', () => {
  it('contains only publishable photo sources', () => {
    const { rejected } = partitionPublishableCards(INSTAGRAM_STORY_CARDS);
    expect(rejected.map((entry) => entry.card.id)).toEqual([]);
  });

  it('gives every card a unique id', () => {
    const ids = INSTAGRAM_STORY_CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('points every card at an image file that exists', () => {
    const missing = INSTAGRAM_STORY_CARDS
      .filter((card) => !existsSync(path.join(ROOT, 'public', card.source)))
      .map((card) => card.source);
    expect(missing).toEqual([]);
  });
});
