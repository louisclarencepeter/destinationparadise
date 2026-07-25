import { createHash } from 'node:crypto';
import { access, appendFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  INSTAGRAM_STORY_ALLOWED_SOURCE,
  INSTAGRAM_STORY_CARDS,
  INSTAGRAM_STORY_PUBLISHED_HISTORY_SEED,
} from '../data/instagramStoryCards.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const ENV_PATH = path.resolve(ROOT, process.env.INSTAGRAM_STORY_ENV_PATH || '.env.instagram-story');
const STATE_PATH = path.resolve(ROOT, process.env.INSTAGRAM_STORY_STATE_PATH || '.instagram-story-state.json');
const LOG_PATH = path.resolve(ROOT, process.env.INSTAGRAM_STORY_LOG_PATH || '.instagram-story-log.jsonl');
const SITE_ORIGIN = 'https://yournexttriptoparadise.com';
const EXPECTED_USERNAME = 'yournexttriptoparadise';
const STORY_TIME_ZONE = process.env.INSTAGRAM_STORY_TIME_ZONE || 'Africa/Dar_es_Salaam';
const mode = process.argv.includes('--publish') ? 'publish' : 'dry-run';
const SAFE_REQUEST_RETRIES = 2;
export const INSTAGRAM_STORY_STATE_VERSION = 2;

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        return separator === -1
          ? [line, '']
          : [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

async function loadConfig() {
  const required = [
    'META_GRAPH_VERSION',
    'META_PAGE_ID',
    'META_INSTAGRAM_ACCOUNT_ID',
    'META_PAGE_ACCESS_TOKEN',
  ];
  let fileValues = {};
  try {
    fileValues = parseEnv(await readFile(ENV_PATH, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const values = Object.fromEntries(
    required.map((key) => [key, process.env[key] || fileValues[key]]),
  );
  const missing = required.filter((key) => !values[key]);
  if (missing.length) {
    throw new Error(`Missing Instagram Story configuration: ${missing.join(', ')}`);
  }
  return values;
}

// A problem with one card's media (bad type, missing file, Meta rejection)
// must skip that card, not fail the whole run.
export class StoryMediaError extends Error {
  constructor(message, card, { code, subcode } = {}) {
    super(message);
    this.name = 'StoryMediaError';
    this.cardId = card?.id;
    this.source = card?.source;
    this.code = code;
    this.subcode = subcode;
  }
}

// Meta reports unacceptable media as code 9004 (e.g. subcode 2207052,
// "Only photo or video can be accepted as media type.").
export function isStoryMediaError(error) {
  return (
    error instanceof StoryMediaError ||
    error?.code === 9004 ||
    error?.subcode === 2207052 ||
    /only photo or video can be accepted/i.test(error?.message || '')
  );
}

export function partitionPublishableCards(cards) {
  const publishable = [];
  const rejected = [];
  for (const card of cards) {
    if (typeof card?.source === 'string' && INSTAGRAM_STORY_ALLOWED_SOURCE.test(card.source)) {
      publishable.push(card);
    } else {
      rejected.push({ card, reason: 'unsupported-media-source' });
    }
  }
  return { publishable, rejected };
}

async function listApprovedCards() {
  const { publishable, rejected } = partitionPublishableCards(INSTAGRAM_STORY_CARDS);
  const checks = await Promise.allSettled(
    publishable.map((card) => access(path.join(ROOT, 'public', card.source))),
  );
  const cards = publishable.filter((card, index) => {
    if (checks[index].status === 'fulfilled') return true;
    rejected.push({ card, reason: 'missing-media-file' });
    return false;
  });
  return { cards, rejected };
}

async function readState() {
  try {
    return JSON.parse(await readFile(STATE_PATH, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return { cycle: 1, used: [] };
    throw error;
  }
}

export function parseStoryPublicationLog(source) {
  return String(source || '')
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const entry = JSON.parse(line);
        return entry && typeof entry === 'object' ? [entry] : [];
      } catch {
        return [];
      }
    });
}

async function readPublicationLog() {
  try {
    return parseStoryPublicationLog(await readFile(LOG_PATH, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function cardHistoryFromState(cards, state) {
  const ids = new Set(cards.map((card) => card.id));
  const idsBySource = new Map(cards.map((card) => [card.source, card.id]));
  const sourcesById = new Map(cards.map((card) => [card.id, card.source]));
  const usedCardIds = new Set(
    Array.isArray(state?.usedCards)
      ? state.usedCards.filter((id) => ids.has(id))
      : [],
  );
  const usedSources = new Set([
    ...(Array.isArray(state?.usedSources) ? state.usedSources : []),
    ...(Array.isArray(state?.used) ? state.used : []),
  ]);
  for (const source of usedSources) {
    const id = idsBySource.get(source);
    if (id) usedCardIds.add(id);
  }
  for (const id of usedCardIds) {
    const source = sourcesById.get(id);
    if (source) usedSources.add(source);
  }
  return { usedCardIds, usedSources };
}

export function migrateStoryState(
  cards,
  state = {},
  publicationLog = [],
  publishedHistorySeed = INSTAGRAM_STORY_PUBLISHED_HISTORY_SEED,
) {
  const ids = new Set(cards.map((card) => card.id));
  const idsBySource = new Map(cards.map((card) => [card.source, card.id]));
  const sourcesById = new Map(cards.map((card) => [card.id, card.source]));
  const { usedCardIds, usedSources } = cardHistoryFromState(cards, state);
  const stateVersion = Number(state.version) || 0;
  let lastPublishedAt = state.lastPublishedAt;
  let lastMediaId = state.lastMediaId;

  if (stateVersion < INSTAGRAM_STORY_STATE_VERSION) {
    for (const entry of publicationLog) {
      if (!entry?.publishedAt) continue;
      const id = ids.has(entry.cardId) ? entry.cardId : idsBySource.get(entry.selected);
      const source = id ? sourcesById.get(id) : null;
      if (id) usedCardIds.add(id);
      if (source) usedSources.add(source);
      const entryTime = new Date(entry.publishedAt).getTime();
      const currentTime = new Date(lastPublishedAt || 0).getTime();
      if (!Number.isNaN(entryTime) && (Number.isNaN(currentTime) || entryTime > currentTime)) {
        lastPublishedAt = entry.publishedAt;
        lastMediaId = entry.mediaId || lastMediaId;
      }
    }
    for (const id of publishedHistorySeed) {
      if (!ids.has(id)) continue;
      usedCardIds.add(id);
      usedSources.add(sourcesById.get(id));
    }
  }

  const migrated = {
    ...state,
    version: Math.max(stateVersion, INSTAGRAM_STORY_STATE_VERSION),
    cycle: Number(state.cycle) || 1,
    usedCards: cards.filter((card) => usedCardIds.has(card.id)).map((card) => card.id),
    usedSources: cards.filter((card) => usedSources.has(card.source)).map((card) => card.source),
  };
  if (lastPublishedAt) migrated.lastPublishedAt = lastPublishedAt;
  if (lastMediaId) migrated.lastMediaId = lastMediaId;
  delete migrated.used;
  return migrated;
}

export function storyDateKey(value, timeZone = STORY_TIME_ZONE) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function alreadyPublishedToday(state, now = new Date(), timeZone = STORY_TIME_ZONE) {
  if (!state?.lastPublishedAt) return false;
  const publishedDate = storyDateKey(state.lastPublishedAt, timeZone);
  return publishedDate !== null && publishedDate === storyDateKey(now, timeZone);
}

export function chooseStoryCard(cards, state = {}, { excludedIds = [] } = {}) {
  const { usedCardIds, usedSources } = cardHistoryFromState(cards, state);
  const excludedCardIds = new Set(excludedIds);
  const availableCards = cards.filter((card) => !excludedCardIds.has(card.id));
  const unusedCards = cards.filter(
    (card) => !usedCardIds.has(card.id) && !usedSources.has(card.source),
  );
  let remaining = unusedCards.filter((card) => !excludedCardIds.has(card.id));
  let cycle = Number(state.cycle) || 1;

  if (!remaining.length) {
    if (unusedCards.length) {
      throw new Error(
        `Every unused Story card failed media validation: ${unusedCards.map((card) => card.id).join(', ')}.`,
      );
    }
    remaining = availableCards;
    usedCardIds.clear();
    usedSources.clear();
    cycle += 1;
  }

  if (!remaining.length) throw new Error('No approved Destination Paradise Story cards found.');
  const selected = remaining[0];
  usedCardIds.add(selected.id);
  usedSources.add(selected.source);
  const nextState = {
    ...state,
    version: Math.max(Number(state.version) || 0, INSTAGRAM_STORY_STATE_VERSION),
    cycle,
    usedCards: cards.filter((card) => usedCardIds.has(card.id)).map((card) => card.id),
    usedSources: cards.filter((card) => usedSources.has(card.source)).map((card) => card.source),
  };
  delete nextState.used;
  return { selected, nextState };
}

function createImageUrl(card) {
  const params = new URLSearchParams({ src: card.source, card: card.id, v: '3' });
  return `${SITE_ORIGIN}/api/instagram-story-image?${params}`;
}

const TRANSIENT_HTTP_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

async function fetchWithSafeRetries(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD'].includes(method)) return fetch(url, options);

  let lastError;
  for (let attempt = 0; attempt <= SAFE_REQUEST_RETRIES; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
    try {
      const response = await fetch(url, options);
      // Return the final transient response so callers can surface the API's
      // own error payload instead of a generic retry message.
      if (!TRANSIENT_HTTP_STATUSES.has(response.status) || attempt === SAFE_REQUEST_RETRIES) {
        return response;
      }
      lastError = new Error(`received transient HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(
    `${method} request failed after ${SAFE_REQUEST_RETRIES + 1} attempts: ${lastError?.message || 'unknown network error'}.`,
  );
}

async function graphRequest(config, endpoint, options = {}) {
  const response = await fetchWithSafeRetries(
    `https://graph.facebook.com/${config.META_GRAPH_VERSION}/${endpoint}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${config.META_PAGE_ACCESS_TOKEN}`,
        ...options.headers,
      },
    },
  );
  const json = await response.json();
  if (!response.ok || json.error) {
    const message = json.error?.message || `Meta Graph request failed (${response.status})`;
    const error = new Error(message);
    error.code = json.error?.code;
    error.subcode = json.error?.error_subcode;
    throw error;
  }
  return json;
}

export async function verifyImage(imageUrl, card) {
  const response = await fetchWithSafeRetries(imageUrl, { method: 'HEAD' });
  if (!response.ok) {
    throw new StoryMediaError(`Story image is not publicly available (${response.status}).`, card);
  }
  const contentType = response.headers.get('content-type') || '';
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentType !== 'image/jpeg') {
    throw new StoryMediaError(
      `Story image must resolve to image/jpeg, received ${contentType || 'unknown'}.`,
      card,
    );
  }
  if (contentLength > 8 * 1024 * 1024) {
    throw new StoryMediaError(`Story image is too large (${contentLength} bytes).`, card);
  }
  return { contentLength, contentType };
}

async function waitForContainer(config, creationId, card) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const status = await graphRequest(config, `${creationId}?fields=status_code,status`);
    if (status.status_code === 'FINISHED') return status;
    if (['ERROR', 'EXPIRED'].includes(status.status_code)) {
      throw new StoryMediaError(
        `Story media processing failed: ${status.status || status.status_code}`,
        card,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
  throw new Error('Timed out waiting for Instagram to process the Story image.');
}

async function recordLog(entry) {
  await appendFile(LOG_PATH, `${JSON.stringify(entry)}\n`, 'utf8');
}

async function main() {
  const state = await readState();
  if (mode === 'publish' && alreadyPublishedToday(state)) {
    console.log(
      JSON.stringify({
        ok: true,
        skipped: true,
        reason: 'already-published-today',
        lastPublishedAt: state.lastPublishedAt,
        lastMediaId: state.lastMediaId,
        timeZone: STORY_TIME_ZONE,
      }),
    );
    return;
  }

  const config = await loadConfig();
  const profile = await graphRequest(
    config,
    `${config.META_INSTAGRAM_ACCOUNT_ID}?fields=id,username`,
  );
  if (
    profile.id !== config.META_INSTAGRAM_ACCOUNT_ID ||
    profile.username !== EXPECTED_USERNAME
  ) {
    throw new Error(
      `Safety check failed: expected @${EXPECTED_USERNAME}, received @${profile.username || 'unknown'}.`,
    );
  }

  const { cards, rejected } = await listApprovedCards();
  for (const { card, reason } of rejected) {
    await reportSkippedCard({ reason, cardId: card?.id, source: card?.source });
  }
  if (!cards.length) throw new Error('No approved Destination Paradise Story cards found.');
  const migratedState = migrateStoryState(cards, state, await readPublicationLog());

  const skippedIds = new Set();
  for (;;) {
    const candidates = cards.filter((card) => !skippedIds.has(card.id));
    if (!candidates.length) {
      throw new Error(
        `Every approved Story card failed media validation: ${[...skippedIds].join(', ')}.`,
      );
    }
    const { selected, nextState } = chooseStoryCard(cards, migratedState, {
      excludedIds: skippedIds,
    });
    try {
      await publishStoryCard({ config, profile, selected, nextState, cardCount: cards.length });
      return;
    } catch (error) {
      if (!isStoryMediaError(error)) throw error;
      skippedIds.add(selected.id);
      await reportSkippedCard({
        reason: 'unpublishable-media',
        cardId: selected.id,
        source: selected.source,
        error: error.message,
        code: error.code,
        subcode: error.subcode,
      });
    }
  }
}

async function reportSkippedCard(details) {
  const entry = { skippedCardAt: new Date().toISOString(), ...details };
  console.warn(JSON.stringify(entry));
  if (mode === 'publish') await recordLog(entry);
}

async function publishStoryCard({ config, profile, selected, nextState, cardCount }) {
  const imageUrl = createImageUrl(selected);
  const image = await verifyImage(imageUrl, selected);
  const selectionHash = createHash('sha256').update(selected.id).digest('hex').slice(0, 12);

  if (mode === 'dry-run') {
    console.log(
      JSON.stringify(
        {
          mode,
          account: `@${profile.username}`,
          cardCount,
          selected: selected.source,
          title: selected.title,
          caption: selected.caption,
          selectionHash,
          imageUrl,
          image,
        },
        null,
        2,
      ),
    );
    return;
  }

  const createBody = new URLSearchParams({
    media_type: 'STORIES',
    image_url: imageUrl,
  });
  const container = await graphRequest(
    config,
    `${config.META_INSTAGRAM_ACCOUNT_ID}/media`,
    { method: 'POST', body: createBody },
  );
  await waitForContainer(config, container.id, selected);

  const publishBody = new URLSearchParams({ creation_id: container.id });
  const published = await graphRequest(
    config,
    `${config.META_INSTAGRAM_ACCOUNT_ID}/media_publish`,
    { method: 'POST', body: publishBody },
  );

  const publishedAt = new Date().toISOString();
  await writeFile(
    STATE_PATH,
    `${JSON.stringify({ ...nextState, lastPublishedAt: publishedAt, lastMediaId: published.id }, null, 2)}\n`,
    'utf8',
  );
  await recordLog({
    publishedAt,
    mediaId: published.id,
    selected: selected.source,
    cardId: selected.id,
    title: selected.title,
    caption: selected.caption,
    selectionHash,
    account: `@${profile.username}`,
  });
  console.log(
    JSON.stringify({
      ok: true,
      publishedAt,
      mediaId: published.id,
      selected: selected.source,
      cardId: selected.id,
      title: selected.title,
      caption: selected.caption,
      account: `@${profile.username}`,
    }),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  main().catch(async (error) => {
    const entry = {
      failedAt: new Date().toISOString(),
      error: error.message,
      code: error.code,
      subcode: error.subcode,
    };
    try {
      await recordLog(entry);
    } catch {
      // Preserve the original publishing error if local logging also fails.
    }
    console.error(JSON.stringify(entry));
    process.exitCode = 1;
  });
}
