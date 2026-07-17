import { createHash } from 'node:crypto';
import { access, appendFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { INSTAGRAM_STORY_CARDS } from '../data/instagramStoryCards.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const ENV_PATH = path.resolve(ROOT, process.env.INSTAGRAM_STORY_ENV_PATH || '.env.instagram-story');
const STATE_PATH = path.resolve(ROOT, process.env.INSTAGRAM_STORY_STATE_PATH || '.instagram-story-state.json');
const LOG_PATH = path.resolve(ROOT, process.env.INSTAGRAM_STORY_LOG_PATH || '.instagram-story-log.jsonl');
const SITE_ORIGIN = 'https://yournexttriptoparadise.com';
const EXPECTED_USERNAME = 'yournexttriptoparadise';
const STORY_TIME_ZONE = process.env.INSTAGRAM_STORY_TIME_ZONE || 'Africa/Dar_es_Salaam';
const mode = process.argv.includes('--publish') ? 'publish' : 'dry-run';
const SAFE_REQUEST_RETRIES = 2;

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

async function listApprovedCards() {
  await Promise.all(
    INSTAGRAM_STORY_CARDS.map((card) => access(path.join(ROOT, 'public', card.source))),
  );
  return INSTAGRAM_STORY_CARDS;
}

async function readState() {
  try {
    return JSON.parse(await readFile(STATE_PATH, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return { cycle: 1, used: [] };
    throw error;
  }
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

export function chooseStoryCard(cards, state) {
  const existing = new Set(cards.map((card) => card.id));
  const usedCards = (state.usedCards || []).filter((id) => existing.has(id));
  const legacyUsedSources = new Set(state.used || []);
  let remaining = cards.filter(
    (card) => !usedCards.includes(card.id) && !legacyUsedSources.has(card.source),
  );
  let cycle = Number(state.cycle) || 1;

  if (!remaining.length) {
    remaining = cards;
    usedCards.length = 0;
    cycle += 1;
  }

  if (!remaining.length) throw new Error('No approved Destination Paradise Story cards found.');
  const selected = remaining[0];
  return { selected, nextState: { cycle, usedCards: [...usedCards, selected.id] } };
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

async function verifyImage(imageUrl) {
  const response = await fetchWithSafeRetries(imageUrl, { method: 'HEAD' });
  if (!response.ok) throw new Error(`Story image is not publicly available (${response.status}).`);
  const contentType = response.headers.get('content-type') || '';
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentType !== 'image/jpeg') {
    throw new Error(`Story image must resolve to image/jpeg, received ${contentType || 'unknown'}.`);
  }
  if (contentLength > 8 * 1024 * 1024) {
    throw new Error(`Story image is too large (${contentLength} bytes).`);
  }
  return { contentLength, contentType };
}

async function waitForContainer(config, creationId) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const status = await graphRequest(config, `${creationId}?fields=status_code,status`);
    if (status.status_code === 'FINISHED') return status;
    if (['ERROR', 'EXPIRED'].includes(status.status_code)) {
      throw new Error(`Story media processing failed: ${status.status || status.status_code}`);
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

  const cards = await listApprovedCards();
  const { selected, nextState } = chooseStoryCard(cards, state);
  const imageUrl = createImageUrl(selected);
  const image = await verifyImage(imageUrl);
  const selectionHash = createHash('sha256').update(selected.id).digest('hex').slice(0, 12);

  if (mode === 'dry-run') {
    console.log(
      JSON.stringify(
        {
          mode,
          account: `@${profile.username}`,
          cardCount: cards.length,
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
  await waitForContainer(config, container.id);

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
