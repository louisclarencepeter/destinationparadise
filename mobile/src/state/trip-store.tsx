import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { destinations } from '@/src/data/content';
import { createStorageWriteQueue } from './storage-write-queue';
import { createDefaultPreferences, normalizePreferences, normalizeSavedIds, type TripPreferences } from './preferences';

export type { TripPreferences } from './preferences';
const STORAGE_KEY = 'destination-paradise:trip:v1';
type PreferenceUpdate = Partial<TripPreferences> | ((previous: TripPreferences) => Partial<TripPreferences>);
type TripStore = {
  preferences: TripPreferences;
  setPreferences: (update: PreferenceUpdate) => void;
  savedIds: string[];
  toggleSaved: (id: string) => void;
  hydrated: boolean;
  storageError: string | null;
  clearSavedData: () => void;
};

const Context = createContext<TripStore | null>(null);

export function TripStoreProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferencesState] = useState(createDefaultPreferences);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const skipInitialPersist = useRef(true);
  const writeQueue = useRef<ReturnType<typeof createStorageWriteQueue> | null>(null);
  if (!writeQueue.current) {
    writeQueue.current = createStorageWriteQueue(
      (serialized) => AsyncStorage.setItem(STORAGE_KEY, serialized),
      (result) => setStorageError(result === 'saved' ? null : 'This device could not save your preferences. Keep the app open to retain this trip.'),
    );
  }

  useEffect(() => {
    let disposed = false;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (disposed || !raw) return;
      const data = JSON.parse(raw);
      if (data.version !== 1) return;
      const next = normalizePreferences(data.preferences);
      if (next.destinationId && !destinations.some((place) => place.id === next.destinationId)) next.destinationId = null;
      setPreferencesState(next);
      setSavedIds(normalizeSavedIds(data.savedIds, destinations.map((place) => place.id)));
    }).catch(() => { if (!disposed) setStorageError('Saved preferences could not be loaded. You can still plan your trip.'); })
      .finally(() => { if (!disposed) setHydrated(true); });
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // Hydration is read-only. In particular, a transient read failure must never
    // overwrite an existing trip with the empty fallback before the user edits it.
    if (skipInitialPersist.current) { skipInitialPersist.current = false; return; }
    const serialized = JSON.stringify({ version: 1, preferences, savedIds });
    void writeQueue.current?.enqueue(serialized);
  }, [preferences, savedIds, hydrated]);

  const setPreferences = useCallback((update: PreferenceUpdate) => setPreferencesState((previous) => normalizePreferences({ ...previous, ...(typeof update === 'function' ? update(previous) : update) }, previous)), []);
  const toggleSaved = useCallback((id: string) => {
    if (!destinations.some((place) => place.id === id)) return;
    setSavedIds((previous) => previous.includes(id) ? previous.filter((saved) => saved !== id) : [...previous, id]);
  }, []);
  const clearSavedData = useCallback(() => {
    setPreferencesState(createDefaultPreferences());
    setSavedIds([]);
    setStorageError(null);
  }, []);
  const value = useMemo(() => ({ preferences, setPreferences, savedIds, toggleSaved, hydrated, storageError, clearSavedData }), [preferences, setPreferences, savedIds, toggleSaved, hydrated, storageError, clearSavedData]);
  return <Context value={value}>{children}</Context>;
}

export function useTripStore() {
  const store = use(Context);
  if (!store) throw new Error('useTripStore must be used inside TripStoreProvider');
  return store;
}
