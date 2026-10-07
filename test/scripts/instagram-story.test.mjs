import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { INSTAGRAM_STORY_CARDS } from '../../data/instagramStoryCards.mjs';
import {
  alreadyPublishedToday,
  chooseStoryCard,
  INVALID_TOKEN_EXIT_CODE,
  isInvalidTokenError,
  isStoryMediaError,
  migrateStoryState,
  parseStoryPublicationLog,
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
    expect(result.nextState).toEqual({
      version: 2,
      cycle: 2,
      usedCards: ['first'],
      usedSources: [cards[0].source],
    });
  });

  it('persists legacy image paths as card ids instead of forgetting them', () => {
    const result = chooseStoryCard(cards, { cycle: 1, used: [cards[0].source] });
    expect(result.nextState).toEqual({
      version: 2,
      cycle: 1,
      usedCards: ['first', 'second'],
      usedSources: cards.map((card) => card.source),
    });
  });

  it('keeps the complete history when a failed card is excluded for one run', () => {
    const extendedCards = [
      ...cards,
      { id: 'third', source: '/assets/images/excursions/third.webp' },
    ];
    const result = chooseStoryCard(
      extendedCards,
      { version: 2, cycle: 1, usedCards: ['first'] },
      { excludedIds: ['second'] },
    );
    expect(result.selected.id).toBe('third');
    expect(result.nextState.usedCards).toEqual(['first', 'third']);
  });

  it('does not reset the cycle when all remaining unused cards fail validation', () => {
    expect(() => chooseStoryCard(
      cards,
      { version: 2, cycle: 1, usedCards: ['first'] },
      { excludedIds: ['second'] },
    )).toThrow('Every unused Story card failed media validation: second.');
  });

  it('uses every card once before starting the next cycle', () => {
    let state = { version: 2, cycle: 1, usedCards: [], usedSources: [] };
    const selected = [];
    for (let index = 0; index < cards.length; index += 1) {
      const result = chooseStoryCard(cards, state);
      selected.push(result.selected.id);
      state = result.nextState;
    }
    expect(selected).toEqual(['first', 'second']);
    expect(chooseStoryCard(cards, state).selected.id).toBe('first');
  });
});

describe('Instagram Story history migration', () => {
  const cards = [
    { id: 'first', source: '/assets/images/excursions/first.webp' },
    { id: 'second', source: '/assets/images/excursions/second.webp' },
    { id: 'third', source: '/assets/images/excursions/third.webp' },
  ];

  it('merges legacy state, successful log entries, and the known history seed', () => {
    const migrated = migrateStoryState(
      cards,
      { cycle: 3, used: [cards[0].source] },
      [
        { publishedAt: '2026-07-20T07:00:00.000Z', selected: cards[1].source },
        { failedAt: '2026-07-21T07:00:00.000Z', cardId: 'third' },
      ],
      ['third'],
    );
    expect(migrated).toEqual({
      version: 2,
      cycle: 3,
      usedCards: ['first', 'second', 'third'],
      usedSources: cards.map((card) => card.source),
      lastPublishedAt: '2026-07-20T07:00:00.000Z',
    });
  });

  it('does not replay all-time history after state version 2 starts a new cycle', () => {
    const migrated = migrateStoryState(
      cards,
      { version: 2, cycle: 2, usedCards: ['first'] },
      [{ publishedAt: '2026-07-20T07:00:00.000Z', cardId: 'second' }],
      ['third'],
    );
    expect(migrated.usedCards).toEqual(['first']);
  });

  it('retains the newest successful publication guard during migration', () => {
    const migrated = migrateStoryState(
      cards,
      {
        cycle: 1,
        lastPublishedAt: '2026-07-20T07:00:00.000Z',
        lastMediaId: 'older-media',
      },
      [
        {
          publishedAt: '2026-07-21T07:00:00.000Z',
          mediaId: 'newer-media',
          cardId: 'second',
        },
      ],
      [],
    );
    expect(migrated.lastPublishedAt).toBe('2026-07-21T07:00:00.000Z');
    expect(migrated.lastMediaId).toBe('newer-media');
  });

  it('is idempotent once the state reaches version 2', () => {
    const first = migrateStoryState(
      cards,
      { cycle: 1, used: [cards[0].source] },
      [{ publishedAt: '2026-07-20T07:00:00.000Z', cardId: 'second' }],
      ['third'],
    );
    expect(migrateStoryState(
      cards,
      first,
      [{ publishedAt: '2026-07-22T07:00:00.000Z', cardId: 'first' }],
      [],
    )).toEqual(first);
  });

  it('reads valid JSONL records and ignores malformed log lines', () => {
    expect(parseStoryPublicationLog([
      '{"publishedAt":"2026-07-20T07:00:00.000Z","cardId":"first"}',
      'not-json',
      '{"failedAt":"2026-07-21T07:00:00.000Z"}',
      '',
    ].join('\n'))).toEqual([
      { publishedAt: '2026-07-20T07:00:00.000Z', cardId: 'first' },
      { failedAt: '2026-07-21T07:00:00.000Z' },
    ]);
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

describe('Meta token failure classification', () => {
  it('treats code 190 as a token that must be replaced', () => {
    const revoked = new Error('Error validating access token: The session has been invalidated because the user changed their password.');
    revoked.code = 190;
    revoked.subcode = 460;
    expect(isInvalidTokenError(revoked)).toBe(true);
    const rateLimited = new Error('Application request limit reached');
    rateLimited.code = 4;
    expect(isInvalidTokenError(rateLimited)).toBe(false);
    expect(isInvalidTokenError(new Error('fetch failed'))).toBe(false);
  });
});

describe('Instagram Story run exit codes', () => {
  const scriptPath = fileURLToPath(new URL('../../scripts/instagram-story.mjs', import.meta.url));
  const stubPath = fileURLToPath(new URL('./helpers/instagram-fetch-stub.mjs', import.meta.url));
  const execFileAsync = promisify(execFile);

  async function runScript(stubMode) {
    const directory = await mkdtemp(path.join(tmpdir(), 'instagram-story-'));
    const logPath = path.join(directory, 'log.jsonl');
    try {
      await execFileAsync(process.execPath, ['--import', stubPath, scriptPath, '--publish'], {
        env: {
          ...process.env,
          INSTAGRAM_FETCH_STUB_MODE: stubMode,
          INSTAGRAM_STORY_ENV_PATH: path.join(directory, 'missing.env'),
          INSTAGRAM_STORY_LOG_PATH: logPath,
          INSTAGRAM_STORY_STATE_PATH: path.join(directory, 'state.json'),
          META_GRAPH_VERSION: 'v23.0',
          META_INSTAGRAM_ACCOUNT_ID: '1',
          META_PAGE_ACCESS_TOKEN: 'test-token',
          META_PAGE_ID: '2',
        },
      });
      return { code: 0, log: await readFile(logPath, 'utf8') };
    } catch (error) {
      return { code: error.code, log: await readFile(logPath, 'utf8') };
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  it.each([
    ['revoked-token', INVALID_TOKEN_EXIT_CODE],
    ['rate-limited', 1],
  ])('spawned run with a %s failure exits with code %d', async (stubMode, expectedCode) => {
    const { code, log } = await runScript(stubMode);
    expect(code).toBe(expectedCode);
    expect(log).toContain('"failedAt"');
  }, 15_000);
});

describe('Approved Story queue audit', () => {
  it('keeps at least a month of unique daily pictures in rotation', () => {
    expect(INSTAGRAM_STORY_CARDS.length).toBeGreaterThanOrEqual(30);
  });

  it('contains only publishable photo sources', () => {
    const { rejected } = partitionPublishableCards(INSTAGRAM_STORY_CARDS);
    expect(rejected.map((entry) => entry.card.id)).toEqual([]);
  });

  it('gives every card a unique id', () => {
    const ids = INSTAGRAM_STORY_CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not assign the same picture to two different cards', () => {
    const sources = INSTAGRAM_STORY_CARDS.map((card) => card.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it('points every card at an image file that exists', () => {
    const missing = INSTAGRAM_STORY_CARDS
      .filter((card) => !existsSync(path.join(ROOT, 'public', card.source)))
      .map((card) => card.source);
    expect(missing).toEqual([]);
  });
});
