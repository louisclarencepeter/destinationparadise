// Explicitly scoped to the separate mobile project; never uses linked-site state.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAPIToken } from '@netlify/dev-utils';
import { WEBSITE_ID, captureWebsiteBaseline, assertWebsiteUnchanged, saveWebsiteBaseline, recordMobileDeployId, loadWebsiteBaseline } from './website-preservation.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const OUT = path.join(HERE, 'build');
const SITE = 'f0fa9f3a-0de9-4e62-9809-d64031c415a2';
const ORIGIN = 'https://destination-paradise-mobile.netlify.app';
const ACCOUNT = '63fdd2e141224b0084aa509a';
const NAMES = ['marine', 'planner-report', 'weather'];
const REQUIRED_ENV = ['RESEND_API_KEY', 'RESEND_FROM_PLANNER', 'TEAM_EMAIL_PLANNER',
  'WEATHERKIT_TEAM_ID', 'WEATHERKIT_SERVICE_ID', 'WEATHERKIT_KEY_ID', 'WEATHERKIT_PRIVATE_KEY'];
const hash = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const mode = process.argv[2] || 'preflight';
assert.ok(['preflight', 'deploy', 'resume', 'verify'].includes(mode), 'Use preflight | deploy --production | resume ID | verify ID');
const token = process.env.NETLIFY_AUTH_TOKEN || await getAPIToken();
assert.ok(token, 'Authenticate the Netlify CLI or provide NETLIFY_AUTH_TOKEN securely');

async function api(route, { method = 'GET', body, bytes, query } = {}) {
  const url = new URL('https://api.netlify.com/api/v1/' + route);
  for (const [key, value] of Object.entries(query || {})) url.searchParams.set(key, String(value));
  // All mutations are constrained here as well as by the caller.
  if (method !== 'GET') assert.ok(route === `sites/${SITE}/deploys`
    || /^deploys\/[a-f0-9]{24}\/(?:files|functions)\//.test(route), 'Unexpected mutation target');
  const response = await fetch(url, { method, signal: AbortSignal.timeout(45_000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': bytes ? 'application/octet-stream' : 'application/json' },
    body: bytes ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  if (!response.ok) throw new Error(`Netlify ${method} ${url.pathname}: HTTP ${response.status}`);
  return response.json();
}

async function artifacts() {
  const manifest = JSON.parse(await fs.readFile(path.join(OUT, 'manifest.json'), 'utf8'));
  assert.equal(manifest.siteId, SITE);
  assert.equal(manifest.origin, ORIGIN);
  assert.deepEqual(manifest.files.map((file) => file.path).sort(), ['/_headers', '/mobile-privacy.html']);
  assert.deepEqual(manifest.functions.map((fn) => fn.name).sort(), NAMES);
  assert.deepEqual((await fs.readdir(path.join(OUT, 'public'))).sort(), ['_headers', 'mobile-privacy.html']);
  assert.deepEqual((await fs.readdir(path.join(OUT, 'functions'))).sort(), NAMES.map((name) => name + '.zip'));
  for (const [source, expected] of Object.entries(manifest.sources)) {
    assert.equal(hash(await fs.readFile(path.join(REPO, source))), expected, `Source changed: ${source}; rebuild first`);
  }
  for (const file of manifest.files) assert.equal(hash(await fs.readFile(path.join(OUT, file.source)), 'sha1'), file.sha1, 'Static artifact changed');
  for (const fn of manifest.functions) {
    assert.equal(hash(await fs.readFile(path.join(OUT, fn.path))), fn.sha256, `ZIP changed: ${fn.name}`);
    assert.equal(fn.runtime, 'nodejs22.x');
    assert.equal(fn.invocationMode, 'stream');
    assert.equal(fn.routes.length, 1);
    assert.equal(fn.routes[0].literal, '/api/' + fn.name);
  }
  return manifest;
}

const readWebsite = () => api('sites/' + WEBSITE_ID);

async function preflight(baseline) {
  const site = await api('sites/' + SITE);
  assert.equal(site.id, SITE);
  assert.equal(site.name, 'destination-paradise-mobile');
  assert.equal(site.account_id, ACCOUNT);
  for (const key of REQUIRED_ENV) {
    const entry = await api(`accounts/${ACCOUNT}/env/${key}`, { query: { site_id: SITE } });
    assert.ok(entry.scopes?.includes('functions'), `Missing functions scope: ${key}`);
    assert.ok(entry.values?.some((value) => ['production', 'all'].includes(value.context)), `Missing production setting: ${key}`);
    if (['RESEND_API_KEY', 'WEATHERKIT_PRIVATE_KEY'].includes(key)) assert.equal(entry.is_secret, true, `Set ${key} as a secret`);
  }
  await assertWebsiteUnchanged(readWebsite, baseline);
  return site;
}

async function verify(manifest, id, baseline) {
  assert.match(id, /^[a-f0-9]{24}$/);
  const deploy = await api('deploys/' + id);
  assert.equal(deploy.site_id, SITE);
  assert.equal(deploy.state, 'ready');
  assert.equal(deploy.context, 'production');
  const files = await api(`deploys/${id}/files`);
  assert.equal(files.length, 2);
  for (const file of manifest.files) {
    const current = files.find((item) => item.path === file.path);
    assert.equal(current?.sha, file.sha1);
    assert.equal(current?.site_id, SITE);
  }
  assert.deepEqual(deploy.available_functions.map((fn) => fn.n).sort(), NAMES);
  for (const fn of manifest.functions) {
    const current = deploy.available_functions.find((item) => item.n === fn.name);
    assert.equal(current.r, fn.runtime);
    assert.equal(current.im, fn.invocationMode);
    assert.equal(current.ro?.length, 1);
    assert.equal(current.ro[0].l, '/api/' + fn.name);
  }
  assert.ok(!deploy.edge_functions_present, 'Standalone backend must not deploy website edge functions');
  const site = await api('sites/' + SITE);
  assert.equal(site.published_deploy?.id, id, 'Production publication not confirmed');
  await assertWebsiteUnchanged(readWebsite, baseline);
  console.log(JSON.stringify({ verified: true, deployId: id, siteId: SITE, url: ORIGIN,
    websiteUnchanged: baseline.publishedDeployId, files: 2, functions: NAMES }));
}

async function upload(manifest, deploy, baseline) {
  assert.equal(deploy.site_id, SITE);
  for (let attempt = 0; deploy.state === 'preparing' && attempt < 90; attempt++) {
    await sleep(2_000); deploy = await api('deploys/' + deploy.id);
  }
  assert.ok(['prepared', 'uploading', 'uploaded', 'ready'].includes(deploy.state), `Unexpected deploy state: ${deploy.state}`);
  assert.ok((deploy.required || []).every((sha) => manifest.files.some((file) => file.sha1 === sha)), 'Unexpected requested file');
  assert.ok((deploy.required_functions || []).every((sha) => manifest.functions.some((fn) => fn.sha256 === sha)), 'Unexpected requested function');
  assert.equal((deploy.required_edge_functions || []).length, 0);
  // Upload only the three complete bundles declared in this manifest. Provider
  // validates ZIP bytes against the submitted raw SHA256 upload digests.
  for (const sha of deploy.required_functions || []) {
    const fn = manifest.functions.find((item) => item.sha256 === sha);
    await api(`deploys/${deploy.id}/functions/${fn.name}`, { method: 'PUT', bytes: await fs.readFile(path.join(OUT, fn.path)),
      query: { runtime: fn.runtime, invocation_mode: fn.invocationMode } });
  }
  for (const sha of deploy.required || []) {
    const file = manifest.files.find((item) => item.sha1 === sha);
    await api(`deploys/${deploy.id}/files${file.path}`, { method: 'PUT', bytes: await fs.readFile(path.join(OUT, file.source)) });
  }
  for (let attempt = 0; attempt < 90; attempt++) {
    deploy = await api('deploys/' + deploy.id);
    if (deploy.state === 'ready') break;
    if (['error', 'canceled'].includes(deploy.state)) throw new Error(`Deploy ended in ${deploy.state}`);
    await sleep(2_000);
  }
  await verify(manifest, deploy.id, baseline);
}

async function main() {
  const manifest = await artifacts();
  // Resume and verification retain the original baseline. Recapturing it after
  // an interruption would conceal a website change during the mobile release.
  const baseline = ['resume', 'verify'].includes(mode)
    ? await loadWebsiteBaseline(OUT, manifest, process.argv[3])
    : await captureWebsiteBaseline(readWebsite);
  if (mode === 'verify') return verify(manifest, process.argv[3], baseline);
  await preflight(baseline);
  if (mode === 'preflight') {
    console.log(JSON.stringify({ ready: true, siteId: SITE, websiteUnchanged: baseline.publishedDeployId, files: 2, functions: NAMES, writes: 0 }));
    return;
  }
  let deploy;
  if (mode === 'resume') {
    const id = process.argv[3];
    assert.match(id, /^[a-f0-9]{24}$/);
    assert.equal((await fs.readFile(path.join(OUT, 'deploy-id.txt'), 'utf8')).trim(), id, 'Resume only this artifact’s recorded deploy');
    deploy = await api('deploys/' + id);
  } else {
    assert.equal(process.argv[3], '--production', 'Use deploy --production to explicitly publish only the mobile backend');
    // A previous attempt must be resumed or verified, never silently replaced.
    for (const filename of ['website-baseline.json', 'deploy-id.txt']) {
      await assert.rejects(fs.access(path.join(OUT, filename)), { code: 'ENOENT' }, 'Existing deployment receipt; resume or verify it first');
    }
    // A branch field is a deploy alias on this manual site. Omit it, matching
    // Netlify CLI --prod, so production-scoped runtime variables are selected.
    const body = { draft: false, async: true, framework: 'static',
      files: Object.fromEntries(manifest.files.map((file) => [file.path, file.sha1])),
      functions: Object.fromEntries(manifest.functions.map((fn) => [fn.name, fn.sha256])),
      functions_config: Object.fromEntries(manifest.functions.map((fn) => [fn.name, {
        routes: fn.routes, excluded_routes: fn.excludedRoutes, priority: fn.priority,
      }])), function_schedules: [],
    };
    // Persist before the first write: even an uncertain creation response must
    // retain the original website ID and prevent a blind duplicate publication.
    await saveWebsiteBaseline(OUT, baseline, manifest);
    deploy = await api(`sites/${SITE}/deploys`, { method: 'POST', body, query: { title: 'Standalone mobile weather, AI reports and privacy' } });
    await recordMobileDeployId(OUT, manifest, deploy.id);
    await fs.writeFile(path.join(OUT, 'deploy-id.txt'), deploy.id + '\n');
    console.log(JSON.stringify({ deployId: deploy.id, siteId: SITE, state: deploy.state }));
  }
  await upload(manifest, deploy, baseline);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
