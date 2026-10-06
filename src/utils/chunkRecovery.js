// A document reload resets both React.lazy's rejected promise and Vite's
// preload bookkeeping. Calling the same import factory again does neither.
export const CHUNK_RELOAD_KEY = 'dp-chunk-reload';
export const CHUNK_RELOAD_COOLDOWN_MS = 5 * 60 * 1000;
export const CHUNK_CLEANUP_TIMEOUT_MS = 2000;

/** @type {Promise<string> | null} */
let pendingRecovery = null;

export function isChunkLoadError(error) {
  return Boolean(error && (
    error.name === 'ChunkLoadError' ||
    /Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS for/i.test(error.message || '')
  ));
}

export function isChunkRecoveryPending() {
  return pendingRecovery !== null;
}

function claimReload(manual) {
  try {
    const storage = window.sessionStorage;
    const previous = storage.getItem(CHUNK_RELOAD_KEY);
    const attemptedAt = Number(previous);
    const now = Date.now();
    // Migrate the old permanent '1' flag and malformed records to a bounded
    // guard without automatically reloading a tab that may already be failing.
    if (previous && (!Number.isFinite(attemptedAt) || attemptedAt <= 1 || attemptedAt > now)) {
      storage.setItem(CHUNK_RELOAD_KEY, String(now));
      if (!manual) return false;
    } else if (!manual && previous && now - attemptedAt < CHUNK_RELOAD_COOLDOWN_MS) {
      return false;
    }
    storage.setItem(CHUNK_RELOAD_KEY, String(now));
    return true;
  } catch {
    // An in-memory guard cannot survive reloads. Without persistent storage,
    // only an explicit Retry may reload, otherwise a failure could loop.
    return manual ? true : null;
  }
}

async function clearAppShell(deadline) {
  const scope = new URL(import.meta.env.BASE_URL || '/', window.location.origin).href;
  const workerUrl = new URL('sw.js', scope).href;
  const mayClean = () => !deadline.expired && window.navigator.onLine !== false;

  await Promise.allSettled([
    (async () => {
      const registrations = await window.navigator.serviceWorker?.getRegistrations?.() || [];
      if (!mayClean()) return;
      await Promise.allSettled(registrations.filter((registration) => {
        const workers = [registration.active, registration.waiting, registration.installing];
        return registration.scope === scope && workers.some((worker) => worker?.scriptURL === workerUrl);
      }).map((registration) => registration.unregister()));
    })(),
    (async () => {
      if (!window.caches) return;
      const keys = await window.caches.keys();
      if (!mayClean()) return;
      // Keep other applications' caches, runtime caches, and all stored user
      // preferences/cart data. Workbox's default precache ID ends in SW scope.
      await Promise.allSettled(keys
        .filter((key) => key.startsWith('workbox-precache-') && key.endsWith(`-${scope}`))
        .map((key) => window.caches.delete(key)));
    })(),
  ]);
}

/** Reload once automatically in a short window, or when the visitor retries. */
export function recoverFromChunkError({ manual = false } = {}) {
  if (typeof window === 'undefined') return Promise.resolve('unsupported');
  if (pendingRecovery) return pendingRecovery;
  if (window.navigator.onLine === false) return Promise.resolve('offline');
  const claimed = claimReload(manual);
  if (claimed !== true) return Promise.resolve(claimed === null ? 'storage-unavailable' : 'recent-attempt');

  pendingRecovery = (async () => {
    const deadline = { expired: false };
    let timer;
    try {
      await Promise.race([
        clearAppShell(deadline),
        new Promise((resolve) => { timer = setTimeout(resolve, CHUNK_CLEANUP_TIMEOUT_MS); }),
      ]);
    } finally {
      deadline.expired = true;
      clearTimeout(timer);
    }
    if (window.navigator.onLine === false) return 'offline';
    try {
      window.location.reload();
      return 'reloading';
    } catch {
      return 'reload-failed';
    }
  })().finally(() => { pendingRecovery = null; });
  return pendingRecovery;
}
