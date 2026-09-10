import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { WEBSITE_ID, captureWebsiteBaseline, assertWebsiteUnchanged, saveWebsiteBaseline, recordMobileDeployId, loadWebsiteBaseline } from './website-preservation.mjs';

test('uses the currently published website and rejects an intervening deployment', async () => {
  let publishedId = '111111111111111111111111';
  const readWebsite = async () => ({ id: WEBSITE_ID, published_deploy: { id: publishedId } });
  const baseline = await captureWebsiteBaseline(readWebsite);
  await assertWebsiteUnchanged(readWebsite, baseline);
  publishedId = '222222222222222222222222';
  await assert.rejects(assertWebsiteUnchanged(readWebsite, baseline), /Website changed/);
});

test('resume retains the original website baseline and binds it to the artifact and mobile deployment', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'dp-website-preservation-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const manifest = { siteId: 'mobile-site', files: [{ sha1: 'original' }] };
  const mobileDeployId = '333333333333333333333333';
  const baseline = await captureWebsiteBaseline(async () => ({ id: WEBSITE_ID, published_deploy: { id: '111111111111111111111111' } }));
  await saveWebsiteBaseline(directory, baseline, manifest);
  await assert.rejects(loadWebsiteBaseline(directory, manifest, mobileDeployId), /interrupted creation/);
  await recordMobileDeployId(directory, manifest, mobileDeployId);
  await assert.rejects(recordMobileDeployId(directory, manifest, mobileDeployId), /already recorded/);
  const resumed = await loadWebsiteBaseline(directory, manifest, mobileDeployId);
  await assert.rejects(assertWebsiteUnchanged(async () => ({ id: WEBSITE_ID, published_deploy: { id: '222222222222222222222222' } }), resumed), /Website changed/);
  await assert.rejects(loadWebsiteBaseline(directory, { ...manifest, files: [] }, mobileDeployId), /Artifacts changed/);
  await assert.rejects(loadWebsiteBaseline(directory, manifest, '444444444444444444444444'), /deployment recorded/);
  await assert.rejects(saveWebsiteBaseline(directory, baseline, manifest, mobileDeployId), /EEXIST/);
});

test('fails closed without an established website or original deployment receipt', async () => {
  await assert.rejects(captureWebsiteBaseline(async () => ({ id: WEBSITE_ID })), /no published/);
  await assert.rejects(captureWebsiteBaseline(async () => ({ id: 'wrong', published_deploy: { id: '111111111111111111111111' } })), /Unexpected website/);
  await assert.rejects(loadWebsiteBaseline(path.join(os.tmpdir(), 'dp-no-such-baseline'), {}, '333333333333333333333333'), /ENOENT/);
});
