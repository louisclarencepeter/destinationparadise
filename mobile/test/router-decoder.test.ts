import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const decode: (input: string) => string = require('decode-uri-component');
const query = require('query-string');
const routerPackage = path.dirname(require.resolve('expo-router/package.json'));
const { getStateFromPath } = require(path.join(routerPackage, 'build/react-navigation/core/getStateFromPath.js'));

test('the installed CommonJS decoder preserves valid Unicode and malformed input', () => {
  assert.equal(typeof decode, 'function');
  assert.equal(decode('Stone%20Town%20%E2%9C%93'), 'Stone Town ✓');
  assert.equal(decode('%F0%9F%8C%8A'), '🌊');
  assert.equal(decode('%C0%AF%41'), '%C0%AFA');
  assert.equal(decode('100%'), '100%');
  assert.equal(decode('%G1%20beach'), '%G1 beach');
  assert.throws(() => decode(null as unknown as string), TypeError);
});

test('query-string and the real Expo Router parser retain incoming-link behavior', () => {
  const search = 'destination=Stone+Town&tag=beach&tag=safari&utf=%E2%9C%93&bad=%C0%AF%41';
  const expected = { destination: 'Stone Town', tag: ['beach', 'safari'], utf: '✓', bad: '%C0%AFA' };
  assert.deepEqual({ ...query.parse(search) }, expected);
  const state = getStateFromPath(`/planner?${search}`, { screens: { Planner: 'planner' } });
  assert.equal(state.routes[0].name, 'Planner');
  assert.deepEqual(state.routes[0].params, expected);
  assert.deepEqual({ ...query.parse(query.stringify(expected)) }, expected);
});

test('a long malformed incoming query completes within a bounded CPU budget', () => {
  // Isolate the denial-of-service regression: a vulnerable decoder must time out
  // without hanging the test runner. The corrected scanner finishes in milliseconds.
  const script = `
    const assert = require('node:assert/strict');
    const query = require(${JSON.stringify(require.resolve('query-string'))});
    const malformed = '%C0%AF'.repeat(4000);
    const start = process.cpuUsage();
    const value = query.parse('destination=' + malformed + '%20Stone%20Town').destination;
    const elapsed = process.cpuUsage(start);
    assert.equal(value, malformed + ' Stone Town');
    assert.ok((elapsed.user + elapsed.system) / 1000 < 1500, 'decoder exceeded CPU budget');
  `;
  const result = spawnSync(process.execPath, ['-e', script], { timeout: 5000, encoding: 'utf8' });
  assert.equal(result.error, undefined, result.error?.message ?? 'decoder process must complete');
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr);
});
