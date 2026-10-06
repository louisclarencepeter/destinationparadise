import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGIN = 'https://yournexttriptoparadise.com';
const SCOPE = `${ORIGIN}/`;
const PRECACHE = `workbox-precache-v2-${SCOPE}`;
const NOW = new Date('2026-10-06T08:00:00.000Z');

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function storage(entries = []) {
  const values = new Map(entries);
  return {
    values,
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, String(value))),
    removeItem: vi.fn((key) => values.delete(key)),
    clear: vi.fn(() => values.clear()),
  };
}

function registration({ scope = SCOPE, scriptURL = `${SCOPE}sw.js`, state = 'active' } = {}) {
  return { scope, [state]: { scriptURL }, unregister: vi.fn().mockResolvedValue(true) };
}

let recovery;
let browser;
let appWorker;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.resetModules();
  appWorker = registration();
  browser = {
    location: { origin: ORIGIN, reload: vi.fn() },
    navigator: {
      onLine: true,
      serviceWorker: { getRegistrations: vi.fn().mockResolvedValue([appWorker]) },
    },
    caches: {
      keys: vi.fn().mockResolvedValue([PRECACHE]),
      delete: vi.fn().mockResolvedValue(true),
    },
    sessionStorage: storage([['booking-draft', '{"guests":2}']]),
    localStorage: storage([['dp_theme', 'dark'], ['dp_booking_cart', '{"items":["safari"]}']]),
  };
  vi.stubGlobal('window', browser);
  recovery = await import('../../src/utils/chunkRecovery.js');
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('recognizing recoverable asset loading failures', () => {
  it.each([
    { name: 'ChunkLoadError', message: 'Missing bundle' },
    new Error('Loading chunk route-42 failed'),
    new TypeError('Failed to fetch dynamically imported module: /assets/PackageDetail.js'),
    new TypeError('Importing a module script failed'),
    new TypeError('error loading dynamically imported module'),
    new Error(`Unable to preload CSS for ${ORIGIN}/assets/PlannerSection-Ch2t_fGt.css`),
  ])('recognizes supported browser and CSS errors: %s', (error) => {
    expect(recovery.isChunkLoadError(error)).toBe(true);
  });

  it.each([undefined, null, {}, new Error('Failed to fetch'), new Error('Payment failed'), new TypeError('Cannot read properties of undefined')])(
    'does not reload for unrelated errors: %s',
    (error) => { expect(recovery.isChunkLoadError(error)).toBe(false); },
  );
});

describe('app shell cleanup before reloading', () => {
  it('waits for both unregistering and deleting the app precache before reloading', async () => {
    const workerCleanup = deferred();
    const cacheCleanup = deferred();
    appWorker.unregister.mockReturnValue(workerCleanup.promise);
    browser.caches.delete.mockReturnValue(cacheCleanup.promise);

    const result = recovery.recoverFromChunkError();
    await vi.advanceTimersByTimeAsync(0);
    expect(appWorker.unregister).toHaveBeenCalledOnce();
    expect(browser.caches.delete).toHaveBeenCalledWith(PRECACHE);
    expect(browser.location.reload).not.toHaveBeenCalled();

    workerCleanup.resolve(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(browser.location.reload).not.toHaveBeenCalled();
    cacheCleanup.resolve(true);
    await expect(result).resolves.toBe('reloading');
    expect(browser.location.reload).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserves unrelated workers, runtime caches, preferences, and booking data', async () => {
    const waitingAppWorker = registration({ state: 'waiting' });
    const installingAppWorker = registration({ state: 'installing' });
    const otherScope = registration({ scope: `${SCOPE}other/`, scriptURL: `${SCOPE}other/sw.js` });
    const otherScript = registration({ scriptURL: `${SCOPE}another-worker.js` });
    const unknownWorker = { scope: SCOPE, unregister: vi.fn() };
    browser.navigator.serviceWorker.getRegistrations.mockResolvedValue([
      appWorker, waitingAppWorker, installingAppWorker, otherScope, otherScript, unknownWorker,
    ]);
    const appPrecacheV1 = `workbox-precache-v1-${SCOPE}`;
    browser.caches.keys.mockResolvedValue([
      PRECACHE, appPrecacheV1, `workbox-runtime-${SCOPE}`, `workbox-precache-v2-${SCOPE}other/`,
      'travel-images', 'booking-data', `custom-precache-${SCOPE}`,
    ]);

    await expect(recovery.recoverFromChunkError()).resolves.toBe('reloading');
    for (const worker of [appWorker, waitingAppWorker, installingAppWorker]) {
      expect(worker.unregister).toHaveBeenCalledOnce();
    }
    for (const worker of [otherScope, otherScript, unknownWorker]) {
      expect(worker.unregister).not.toHaveBeenCalled();
    }
    expect(browser.caches.delete.mock.calls.map(([key]) => key)).toEqual([PRECACHE, appPrecacheV1]);
    expect(browser.sessionStorage.values.get('booking-draft')).toBe('{"guests":2}');
    expect([...browser.localStorage.values]).toEqual([
      ['dp_theme', 'dark'], ['dp_booking_cart', '{"items":["safari"]}'],
    ]);
    expect(browser.sessionStorage.clear).not.toHaveBeenCalled();
    expect(browser.localStorage.clear).not.toHaveBeenCalled();
    expect(browser.localStorage.setItem).not.toHaveBeenCalled();
  });

  it('bounds stalled cleanup and ignores worker/cache lists arriving after the deadline', async () => {
    const workers = deferred();
    const cacheKeys = deferred();
    browser.navigator.serviceWorker.getRegistrations.mockReturnValue(workers.promise);
    browser.caches.keys.mockReturnValue(cacheKeys.promise);
    const result = recovery.recoverFromChunkError();

    await vi.advanceTimersByTimeAsync(recovery.CHUNK_CLEANUP_TIMEOUT_MS - 1);
    expect(browser.location.reload).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toBe('reloading');
    expect(recovery.isChunkRecoveryPending()).toBe(false);

    workers.resolve([appWorker]);
    cacheKeys.resolve([PRECACHE]);
    await vi.advanceTimersByTimeAsync(0);
    expect(appWorker.unregister).not.toHaveBeenCalled();
    expect(browser.caches.delete).not.toHaveBeenCalled();
    expect(browser.location.reload).toHaveBeenCalledOnce();
  });

  it('still reloads when worker/cache enumeration is rejected', async () => {
    browser.navigator.serviceWorker.getRegistrations.mockRejectedValue(new Error('Worker access denied'));
    browser.caches.keys.mockRejectedValue(new Error('Cache access denied'));
    await expect(recovery.recoverFromChunkError()).resolves.toBe('reloading');
    expect(browser.location.reload).toHaveBeenCalledOnce();
    expect(recovery.isChunkRecoveryPending()).toBe(false);
  });

  it('still reloads when individual cleanup operations are rejected', async () => {
    appWorker.unregister.mockRejectedValue(new Error('Unregister denied'));
    browser.caches.delete.mockRejectedValue(new Error('Delete denied'));
    await expect(recovery.recoverFromChunkError()).resolves.toBe('reloading');
    expect(browser.location.reload).toHaveBeenCalledOnce();
  });

  it('can reload when service workers and CacheStorage are unsupported', async () => {
    delete browser.navigator.serviceWorker;
    delete browser.caches;
    await expect(recovery.recoverFromChunkError()).resolves.toBe('reloading');
    expect(browser.location.reload).toHaveBeenCalledOnce();
  });

  it('shares an in-flight attempt even when another caller requests manual recovery', async () => {
    const workers = deferred();
    browser.navigator.serviceWorker.getRegistrations.mockReturnValue(workers.promise);
    const first = recovery.recoverFromChunkError();
    expect(recovery.isChunkRecoveryPending()).toBe(true);
    expect(recovery.recoverFromChunkError()).toBe(first);
    expect(recovery.recoverFromChunkError({ manual: true })).toBe(first);
    expect(browser.navigator.serviceWorker.getRegistrations).toHaveBeenCalledOnce();
    workers.resolve([appWorker]);
    await expect(first).resolves.toBe('reloading');
    expect(browser.location.reload).toHaveBeenCalledOnce();
    expect(recovery.isChunkRecoveryPending()).toBe(false);
  });
});

describe('persisted reload-loop protection', () => {
  it('blocks a rapid second attempt across module/document reinitialization but allows a later one', async () => {
    await expect(recovery.recoverFromChunkError()).resolves.toBe('reloading');
    expect(browser.sessionStorage.values.get(recovery.CHUNK_RELOAD_KEY)).toBe(String(NOW.getTime()));
    vi.resetModules();
    recovery = await import('../../src/utils/chunkRecovery.js');
    await vi.advanceTimersByTimeAsync(recovery.CHUNK_RELOAD_COOLDOWN_MS - 1);
    await expect(recovery.recoverFromChunkError()).resolves.toBe('recent-attempt');
    expect(browser.location.reload).toHaveBeenCalledOnce();
    expect(browser.navigator.serviceWorker.getRegistrations).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    await expect(recovery.recoverFromChunkError()).resolves.toBe('reloading');
    expect(browser.location.reload).toHaveBeenCalledTimes(2);
  });

  it.each(['1', 'garbled-record', '-7', String(NOW.getTime() + 60_000)])(
    'migrates an unsafe old guard %s without immediately reloading',
    async (value) => {
      browser.sessionStorage.values.set(recovery.CHUNK_RELOAD_KEY, value);
      await expect(recovery.recoverFromChunkError()).resolves.toBe('recent-attempt');
      expect(browser.sessionStorage.values.get(recovery.CHUNK_RELOAD_KEY)).toBe(String(NOW.getTime()));
      expect(browser.navigator.serviceWorker.getRegistrations).not.toHaveBeenCalled();
      expect(browser.location.reload).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(recovery.CHUNK_RELOAD_COOLDOWN_MS);
      await expect(recovery.recoverFromChunkError()).resolves.toBe('reloading');
    },
  );

  it.each(['1', 'malformed', String(NOW.getTime())])('permits an explicit Retry despite persisted guard %s', async (value) => {
    browser.sessionStorage.values.set(recovery.CHUNK_RELOAD_KEY, value);
    await expect(recovery.recoverFromChunkError({ manual: true })).resolves.toBe('reloading');
    expect(browser.location.reload).toHaveBeenCalledOnce();
  });

  it.each(['read', 'write', 'property'])('blocks automatic loops when sessionStorage %s is unavailable, while allowing Retry', async (failure) => {
    if (failure === 'read') browser.sessionStorage.getItem.mockImplementation(() => { throw new Error('Storage denied'); });
    if (failure === 'write') browser.sessionStorage.setItem.mockImplementation(() => { throw new Error('Quota exceeded'); });
    if (failure === 'property') Object.defineProperty(browser, 'sessionStorage', { get() { throw new Error('SecurityError'); } });
    await expect(recovery.recoverFromChunkError()).resolves.toBe('storage-unavailable');
    expect(browser.navigator.serviceWorker.getRegistrations).not.toHaveBeenCalled();
    expect(browser.caches.delete).not.toHaveBeenCalled();
    expect(browser.location.reload).not.toHaveBeenCalled();
    await expect(recovery.recoverFromChunkError({ manual: true })).resolves.toBe('reloading');
    expect(browser.location.reload).toHaveBeenCalledOnce();
  });
});

describe('offline and unavailable reload behavior', () => {
  it.each([false, true])('preserves the offline shell without cleanup or reload (manual=%s)', async (manual) => {
    browser.navigator.onLine = false;
    await expect(recovery.recoverFromChunkError({ manual })).resolves.toBe('offline');
    expect(browser.navigator.serviceWorker.getRegistrations).not.toHaveBeenCalled();
    expect(browser.caches.keys).not.toHaveBeenCalled();
    expect(browser.sessionStorage.setItem).not.toHaveBeenCalled();
    expect(browser.location.reload).not.toHaveBeenCalled();
    expect(recovery.isChunkRecoveryPending()).toBe(false);
  });

  it('does not clear or reload when the browser goes offline while cleanup discovery is pending', async () => {
    const workers = deferred();
    const cacheKeys = deferred();
    browser.navigator.serviceWorker.getRegistrations.mockReturnValue(workers.promise);
    browser.caches.keys.mockReturnValue(cacheKeys.promise);
    const result = recovery.recoverFromChunkError();
    browser.navigator.onLine = false;
    workers.resolve([appWorker]);
    cacheKeys.resolve([PRECACHE]);
    await expect(result).resolves.toBe('offline');
    expect(appWorker.unregister).not.toHaveBeenCalled();
    expect(browser.caches.delete).not.toHaveBeenCalled();
    expect(browser.location.reload).not.toHaveBeenCalled();
    expect(recovery.isChunkRecoveryPending()).toBe(false);
  });

  it('does not reload if connectivity is lost while previously started cleanup finishes', async () => {
    const cacheCleanup = deferred();
    browser.caches.delete.mockReturnValue(cacheCleanup.promise);
    const result = recovery.recoverFromChunkError();
    await vi.advanceTimersByTimeAsync(0);
    expect(browser.caches.delete).toHaveBeenCalledOnce();
    browser.navigator.onLine = false;
    cacheCleanup.resolve(true);
    await expect(result).resolves.toBe('offline');
    expect(browser.location.reload).not.toHaveBeenCalled();
  });

  it('returns a usable fallback status if reload throws and permits a later explicit Retry', async () => {
    browser.location.reload.mockImplementationOnce(() => { throw new Error('Reload blocked'); });
    await expect(recovery.recoverFromChunkError()).resolves.toBe('reload-failed');
    expect(recovery.isChunkRecoveryPending()).toBe(false);
    await expect(recovery.recoverFromChunkError()).resolves.toBe('recent-attempt');
    await expect(recovery.recoverFromChunkError({ manual: true })).resolves.toBe('reloading');
    expect(browser.location.reload).toHaveBeenCalledTimes(2);
  });

  it('is safe without a browser environment', async () => {
    vi.stubGlobal('window', undefined);
    await expect(recovery.recoverFromChunkError()).resolves.toBe('unsupported');
    expect(recovery.isChunkRecoveryPending()).toBe(false);
  });
});
