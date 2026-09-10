import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AnimatedPressable, useReducedMotion } from "@/src/components/motion";
import { Icon } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme";
import MapFrame from "./map-frame";
import type { MapFrameHandle } from "./map-frame-types";
import { createMapDocument } from "./map-document";
import {
  MapData,
  MapPin,
  MapStatus,
  MapUserLocation,
  isMapUserLocation,
  parseMapEvent,
} from "./map-protocol";

type Props = {
  pins: MapPin[];
  selectedId: string | null;
  fitKey: string;
  onSelect: (id: string) => void;
  statusInset?: number;
  userLocation?: MapUserLocation | null;
  onLocate?: () => void;
  locating?: boolean;
  locationLabel?: string;
};

export default function DestinationMap(props: Props) {
  const [generation, setGeneration] = useState(0);
  return (
    <MapSession
      key={generation}
      {...props}
      onRetry={() => setGeneration((value) => value + 1)}
    />
  );
}

function MapSession({
  pins,
  selectedId,
  fitKey,
  onSelect,
  onRetry,
  statusInset = 0,
  userLocation,
  onLocate,
  locating = false,
  locationLabel,
}: Props & { onRetry: () => void }) {
  const frame = useRef<MapFrameHandle>(null);
  const reducedMotion = useReducedMotion();
  const [status, setStatus] = useState<MapStatus>("loading");
  const [bridgeReady, setBridgeReady] = useState(false);
  const [compactControls, setCompactControls] = useState(false);
  const [token] = useState(
    () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  );
  const data = useMemo<MapData>(
    () => ({
      pins,
      selectedId,
      fitKey,
      reducedMotion,
      userLocation: isMapUserLocation(userLocation) ? userLocation : null,
    }),
    [pins, selectedId, fitKey, reducedMotion, userLocation],
  );
  // Keep a device fix out of the retained document and its initial config.
  // The ready bridge receives the current fix and clears it on opt-out.
  const initial = useRef<MapData>({ ...data, userLocation: null }).current;
  const html = useMemo(
    () =>
      createMapDocument(
        token,
        initial,
        process.env.EXPO_OS === "web" && typeof window !== "undefined"
          ? window.location.origin
          : undefined,
      ),
    [token, initial],
  );
  const ids = useMemo(() => new Set(pins.map((pin) => pin.id)), [pins]);
  const onMessage = useCallback(
    (raw: unknown) => {
      const message = parseMapEvent(raw, token, ids);
      if (!message) return;
      if (message.type === "ready") setBridgeReady(true);
      if (message.type === "status") setStatus(message.status);
      if (message.type === "select") onSelect(message.id);
      if (message.type === "link")
        void Linking.openURL(message.url).catch(() => undefined);
    },
    [token, ids, onSelect],
  );
  useEffect(() => {
    if (bridgeReady) frame.current?.send({ type: "update", data });
  }, [data, bridgeReady]);
  useEffect(() => {
    const timeout = setTimeout(
      () => setStatus((current) => (current === "loading" ? "error" : current)),
      18000,
    );
    return () => clearTimeout(timeout);
  }, []);
  const fail = useCallback(() => setStatus("error"), []);
  return (
    <View
      style={styles.container}
      onLayout={({ nativeEvent }) =>
        setCompactControls(nativeEvent.layout.height < 250)
      }
    >
      <MapFrame
        ref={frame}
        html={html}
        token={token}
        onMessage={onMessage}
        onError={fail}
      />
      <View style={[styles.controls, compactControls && styles.compactControls]}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
          onPress={() => frame.current?.send({ type: "zoom", delta: 1 })}
          style={styles.control}
        >
          <Text style={styles.controlText}>+</Text>
        </AnimatedPressable>
        <View style={compactControls ? styles.compactDivider : styles.divider} />
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
          onPress={() => frame.current?.send({ type: "zoom", delta: -1 })}
          style={styles.control}
        >
          <Text style={styles.controlText}>−</Text>
        </AnimatedPressable>
        <View style={compactControls ? styles.compactDivider : styles.divider} />
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={
            data.userLocation
              ? "Fit nearby places and your location"
              : "Fit all destinations"
          }
          onPress={() => frame.current?.send({ type: "fit" })}
          style={styles.control}
        >
          <Text style={styles.fit}>⛶</Text>
        </AnimatedPressable>
      </View>
      {(onLocate || data.userLocation) && (
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={
            locating
              ? "Finding your location"
              : locationLabel ||
                (data.userLocation ? "Center on my location" : "Use my location")
          }
          accessibilityState={{ disabled: locating, busy: locating }}
          disabled={locating}
          testID="map-location-control"
          onPress={() => {
            if (data.userLocation) frame.current?.send({ type: "recenter" });
            else onLocate?.();
          }}
          style={styles.locate}
        >
          {locating ? (
            <ActivityIndicator color={colors.coral} />
          ) : (
            <Icon
              name="compass"
              size={24}
              color={data.userLocation ? colors.coral : colors.text}
            />
          )}
        </AnimatedPressable>
      )}
      {status === "loading" && (
        <View style={[styles.loading, { top: 16 + statusInset }]}>
          <ActivityIndicator color={colors.coral} />
          <Text style={styles.statusText}>Loading map…</Text>
        </View>
      )}
      {status === "error" && (
        <View style={styles.error} accessibilityLiveRegion="polite">
          <Text selectable style={styles.errorTitle}>
            Map connection unavailable
          </Text>
          <Text selectable style={styles.errorText}>
            Try again when you’re online, or browse the same places in List
            view.
          </Text>
          <AnimatedPressable
            accessibilityRole="button"
            onPress={onRetry}
            style={styles.retry}
          >
            <Text style={styles.retryText}>Retry map</Text>
          </AnimatedPressable>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, position: "relative", backgroundColor: "#0b2839" },
  controls: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "#071c2bee",
    borderWidth: 1,
    borderColor: "#ffffff26",
    borderRadius: 14,
    overflow: "hidden",
  },
  compactControls: { flexDirection: "row" },
  compactDivider: { width: 1, backgroundColor: "#ffffff26" },
  control: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  controlText: { color: "#fff", fontSize: 26, lineHeight: 30 },
  fit: { color: "#fff", fontSize: 23 },
  locate: {
    position: "absolute",
    bottom: 40,
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#071c2bee",
    borderWidth: 1,
    borderColor: "#ffffff40",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: "#ffffff26" },
  loading: {
    pointerEvents: "none",
    position: "absolute",
    top: 16,
    left: 16,
    right: 76,
    backgroundColor: "#071c2bee",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  statusText: {
    color: colors.textSecondary,
    fontFamily: fonts.sans,
    fontSize: 12,
  },
  error: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "30%",
    padding: 22,
    backgroundColor: "#071c2bf5",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 10,
  },
  errorTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retry: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: colors.coral,
  },
  retryText: { color: "#071c2b", fontFamily: fonts.sansBold, fontSize: 13 },
});
