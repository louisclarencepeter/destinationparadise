import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const WEBSITE_ID = 'c97b6108-c09d-4cf9-88be-8439f69994c4';
const fingerprint = (manifest) => createHash('sha256').update(JSON.stringify(manifest)).digest('hex');

export async function captureWebsiteBaseline(readWebsite) {
  const website = await readWebsite();
  assert.equal(website.id, WEBSITE_ID, 'Unexpected website baseline target');
  assert.match(website.published_deploy?.id || '', /^[a-f0-9]{24}$/, 'Website has no published deployment');
  return { websiteId: WEBSITE_ID, publishedDeployId: website.published_deploy.id, capturedAt: new Date().toISOString() };
}

export async function assertWebsiteUnchanged(readWebsite, baseline) {
  assert.equal(baseline.websiteId, WEBSITE_ID, 'Unexpected preserved website');
  const current = await captureWebsiteBaseline(readWebsite);
  assert.equal(current.publishedDeployId, baseline.publishedDeployId, 'Website changed during this mobile release; review separately');
}

export async function saveWebsiteBaseline(directory, baseline, manifest, mobileDeployId = null) {
  if (mobileDeployId !== null) assert.match(mobileDeployId, /^[a-f0-9]{24}$/);
  await fs.writeFile(path.join(directory, 'website-baseline.json'), JSON.stringify({
    ...baseline, mobileDeployId, manifestSha256: fingerprint(manifest),
  }, null, 2) + '\n', { flag: 'wx' });
}

async function readReceipt(directory, manifest) {
  const baseline = JSON.parse(await fs.readFile(path.join(directory, 'website-baseline.json'), 'utf8'));
  assert.equal(baseline.websiteId, WEBSITE_ID);
  assert.match(baseline.publishedDeployId || '', /^[a-f0-9]{24}$/);
  assert.equal(baseline.manifestSha256, fingerprint(manifest), 'Artifacts changed since the website baseline was captured');
  return baseline;
}

export async function recordMobileDeployId(directory, manifest, mobileDeployId) {
  assert.match(mobileDeployId, /^[a-f0-9]{24}$/);
  const baseline = await readReceipt(directory, manifest);
  assert.equal(baseline.mobileDeployId, null, 'Mobile deployment already recorded');
  const filename = path.join(directory, 'website-baseline.json');
  // Keep the pre-request baseline intact if writing the returned ID is interrupted.
  await fs.writeFile(filename + '.tmp', JSON.stringify({ ...baseline, mobileDeployId }, null, 2) + '\n', { flag: 'wx' });
  await fs.rename(filename + '.tmp', filename);
}

export async function loadWebsiteBaseline(directory, manifest, mobileDeployId) {
  assert.match(mobileDeployId || '', /^[a-f0-9]{24}$/);
  const baseline = await readReceipt(directory, manifest);
  assert.equal(baseline.mobileDeployId, mobileDeployId, 'Use the deployment recorded with this website baseline; an interrupted creation needs provider reconciliation');
  return baseline;
}
