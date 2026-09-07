import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  createNearbyLocationController, LOCATION_MAX_AGE_MS, normalizeLocation,
  type LocationPermission, type RawLocation,
} from '../src/features/nearby/location-service';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
const granted: LocationPermission = { status: 'granted', granted: true, canAskAgain: true };
const undetermined: LocationPermission = { status: 'undetermined', granted: false, canAskAgain: true };
const denied: LocationPermission = { status: 'denied', granted: false, canAskAgain: false };
const fix = (timestamp = Date.now(), accuracy = 800): RawLocation => ({ coords: { latitude: -6.162738, longitude: 39.189273, accuracy }, timestamp });
async function settleUntil(check: () => boolean) {
  for (let step = 0; step < 30 && !check(); step += 1) await Promise.resolve();
  assert.ok(check(), 'expected asynchronous stage was reached');
}
function fixture(t: TestContext, options: Partial<Parameters<typeof createNearbyLocationController>[0]> = {}) {
  const calls = { permission: 0, request: 0, position: 0, writes: [] as boolean[] };
  const controller = createNearbyLocationController({
    getPermission: async () => { calls.permission += 1; return granted; },
    requestPermission: async () => { calls.request += 1; return granted; },
    servicesEnabled: async () => true,
    getPosition: async () => { calls.position += 1; return fix(); },
    loadEnabled: async () => false,
    saveEnabled: async (enabled) => { calls.writes.push(enabled); },
    ...options,
  });
  t.after(() => controller.dispose());
  return { controller, calls };
}

test('fresh install hydration and refresh do not access or prompt for location', async (t) => {
  const { controller, calls } = fixture(t);
  assert.equal(await controller.hydrate(), false);
  await controller.refresh();
  assert.equal(controller.getState().status, 'off');
  assert.deepEqual(calls, { permission: 0, request: 0, position: 0, writes: [] });
});

test('restored opt-in stays idle until requested refresh and never automatically prompts', async (t) => {
  const { controller, calls } = fixture(t, { loadEnabled: async () => true, getPermission: async () => undetermined });
  assert.equal(await controller.hydrate(), true);
  assert.equal(controller.getState().status, 'idle');
  assert.equal(calls.position, 0);
  await controller.refresh();
  assert.equal(controller.getState().status, 'denied');
  assert.equal(calls.request, 0);
  assert.equal(calls.position, 0);
});

test('only explicit enable can request permission; saved data contains only the opt-in boolean', async (t) => {
  const { controller, calls } = fixture(t, { getPermission: async () => undetermined });
  await controller.enable();
  assert.equal(calls.request, 1);
  assert.equal(controller.getState().status, 'ready');
  assert.equal(controller.getState().location?.latitude, -6.163);
  assert.equal(controller.getState().location?.longitude, 39.189);
  controller.disable();
  await settleUntil(() => calls.writes.length === 2);
  assert.deepEqual(calls.writes, [true, false]);
  assert.equal(controller.getState().location, null);
});

test('permanent denial exposes settings recovery without requesting again', async (t) => {
  const { controller, calls } = fixture(t, { getPermission: async () => denied });
  await controller.enable();
  assert.equal(controller.getState().status, 'denied');
  assert.equal(controller.getState().canAskAgain, false);
  assert.equal(calls.request, 0);
  assert.equal(calls.position, 0);
});

test('refresh rechecks revoked permission and discards an earlier usable position', async (t) => {
  let permission = granted;
  const { controller, calls } = fixture(t, { getPermission: async () => permission });
  await controller.enable();
  assert.ok(controller.getState().location);
  permission = denied;
  await controller.refresh();
  assert.equal(controller.getState().location, null);
  assert.equal(controller.getState().status, 'denied');
  assert.equal(calls.position, 1);
  assert.equal(calls.request, 0);
});

test('disabled services clear a previous fix and skip requesting another', async (t) => {
  let enabled = true;
  const { controller, calls } = fixture(t, { servicesEnabled: async () => enabled });
  await controller.enable(); enabled = false;
  await controller.refresh();
  assert.equal(controller.getState().status, 'services-off');
  assert.equal(controller.getState().location, null);
  assert.equal(calls.position, 1);
});

test('disable while a native fix is pending cannot be undone by its late response', async (t) => {
  const position = deferred<RawLocation>(); let requested = false;
  const { controller } = fixture(t, { getPosition: () => { requested = true; return position.promise; } });
  const request = controller.enable();
  await settleUntil(() => requested);
  controller.disable(); position.resolve(fix()); await request;
  assert.equal(controller.getState().enabled, false);
  assert.equal(controller.getState().status, 'off');
  assert.equal(controller.getState().location, null);
});

test('disable during permission prompt never starts a fix after a late grant', async (t) => {
  const permission = deferred<LocationPermission>(); let prompted = false;
  const { controller, calls } = fixture(t, { getPermission: async () => undetermined, requestPermission: () => { prompted = true; return permission.promise; } });
  const request = controller.enable();
  await settleUntil(() => prompted);
  controller.disable(); permission.resolve(granted); await request;
  assert.equal(calls.position, 0);
  assert.equal(controller.getState().location, null);
  assert.equal(controller.getState().status, 'off');
});

test('cancel abandons an in-flight fix while retaining the optional enabled preference', async (t) => {
  const position = deferred<RawLocation>(); let requested = false;
  const { controller } = fixture(t, { getPosition: () => { requested = true; return position.promise; } });
  const request = controller.enable(); await settleUntil(() => requested);
  controller.cancel(); position.resolve(fix()); await request;
  assert.equal(controller.getState().enabled, true);
  assert.equal(controller.getState().status, 'idle');
  assert.equal(controller.getState().location, null);
});

test('a superseded fix cannot overwrite the newer refresh', async (t) => {
  const older = deferred<RawLocation>(); let calls = 0;
  const newer = { ...fix(), coords: { latitude: -5.7, longitude: 39.3, accuracy: 900 } };
  const { controller } = fixture(t, { getPosition: () => ++calls === 1 ? older.promise : Promise.resolve(newer) });
  const request = controller.enable(); await settleUntil(() => calls === 1);
  await controller.refresh(); older.resolve(fix()); await request;
  assert.equal(controller.getState().location?.latitude, -5.7);
});

test('timeout releases the UI and ignores eventual native completion', async (t) => {
  const position = deferred<RawLocation>();
  const { controller } = fixture(t, { getPosition: () => position.promise, timeoutMs: 5 });
  await controller.enable();
  assert.equal(controller.getState().status, 'timeout');
  position.resolve(fix()); await Promise.resolve(); await Promise.resolve();
  assert.equal(controller.getState().location, null);
  assert.equal(controller.getState().status, 'timeout');
});

test('unmount clears coordinates and prevents late state notifications', async (t) => {
  const position = deferred<RawLocation>(); let requested = false;
  const { controller } = fixture(t, { getPosition: () => { requested = true; return position.promise; } });
  let notifications = 0; controller.subscribe(() => { notifications += 1; });
  const request = controller.enable(); await settleUntil(() => requested);
  controller.dispose(); const count = notifications;
  position.resolve(fix()); await request;
  assert.equal(notifications, count);
  assert.equal(controller.getState().location, null);
});

test('a late stored opt-in cannot restore location after the user disabled it', async (t) => {
  const stored = deferred<boolean>();
  const { controller } = fixture(t, { loadEnabled: () => stored.promise });
  const hydration = controller.hydrate(); controller.disable(); stored.resolve(true);
  assert.equal(await hydration, false);
  assert.equal(controller.getState().enabled, false);
  assert.equal(controller.getState().hydrated, true);
});

test('stale and excessively uncertain positions are rejected without exposing coordinates', async (t) => {
  const now = Date.now(); let location = fix(now - LOCATION_MAX_AGE_MS - 1);
  const { controller } = fixture(t, { now: () => now, getPosition: async () => location });
  await controller.enable();
  assert.equal(controller.getState().status, 'stale');
  assert.equal(controller.getState().location, null);
  location = fix(now, 25_000); await controller.refresh();
  assert.equal(controller.getState().status, 'inaccurate');
  assert.equal(controller.getState().location, null);
});

test('valid coordinates expire in memory instead of silently ranking places indefinitely', async (t) => {
  const { controller } = fixture(t, { maxAgeMs: 35 });
  await controller.enable(); assert.equal(controller.getState().status, 'ready');
  await new Promise((resolve) => setTimeout(resolve, 55));
  assert.equal(controller.getState().status, 'stale');
  assert.equal(controller.getState().location, null);
});

test('browser explicit permission fix is used once rather than asking geolocation twice', async (t) => {
  const { controller, calls } = fixture(t, { getPermission: async () => undetermined, requestPermission: async () => ({ ...granted, position: fix() }) });
  await controller.enable();
  assert.equal(controller.getState().status, 'ready');
  assert.equal(calls.position, 0);
});

test('failed hydration remains off and never overwrites the stored choice', async (t) => {
  const { controller, calls } = fixture(t, { loadEnabled: async () => { throw new Error('Storage locked'); } });
  await controller.hydrate();
  assert.equal(controller.getState().enabled, false);
  assert.ok(controller.getState().storageError);
  assert.deepEqual(calls.writes, []);
});

test('invalid coordinates and future timestamps do not enter Nearby state', () => {
  const now = Date.now();
  assert.throws(() => normalizeLocation({ ...fix(now), coords: { latitude: NaN, longitude: 39, accuracy: 10 } }, now));
  assert.throws(() => normalizeLocation({ ...fix(now), coords: { latitude: 91, longitude: 39, accuracy: 10 } }, now));
  assert.throws(() => normalizeLocation(fix(now + 120_000), now));
  assert.equal(normalizeLocation(fix(now, 5), now).accuracyMeters, 150);
});
