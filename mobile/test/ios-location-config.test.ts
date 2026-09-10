import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

test('generated iOS permissions disclose linked motion APIs without enabling background location', () => {
  const config = JSON.parse(execFileSync(process.execPath, [
    require.resolve('expo/bin/cli'), 'config', '--type', 'introspect', '--json',
  ], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' }));
  const infoPlist = config._internal.modResults.ios.infoPlist;

  // Expo Location links CoreMotion even when Nearby never calls its motion APIs.
  // Omitting this key caused App Store Connect processing error ITMS-90683.
  assert.equal(infoPlist.NSMotionUsageDescription,
    'Destination Paradise does not access motion or fitness data. Nearby suggestions use only your approximate location.');
  assert.equal(infoPlist.NSLocationDefaultAccuracyReduced, true);
  assert.match(infoPlist.NSLocationWhenInUseUsageDescription, /approximate location/);
  assert.equal(infoPlist.NSLocationAlwaysUsageDescription, undefined);
  assert.equal(infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription, undefined);
  assert.equal((infoPlist.UIBackgroundModes ?? []).includes('location'), false);
});
