import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const API_ORIGIN = 'https://graph.threads.net';
const SITE_ORIGIN = 'https://yournexttriptoparadise.com';
const TIME_ZONE = process.env.THREADS_TIME_ZONE || 'Africa/Dar_es_Salaam';
const STATE_PATH = path.resolve(
  ROOT,
  process.env.THREADS_STATE_PATH || '.threads-auto-commenter-state.json',
);
const EXPECTED_USERNAME = process.env.THREADS_EXPECTED_USERNAME || 'yournexttriptoparadise';
const DAILY_CAP = 5;
const PER_RUN_CAP = Math.min(2, Math.max(1, Number(process.env.THREADS_PER_RUN_CAP) || 2));
const SEARCH_LOOKBACK_HOURS = 36;
const STATE_RETENTION_DAYS = 90;

const SEARCH_QUERIES = [
  'Zanzibar',
  'Zanzibar hotel',
  'Zanzibar safari',
  'Tanzania travel',
  'Tanzania safari',
  'Tanzania itinerary',
];

const DESTINATION_PATTERN = /\b(zanzibar|tanzania|serengeti|kilimanjaro|nungwi|kendwa|paje|jambiani|stone town|safari)\b/i;
const REQUEST_PATTERN = /\?|\b(any (?:advice|recommendations?|suggestions?|tips)|looking for (?:advice|recommendations?|suggestions?|tips)|need (?:advice|recommendations?|suggestions?|tips|help)|can anyone (?:recommend|suggest|help)|could anyone (?:recommend|suggest|help)|where should (?:i|we)|what should (?:i|we)|what is the best|what's the best|which (?:area|beach|place|route|safari)|would you recommend|how many days|how long should|best time to|tips for|help (?:me|us) (?:choose|plan)|planning .{0,80}(?:where|what|which|how|advice|recommend))\b/i;
const EXCLUSION_PATTERNS = [
  /\b(election|president|government|minister|parliament|politics|protest|war|breaking news|earthquake|flood|outbreak)\b/i,
  /\b(scamm?ed|scammer|refund|cancelled|canceled|complaint|terrible|worst|awful|hate|overrated|disappointed|stolen|robbed|harass(?:ed|ment)?|rip.?off|avoid this|never again)\b/i,
  /\b(book now|limited offer|discount code|promo code|special deal|dm me|contact us|whatsapp|our (?:tour|hotel|package|agency)|travel agent|tour operator|marketing|business inquiry)\b/i,
  /\b(visa|passport|immigration|entry requirements?|yellow fever|vaccin(?:e|ation)|malaria|medical|hospital|insurance claim)\b/i,
  /\b(buy followers?|crypto|forex|giveaway|betting|casino|onlyfans)\b/i,
];

const CATEGORY_PATTERNS = [
  ['safari', /\b(safari|serengeti|ngorongoro|tarangire|nyerere|selous|mikumi|game drive)\b/i],
  ['stay', /\b(where to stay|which area|which beach|hotel|resort|nungwi|kendwa|paje|jambiani|stone town|beach)\b/i],
  ['transport', /\b(transfer|transport|taxi|airport|ferry|flight|getting around|drive|road)\b/i],
  ['season', /\b(best time|weather|rain|rainy|season|month|january|february|march|april|may|june|july|august|september|october|november|december)\b/i],
  ['itinerary', /\b(itinerary|how many days|how long|days? in|nights?|route|split (?:my|our|the) trip)\b/i],
  ['excursions', /\b(excursion|things to do|activity|activities|snorkel|diving|dive|spice|jozani|stone town|mnemba|prison island|nakupenda)\b/i],
  ['budget', /\b(budget|cost|price|expensive|cheap|afford)\b/i],
];

function modeFromArguments(argv) {
  const publish = argv.includes('--publish');
  const dryRun = argv.includes('--dry-run');
  if (publish && dryRun) throw new Error('Choose either --publish or --dry-run, not both.');
  return publish ? 'publish' : 'dry-run';
}

function choiceFor(postId, label, values) {
  const digest = createHash('sha256').update(`${postId}:${label}`).digest();
  return values[digest.readUInt32BE(0) % values.length];
}

export function zanzibarDateKey(value, timeZone = TIME_ZONE) {
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

export function classifyCandidate(post, now = new Date()) {
  const text = String(post?.text || '').replace(/\s+/g, ' ').trim();
  const timestamp = new Date(post?.timestamp || '');
  const ageMs = now.getTime() - timestamp.getTime();

  if (!post?.id || text.length < 18 || text.length > 500) return null;
  if (Number.isNaN(timestamp.getTime()) || ageMs < 0 || ageMs > SEARCH_LOOKBACK_HOURS * 3_600_000) return null;
  if (post.is_quote_post || post.is_reply || !DESTINATION_PATTERN.test(text)) return null;
  if (!REQUEST_PATTERN.test(text) || EXCLUSION_PATTERNS.some((pattern) => pattern.test(text))) return null;

  const category = CATEGORY_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] || 'general';
  const daysMatch = text.match(/\b(\d{1,2})\s*(?:days?|nights?)\b/i);
  const days = daysMatch ? Number(daysMatch[1]) : null;
  const specificity = CATEGORY_PATTERNS.filter(([, pattern]) => pattern.test(text)).length;

  return {
    id: String(post.id),
    permalink: post.permalink || null,
    text,
    timestamp: timestamp.toISOString(),
    category,
    days: days && days <= 30 ? days : null,
    score: 10 + Math.min(specificity, 3) + (text.includes('?') ? 2 : 0),
  };
}

const ADVICE = {
  safari: [
    'From Zanzibar, Nyerere is the easiest short safari add-on; for Serengeti and Ngorongoro, allow more time and plan the mainland routing rather than squeezing it into one rushed day.',
    'If the safari is an add-on to Zanzibar, a fly-in option saves a lot of transfer time. Nyerere suits a short trip; the northern circuit is stronger when you can give it several days.',
  ],
  stay: [
    'For sunsets and easier swimming through more of the day, look at Nungwi or Kendwa. Paje and Jambiani are better for kitesurfing, a quieter village feel, and travelers who enjoy the tidal landscape.',
    'Choose the coast by experience: Nungwi or Kendwa for sunsets and more tide-independent swimming; Paje or Jambiani for kitesurfing, local atmosphere, and wide tidal beaches.',
  ],
  transport: [
    'Pre-arrange the first airport or ferry transfer, confirm the total price and pickup point in writing, and leave a generous buffer around ferries or domestic flights.',
    'For the smoothest arrival, book a named driver in advance and share the flight or ferry number. Build in buffer time because island transfers and port queues can vary.',
  ],
  season: [
    'June to October is generally drier and comfortable; January and February are also popular. March to May is the wetter stretch, while short rains can appear around November, so exact dates matter.',
    'For drier weather, June through October is the usual first choice, with January and February another good window. Shoulder months can be quieter but are less predictable.',
  ],
  itinerary: [
    'A balanced first visit usually combines Stone Town with one coast rather than changing hotels repeatedly. Add a second coast only if the trip is long enough to enjoy the contrast without losing days to transfers.',
    'Keep the route simple: one or two nights around Stone Town, then settle on the coast that fits your priorities. Too many hotel moves make a short Zanzibar trip feel rushed.',
  ],
  excursions: [
    'A good mix is one culture day around Stone Town and a spice farm, one nature day such as Jozani, and one sea day chosen for the season and tides. Avoid packing a boat trip into every day.',
    'Mix the trip rather than stacking similar tours: Stone Town for history, Jozani or a spice farm on land, then one well-chosen snorkeling or sandbank day with a licensed operator.',
  ],
  budget: [
    'The biggest budget drivers are coast, hotel level, private transfers, and boat trips. Price the full stay with transfers and activities included; a cheap room can be a false saving if every outing starts far away.',
    'Build the budget in four lines: accommodation, airport or ferry transfers, meals, and excursions. Location matters because repeated cross-island taxis can quickly outweigh a lower nightly rate.',
  ],
  general: [
    'Start with the month, number of nights, and whether the priority is beach, culture, or safari. Those three choices determine the right coast and whether splitting the stay is worthwhile.',
    'The best plan depends on three things: travel month, trip length, and whether you value swimming, local atmosphere, or safari most. Pick the coast after those are clear.',
  ],
};

const FOLLOW_UPS = {
  safari: 'How many mainland safari nights can you give it?',
  stay: 'Are swimming, nightlife, or a quieter local atmosphere most important?',
  transport: 'Which arrival point and hotel area are you using?',
  season: 'Which exact month are you considering?',
  itinerary: 'What month and how many nights do you have?',
  excursions: 'Which coast will you stay on, and what month?',
  budget: 'What nightly hotel range and trip length are you planning?',
  general: 'What month and trip length are you considering?',
};

const LINKS = {
  safari: `${SITE_ORIGIN}/safaris`,
  transport: `${SITE_ORIGIN}/transfers`,
  excursions: `${SITE_ORIGIN}/excursions`,
};

export function buildReply(candidate) {
  const intro = choiceFor(candidate.id, 'intro', [
    'Destination Paradise tip:',
    'A practical Zanzibar planning tip:',
    'From our Zanzibar team:',
  ]);
  let advice = choiceFor(candidate.id, `advice:${candidate.category}`, ADVICE[candidate.category]);

  if (candidate.category === 'itinerary' && candidate.days) {
    if (candidate.days <= 4) {
      advice = `With ${candidate.days} days, use one coast as your base and add Stone Town as a focused day or overnight; changing hotels more than once will eat into the trip.`;
    } else if (candidate.days <= 8) {
      advice = `With ${candidate.days} days, one or two nights around Stone Town plus the rest on one coast is a comfortable split. Add a second coast only if the contrast matters more than slow beach time.`;
    } else {
      advice = `With ${candidate.days} days, you have room for Stone Town, two contrasting coasts, or a short mainland safari without rushing every stop.`;
    }
  }

  const followUp = FOLLOW_UPS[candidate.category];
  const link = LINKS[candidate.category];
  const parts = [`${intro} ${advice}`, followUp];
  if (link) parts.push(`Relevant details: ${link}`);
  const reply = parts.join(' ');
  if (reply.length > 500) throw new Error(`Generated reply exceeds the Threads limit (${reply.length}).`);
  return reply;
}

function normalizeState(value) {
  const records = Array.isArray(value?.records) ? value.records : [];
  return {
    version: 1,
    records: records
      .filter((record) => record?.postId && record?.attemptedAt)
      .map((record) => ({
        postId: String(record.postId),
        attemptedAt: String(record.attemptedAt),
        ...(record.status ? { status: String(record.status) } : {}),
        ...(record.replyId ? { replyId: String(record.replyId) } : {}),
        ...(record.publishedAt ? { publishedAt: String(record.publishedAt) } : {}),
      })),
  };
}

async function readState() {
  try {
    return normalizeState(JSON.parse(await readFile(STATE_PATH, 'utf8')));
  } catch (error) {
    if (error.code === 'ENOENT') return normalizeState({});
    throw error;
  }
}

function pruneState(state, now = new Date()) {
  const cutoff = now.getTime() - STATE_RETENTION_DAYS * 86_400_000;
  return {
    version: 1,
    records: state.records.filter((record) => new Date(record.attemptedAt).getTime() >= cutoff),
  };
}

async function writeState(state) {
  const temporaryPath = `${STATE_PATH}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(normalizeState(state), null, 2)}\n`, 'utf8');
  await rename(temporaryPath, STATE_PATH);
}

function attemptsToday(state, now = new Date()) {
  const today = zanzibarDateKey(now);
  return state.records.filter((record) => zanzibarDateKey(record.attemptedAt) === today).length;
}

function createApiError(message, response, json, method) {
  const error = new Error(json?.error?.message || message);
  error.httpStatus = response.status;
  error.code = json?.error?.code;
  error.subcode = json?.error?.error_subcode;
  error.uncertain = method === 'POST' && (response.status === 408 || response.status === 429 || response.status >= 500);
  return error;
}

const SAFE_REQUEST_RETRIES = 2;
const TRANSIENT_HTTP_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

// Meta intermittently rejects valid GET requests with 500 code 10
// ("Application does not have permission for this action") or 401 code 190
// ("Cannot parse access token"); both cleared on the next scheduled run with
// an unchanged token (Actions runs 29535570483 and 29536479874, 2026-07-16).
export function isTransientApiError(error) {
  if (TRANSIENT_HTTP_STATUSES.has(error.httpStatus)) return true;
  return error.httpStatus === 401 && error.code === 190;
}

export async function apiRequest(token, endpoint, { body, method = 'GET', params } = {}) {
  const url = new URL(`${API_ORIGIN}/${endpoint.replace(/^\/+/, '')}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== null && value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  // Only idempotent GETs retry; publish POSTs stay exactly-once, and their
  // transient failures keep flowing through the `uncertain` journaling path.
  const retries = method === 'GET' ? SAFE_REQUEST_RETRIES : 0;
  for (let attempt = 0; ; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
    try {
      return await sendApiRequest(token, url, { body, method });
    } catch (error) {
      if (attempt === retries || (error.httpStatus && !isTransientApiError(error))) throw error;
    }
  }
}

async function sendApiRequest(token, url, { body, method }) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body: body ? new URLSearchParams(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (cause) {
    const error = new Error(`Threads API ${method} request did not return a response.`);
    error.cause = cause;
    error.uncertain = method === 'POST';
    throw error;
  }

  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw createApiError(`Threads API returned an invalid response (${response.status}).`, response, null, method);
  }
  if (!response.ok || json.error) {
    throw createApiError(`Threads API request failed (${response.status}).`, response, json, method);
  }
  return json;
}

async function searchCandidates(token, now) {
  const since = Math.floor((now.getTime() - SEARCH_LOOKBACK_HOURS * 3_600_000) / 1_000);
  const results = await Promise.all(
    SEARCH_QUERIES.map((query) => apiRequest(token, 'keyword_search', {
      params: {
        q: query,
        search_type: 'RECENT',
        search_mode: 'KEYWORD',
        fields: 'id,username,text,timestamp,permalink,is_quote_post',
        limit: 50,
        since,
      },
    })),
  );
  const unique = new Map();
  for (const result of results) {
    for (const post of result.data || []) unique.set(String(post.id), post);
  }
  return [...unique.values()].map((post) => classifyCandidate(post, now)).filter(Boolean);
}

async function ownReplyTargets(token, now) {
  const since = Math.floor((now.getTime() - 7 * 86_400_000) / 1_000);
  const result = await apiRequest(token, 'me/replies', {
    params: {
      fields: 'id,timestamp,replied_to,root_post',
      limit: 100,
      since,
    },
  });
  const targets = new Set();
  for (const reply of result.data || []) {
    if (reply.replied_to?.id) targets.add(String(reply.replied_to.id));
  }
  return targets;
}

function safeError(error) {
  return {
    message: error.message,
    ...(error.httpStatus ? { httpStatus: error.httpStatus } : {}),
    ...(error.code ? { code: error.code } : {}),
    ...(error.subcode ? { subcode: error.subcode } : {}),
    ...(error.uncertain ? { uncertain: true } : {}),
  };
}

async function main() {
  const mode = modeFromArguments(process.argv.slice(2));
  const token = process.env.THREADS_USER_ACCESS_TOKEN;
  if (!token) throw new Error('Missing Threads authorization: THREADS_USER_ACCESS_TOKEN.');

  const now = new Date();
  let state = pruneState(await readState(), now);
  const usedPostIds = new Set(state.records.map((record) => record.postId));
  const remainingToday = Math.max(0, DAILY_CAP - attemptsToday(state, now));

  const profile = await apiRequest(token, 'me', { params: { fields: 'id,username' } });
  if (!profile.id || profile.username !== EXPECTED_USERNAME) {
    throw new Error(`Safety check failed: expected @${EXPECTED_USERNAME}, received @${profile.username || 'unknown'}.`);
  }

  const [candidates, repliedTargets] = await Promise.all([
    searchCandidates(token, now),
    ownReplyTargets(token, now),
  ]);
  const eligible = candidates
    .filter((candidate) => !usedPostIds.has(candidate.id) && !repliedTargets.has(candidate.id))
    .sort((left, right) => right.score - left.score || right.timestamp.localeCompare(left.timestamp));
  const selected = eligible.slice(0, Math.min(PER_RUN_CAP, remainingToday));

  if (mode === 'dry-run') {
    console.log(JSON.stringify({
      ok: true,
      mode,
      account: `@${profile.username}`,
      discoveredCount: candidates.length,
      eligibleCount: eligible.length,
      remainingToday,
      selections: selected.map((candidate) => ({
        postId: candidate.id,
        sourceTimestamp: candidate.timestamp,
      })),
    }));
    return;
  }

  const published = [];
  for (const candidate of selected) {
    const record = {
      postId: candidate.id,
      attemptedAt: new Date().toISOString(),
      status: 'selected',
    };
    state.records.push(record);
    await writeState(state);

    let container;
    try {
      container = await apiRequest(token, 'me/threads', {
        method: 'POST',
        body: {
          media_type: 'TEXT',
          text: buildReply(candidate),
          reply_to_id: candidate.id,
        },
      });
    } catch (error) {
      record.status = error.uncertain ? 'create-uncertain' : 'create-failed';
      await writeState(state);
      throw error;
    }
    if (!container.id) {
      record.status = 'create-uncertain';
      await writeState(state);
      throw new Error('Threads created no identifiable reply container; the post will not be retried.');
    }

    record.status = 'publish-pending';
    await writeState(state);
    try {
      const result = await apiRequest(token, 'me/threads_publish', {
        method: 'POST',
        body: { creation_id: container.id },
      });
      record.status = 'published';
      record.replyId = String(result.id);
      record.publishedAt = new Date().toISOString();
      await writeState(state);
      published.push({ postId: candidate.id, replyId: record.replyId, publishedAt: record.publishedAt });
    } catch (error) {
      record.status = error.uncertain ? 'publish-uncertain' : 'publish-failed';
      await writeState(state);
      throw error;
    }
  }

  console.log(JSON.stringify({
    ok: true,
    mode,
    account: `@${profile.username}`,
    published,
    skipped: selected.length === 0,
    reason: selected.length === 0 ? (remainingToday === 0 ? 'daily-cap-reached' : 'no-eligible-posts') : undefined,
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  main().catch((error) => {
    console.error(JSON.stringify({ ok: false, ...safeError(error) }));
    process.exitCode = 1;
  });
}
