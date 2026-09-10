import { createStorageWriteQueue } from '../../state/storage-write-queue';

export const NEARBY_LOCATION_STORAGE_KEY = 'destination-paradise:nearby-enabled:v1';
export const LOCATION_MAX_AGE_MS = 5 * 60 * 1000;
export const LOCATION_MAX_ACCURACY_METERS = 10_000;
export const LOCATION_TIMEOUT_MS = 30_000;

export type NearbyLocationStatus = 'off' | 'idle' | 'checking' | 'locating' | 'ready' | 'denied' | 'services-off' | 'unavailable' | 'timeout' | 'stale' | 'inaccurate';
export type NearbyPosition = { latitude: number; longitude: number; accuracyMeters: number | null; timestamp: number };
export type RawLocation = { coords: { latitude: number; longitude: number; accuracy: number | null }; timestamp: number };
export type LocationPermission = { status: 'undetermined' | 'granted' | 'denied'; granted: boolean; canAskAgain: boolean; position?: RawLocation };
export type NearbyLocationState = {
  enabled: boolean;
  hydrated: boolean;
  status: NearbyLocationStatus;
  location: NearbyPosition | null;
  permission: LocationPermission['status'] | null;
  canAskAgain: boolean;
  storageError: string | null;
};
export type LocationAdapter = {
  getPermission: () => Promise<LocationPermission>;
  requestPermission: () => Promise<LocationPermission>;
  servicesEnabled: () => Promise<boolean>;
  getPosition: () => Promise<RawLocation>;
};
type Dependencies = LocationAdapter & {
  loadEnabled: () => Promise<boolean>;
  saveEnabled: (enabled: boolean) => Promise<void>;
  now?: () => number;
  timeoutMs?: number;
  maxAgeMs?: number;
};

export class LocationServiceError extends Error {
  constructor(public readonly status: 'denied' | 'services-off' | 'unavailable' | 'timeout' | 'stale' | 'inaccurate') { super(status); }
}
class CancelledLocationRequest extends Error {}

export function createInitialNearbyLocationState(): NearbyLocationState {
  return { enabled: false, hydrated: false, status: 'off', location: null, permission: null, canAskAgain: true, storageError: null };
}

export function normalizeLocation(raw: RawLocation, now: number, maxAgeMs = LOCATION_MAX_AGE_MS): NearbyPosition {
  const { latitude, longitude, accuracy } = raw.coords;
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 || !Number.isFinite(raw.timestamp) || raw.timestamp > now + 60_000) throw new LocationServiceError('unavailable');
  if (now - raw.timestamp > maxAgeMs) throw new LocationServiceError('stale');
  if (accuracy !== null && (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > LOCATION_MAX_ACCURACY_METERS)) throw new LocationServiceError('inaccurate');
  return {
    latitude: Number(latitude.toFixed(3)), longitude: Number(longitude.toFixed(3)),
    accuracyMeters: accuracy === null ? null : Math.max(accuracy, 150), timestamp: raw.timestamp,
  };
}

function failureStatus(error: unknown): NearbyLocationStatus {
  if (error instanceof LocationServiceError) return error.status;
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
  if (code === 1 || code === 'E_LOCATION_UNAUTHORIZED' || code === 'ERR_LOCATION_UNAUTHORIZED') return 'denied';
  if (code === 3 || code === 'E_LOCATION_TIMEOUT') return 'timeout';
  if (code === 'E_LOCATION_SERVICES_DISABLED' || code === 'ERR_LOCATION_SERVICES_DISABLED' || code === 'E_LOCATION_SETTINGS_UNSATISFIED') return 'services-off';
  return 'unavailable';
}

function boundedRequest<T>(promise: Promise<T>, signal: AbortSignal, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const clean = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); };
    const fail = (error: unknown) => { clean(); reject(error); };
    const abort = () => fail(new CancelledLocationRequest());
    const timer = setTimeout(() => fail(new LocationServiceError('timeout')), timeoutMs);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    promise.then((value) => { clean(); resolve(value); }, fail);
  });
}

/** Coordinates live only in this controller. Storage receives a boolean opt-in. */
export function createNearbyLocationController(deps: Dependencies) {
  let state = createInitialNearbyLocationState();
  let disposed = false;
  let generation = 0;
  let preferenceRevision = 0;
  let activeRequest: AbortController | null = null;
  let expiry: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<(state: NearbyLocationState) => void>();
  const now = deps.now ?? Date.now;
  const maxAge = deps.maxAgeMs ?? LOCATION_MAX_AGE_MS;
  const timeout = deps.timeoutMs ?? LOCATION_TIMEOUT_MS;
  const publish = (patch: Partial<NearbyLocationState>) => {
    if (disposed) return;
    state = { ...state, ...patch };
    for (const listener of listeners) listener(state);
  };
  const writer = createStorageWriteQueue(
    (value) => deps.saveEnabled(value === 'true'),
    (result) => publish({ storageError: result === 'saved' ? null : 'Your Nearby preference could not be saved on this device.' }),
  );
  const invalidate = () => {
    generation += 1;
    activeRequest?.abort(); activeRequest = null;
    if (expiry) clearTimeout(expiry);
    expiry = null;
  };
  const run = async (allowPermissionPrompt: boolean) => {
    if (disposed || !state.enabled) return;
    invalidate();
    const revision = generation;
    const abort = new AbortController(); activeRequest = abort;
    const guard = () => { if (disposed || revision !== generation || abort.signal.aborted || !state.enabled) throw new CancelledLocationRequest(); };
    publish({ status: 'checking', location: null });
    try {
      const operation = async () => {
        let permission = await deps.getPermission(); guard();
        publish({ permission: permission.status, canAskAgain: permission.canAskAgain });
        if (!await deps.servicesEnabled()) { guard(); throw new LocationServiceError('services-off'); }
        guard();
        if (!permission.granted && allowPermissionPrompt && permission.canAskAgain) {
          permission = await deps.requestPermission(); guard();
          publish({ permission: permission.status, canAskAgain: permission.canAskAgain });
        }
        if (!permission.granted || permission.status !== 'granted') throw new LocationServiceError('denied');
        publish({ status: 'locating' });
        const raw = permission.position ?? await deps.getPosition(); guard();
        return normalizeLocation(raw, now(), maxAge);
      };
      const location = await boundedRequest(operation(), abort.signal, timeout); guard();
      publish({ location, status: 'ready' });
      expiry = setTimeout(() => {
        if (!disposed && revision === generation && state.enabled) publish({ status: 'stale', location: null });
      }, Math.max(1, location.timestamp + maxAge - now()));
    } catch (error) {
      if (error instanceof CancelledLocationRequest || disposed || revision !== generation) return;
      const status = failureStatus(error);
      // The native one-shot may finish after our deadline; its result cannot repopulate state.
      invalidate();
      publish({ status, location: null, ...(status === 'denied' ? { permission: 'denied' as const } : {}) });
    } finally {
      if (activeRequest === abort) activeRequest = null;
    }
  };
  return {
    getState: () => state,
    subscribe(listener: (state: NearbyLocationState) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async hydrate() {
      const revision = preferenceRevision;
      try {
        const enabled = await deps.loadEnabled();
        if (!disposed && revision === preferenceRevision) { publish({ enabled, status: enabled ? 'idle' : 'off' }); return enabled; }
        return false;
      } catch {
        if (revision === preferenceRevision) publish({ storageError: 'Your Nearby preference could not be loaded. Location stays off until you choose it.' });
        return false;
      }
      finally { publish({ hydrated: true }); }
    },
    async enable() {
      if (disposed) return;
      preferenceRevision += 1;
      publish({ enabled: true }); void writer.enqueue('true');
      await run(true);
    },
    refresh: () => run(false),
    disable() {
      if (disposed) return;
      preferenceRevision += 1; invalidate();
      publish({ enabled: false, status: 'off', location: null }); void writer.enqueue('false');
    },
    cancel() { invalidate(); publish({ status: state.enabled ? 'idle' : 'off', location: null }); },
    dispose() { invalidate(); disposed = true; state = { ...state, location: null }; listeners.clear(); },
  };
}

export type NearbyLocationController = ReturnType<typeof createNearbyLocationController>;
