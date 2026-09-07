import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

test('generated Android manifest keeps optional Nearby available without location hardware', () => {
  const config = JSON.parse(execFileSync(process.execPath, [
    require.resolve('expo/bin/cli'), 'config', '--type', 'introspect', '--json',
  ], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' }));
  const manifest = config._internal.modResults.android.manifest.manifest;
  const features: Array<{ $: Record<string, string> }> = manifest['uses-feature'];

  for (const name of ['android.hardware.location', 'android.hardware.location.network']) {
    const matching = features.filter((feature) => feature.$['android:name'] === name);
    assert.equal(matching.length, 1, `${name} must be declared exactly once`);
    assert.equal(matching[0].$['android:required'], 'false', `${name} must not filter devices`);
  }
  assert.equal(features.some((feature) => feature.$['android:name'] === 'android.hardware.location.gps'), false);

  const permissions: Array<{ $: Record<string, string> }> = manifest['uses-permission'];
  const locationPermissions = permissions.filter((permission) =>
    permission.$['android:name'].includes('LOCATION') && permission.$['tools:node'] !== 'remove');
  assert.deepEqual(locationPermissions.map((permission) => permission.$['android:name']), [
    'android.permission.ACCESS_COARSE_LOCATION',
  ]);
  for (const permission of [
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_BACKGROUND_LOCATION',
    'android.permission.FOREGROUND_SERVICE_LOCATION',
  ]) {
    assert.ok(permissions.some((entry) => entry.$['android:name'] === permission && entry.$['tools:node'] === 'remove'));
  }
});
