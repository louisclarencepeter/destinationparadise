import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AnimatedPressable, useReducedMotion } from "@/src/components/motion";
import { colors, fonts } from "@/src/theme";
import MapFrame from "./map-frame";
import type { MapFrameHandle } from "./map-frame-types";
import { createMapDocument } from "./map-document";
import { MapData, MapPin, MapStatus, parseMapEvent } from "./map-protocol";

type Props = {
  pins: MapPin[];
  selectedId: string | null;
  fitKey: string;
  onSelect: (id: string) => void;
  statusInset?: number;
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
}: Props & { onRetry: () => void }) {
  const frame = useRef<MapFrameHandle>(null);
  const reducedMotion = useReducedMotion();
  const [status, setStatus] = useState<MapStatus>("loading");
  const [bridgeReady, setBridgeReady] = useState(false);
  const [token] = useState(
    () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  );
  const data = useMemo<MapData>(
    () => ({ pins, selectedId, fitKey, reducedMotion }),
    [pins, selectedId, fitKey, reducedMotion],
  );
  const initial = useRef(data).current;
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
    <View style={styles.container}>
      <MapFrame
        ref={frame}
        html={html}
        token={token}
        onMessage={onMessage}
        onError={fail}
      />
      <View style={styles.controls}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
          onPress={() => frame.current?.send({ type: "zoom", delta: 1 })}
          style={styles.control}
        >
          <Text style={styles.controlText}>+</Text>
        </AnimatedPressable>
        <View style={styles.divider} />
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
          onPress={() => frame.current?.send({ type: "zoom", delta: -1 })}
          style={styles.control}
        >
          <Text style={styles.controlText}>−</Text>
        </AnimatedPressable>
        <View style={styles.divider} />
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Fit all destinations"
          onPress={() => frame.current?.send({ type: "fit" })}
          style={styles.control}
        >
          <Text style={styles.fit}>⛶</Text>
        </AnimatedPressable>
      </View>
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
  control: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  controlText: { color: "#fff", fontSize: 26, lineHeight: 30 },
  fit: { color: "#fff", fontSize: 23 },
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
