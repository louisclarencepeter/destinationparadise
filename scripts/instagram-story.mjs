import { createHash, randomInt } from 'node:crypto';
import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.instagram-story');
const STATE_PATH = path.join(ROOT, '.instagram-story-state.json');
const LOG_PATH = path.join(ROOT, '.instagram-story-log.jsonl');
const SITE_ORIGIN = 'https://yournexttriptoparadise.com';
const EXPECTED_USERNAME = 'yournexttriptoparadise';
const ALLOWED_IMAGE_ROOTS = ['home', 'excursions', 'safaris'];
const mode = process.argv.includes('--publish') ? 'publish' : 'dry-run';

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
  const values = parseEnv(await readFile(ENV_PATH, 'utf8'));
  const required = [
    'META_GRAPH_VERSION',
    'META_PAGE_ID',
    'META_INSTAGRAM_ACCOUNT_ID',
    'META_PAGE_ACCESS_TOKEN',
  ];
  const missing = required.filter((key) => !values[key]);
  if (missing.length) {
    throw new Error(`Missing Instagram Story configuration: ${missing.join(', ')}`);
  }
  return values;
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    }),
  );
  return files.flat();
}

async function listCandidates() {
  const root = path.join(ROOT, 'public', 'assets', 'images');
  const files = (
    await Promise.all(ALLOWED_IMAGE_ROOTS.map((folder) => listFiles(path.join(root, folder))))
  ).flat();

  return files
    .filter((file) => file.endsWith('.webp'))
    .filter((file) => !file.endsWith('-600w.webp'))
    .map((file) => `/${path.relative(path.join(ROOT, 'public'), file).split(path.sep).join('/')}`)
    .sort();
}

async function readState() {
  try {
    return JSON.parse(await readFile(STATE_PATH, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return { cycle: 1, used: [] };
    throw error;
  }
}

function chooseCandidate(candidates, state) {
  const existing = new Set(candidates);
  const used = (state.used || []).filter((candidate) => existing.has(candidate));
  let remaining = candidates.filter((candidate) => !used.includes(candidate));
  let cycle = Number(state.cycle) || 1;

  if (!remaining.length) {
    remaining = candidates;
    used.length = 0;
    cycle += 1;
  }

  if (!remaining.length) throw new Error('No eligible Destination Paradise images found.');
  const selected = remaining[randomInt(remaining.length)];
  return { selected, nextState: { cycle, used: [...used, selected] } };
}

function createImageUrl(sourcePath) {
  const params = new URLSearchParams({ src: sourcePath });
  return `${SITE_ORIGIN}/api/instagram-story-image?${params}`;
}

async function graphRequest(config, endpoint, options = {}) {
  const response = await fetch(
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
  const response = await fetch(imageUrl, { method: 'HEAD' });
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

  const candidates = await listCandidates();
  const state = await readState();
  const { selected, nextState } = chooseCandidate(candidates, state);
  const imageUrl = createImageUrl(selected);
  const image = await verifyImage(imageUrl);
  const selectionHash = createHash('sha256').update(selected).digest('hex').slice(0, 12);

  if (mode === 'dry-run') {
    console.log(
      JSON.stringify(
        {
          mode,
          account: `@${profile.username}`,
          candidateCount: candidates.length,
          selected,
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
    selected,
    selectionHash,
    account: `@${profile.username}`,
  });
  console.log(
    JSON.stringify({
      ok: true,
      publishedAt,
      mediaId: published.id,
      selected,
      account: `@${profile.username}`,
    }),
  );
}

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
