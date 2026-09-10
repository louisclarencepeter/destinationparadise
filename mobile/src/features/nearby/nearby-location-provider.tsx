import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import {
  createInitialNearbyLocationState, createNearbyLocationController, LocationServiceError,
  LOCATION_TIMEOUT_MS, NEARBY_LOCATION_STORAGE_KEY,
  type LocationAdapter, type LocationPermission, type NearbyLocationController, type NearbyLocationState, type RawLocation,
} from './location-service';

export type NearbyLocationValue = NearbyLocationState & Pick<NearbyLocationController, 'enable' | 'refresh' | 'disable' | 'cancel'>;
const Context = createContext<NearbyLocationValue | null>(null);

function requireWebLocation() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined' || window.isSecureContext === false || !navigator.geolocation) throw new LocationServiceError('unavailable');
  return navigator.geolocation;
}

function webPosition(): Promise<RawLocation> {
  const geolocation = requireWebLocation();
  return new Promise((resolve, reject) => geolocation.getCurrentPosition(
    (position) => resolve({ coords: { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }, timestamp: position.timestamp }),
    reject,
    { enableHighAccuracy: false, maximumAge: 0, timeout: LOCATION_TIMEOUT_MS - 1000 },
  ));
}

function createAdapter(): LocationAdapter {
  if (Platform.OS !== 'web') return {
    getPermission: () => Location.getForegroundPermissionsAsync(),
    requestPermission: () => Location.requestForegroundPermissionsAsync(),
    servicesEnabled: () => Location.hasServicesEnabledAsync(),
    getPosition: () => Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, mayShowUserSettingsDialog: false }),
  };
  return {
    async getPermission() {
      requireWebLocation();
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return { status: permission.state === 'prompt' ? 'undetermined' : permission.state, granted: permission.state === 'granted', canAskAgain: permission.state !== 'denied' };
      } catch {
        // Some browsers cannot inspect grants. Never probe with a location request,
        // which could unexpectedly show a permission prompt during automatic refresh.
        return { status: 'undetermined', granted: false, canAskAgain: true };
      }
    },
    async requestPermission(): Promise<LocationPermission> {
      try {
        const position = await webPosition();
        return { status: 'granted', granted: true, canAskAgain: true, position };
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 1) return { status: 'denied', granted: false, canAskAgain: false };
        throw error;
      }
    },
    async servicesEnabled() { requireWebLocation(); return true; },
    getPosition: webPosition,
  };
}

export function NearbyLocationProvider({ children, refreshOnForeground = false }: PropsWithChildren<{ refreshOnForeground?: boolean }>) {
  const [state, setState] = useState(createInitialNearbyLocationState);
  const controller = useRef<NearbyLocationController | null>(null);
  const autoRefresh = useRef(refreshOnForeground);
  autoRefresh.current = refreshOnForeground;

  useEffect(() => {
    const service = createNearbyLocationController({
      ...createAdapter(),
      loadEnabled: async () => await AsyncStorage.getItem(NEARBY_LOCATION_STORAGE_KEY) === 'true',
      saveEnabled: (enabled) => AsyncStorage.setItem(NEARBY_LOCATION_STORAGE_KEY, String(enabled)),
    });
    controller.current = service;
    const unsubscribe = service.subscribe(setState);
    let mounted = true;
    let resumePending = AppState.currentState !== 'active';
    void service.hydrate().then((restoredOptIn) => {
      if (mounted && restoredOptIn && autoRefresh.current && AppState.currentState === 'active' && service.getState().enabled) void service.refresh();
    });
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') { resumePending = true; service.cancel(); }
      // Native permission sheets may briefly make iOS inactive. They are not a
      // new app visit and must not race/cancel the user's explicit enable action.
      if (next === 'active' && resumePending) {
        resumePending = false;
        if (autoRefresh.current && service.getState().hydrated && service.getState().enabled) void service.refresh();
      }
    });
    return () => {
      mounted = false; subscription.remove(); unsubscribe(); service.dispose();
      if (controller.current === service) controller.current = null;
    };
  }, []);

  const enable = useCallback(() => AppState.currentState === 'active' ? controller.current?.enable() ?? Promise.resolve() : Promise.resolve(), []);
  const refresh = useCallback(() => AppState.currentState === 'active' ? controller.current?.refresh() ?? Promise.resolve() : Promise.resolve(), []);
  const disable = useCallback(() => controller.current?.disable(), []);
  const cancel = useCallback(() => controller.current?.cancel(), []);
  const value = useMemo(() => ({ ...state, enable, refresh, disable, cancel }), [state, enable, refresh, disable, cancel]);
  return <Context value={value}>{children}</Context>;
}

export function useNearbyLocation() {
  const value = use(Context);
  if (!value) throw new Error('useNearbyLocation must be used inside NearbyLocationProvider');
  return value;
}
