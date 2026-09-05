import { PropsWithChildren, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedPressable, useReducedMotion } from "@/src/components/motion";
import { colors, fonts } from "@/src/theme";
import Svg, { Path, Circle } from "react-native-svg";

type Glyph =
  "heart" | "search" | "map" | "list" | "close" | "arrow" | "back" | "external";
export function ExploreIcon({
  name,
  size = 20,
  color = colors.text,
  filled = false,
}: {
  name: Glyph;
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "heart" && (
        <Path
          fill={filled ? color : "none"}
          d="M12 20.5S3.5 15.3 3.5 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.6c0 5.7-8.5 10.9-8.5 10.9Z"
        />
      )}
      {name === "search" && (
        <>
          <Circle cx="10.5" cy="10.5" r="6.5" />
          <Path d="m16 16 5 5" />
        </>
      )}
      {name === "map" && (
        <>
          <Path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2Z" />
          <Path d="M9 3v15M15 6v15" />
        </>
      )}
      {name === "list" && <Path d="M4 6h16M4 12h16M4 18h16" />}
      {name === "close" && <Path d="m6 6 12 12M6 18 18 6" />}
      {name === "arrow" && <Path d="M3 12h18m-7-7 7 7-7 7" />}
      {name === "back" && <Path d="M21 12H3m7 7-7-7 7-7" />}
      {name === "external" && <Path d="M13 4h7v7m0-7-10 10M10 5H5v15h15v-5" />}
    </Svg>
  );
}
export function Label({
  children,
  style,
}: PropsWithChildren<{ style?: TextStyle }>) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}
export function IconButton({
  name,
  label,
  onPress,
  active,
  count,
}: {
  name: Glyph;
  label: string;
  onPress: () => void;
  active?: boolean;
  count?: number;
}) {
  const reducedMotion = useReducedMotion();
  const heartScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reducedMotion) {
      heartScale.stopAnimation();
      heartScale.setValue(1);
    }
    return () => heartScale.stopAnimation();
  }, [reducedMotion, heartScale]);
  function press() {
    // Only confirm an actual new save, never a render, filter or map selection.
    if (name === "heart" && count === undefined && !active && !reducedMotion) {
      heartScale.stopAnimation();
      heartScale.setValue(1);
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.16,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: process.env.EXPO_OS !== "web",
          isInteraction: false,
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 170,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: process.env.EXPO_OS !== "web",
          isInteraction: false,
        }),
      ]).start();
    } else {
      heartScale.stopAnimation();
      heartScale.setValue(1);
    }
    onPress();
  }
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={press}
      style={({ pressed }) => [
        styles.iconButton,
        active && { borderColor: colors.coral },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: heartScale }] }}>
        <ExploreIcon
          name={name}
          color={active ? colors.coral : colors.text}
          filled={active}
        />
      </Animated.View>
      {count !== undefined && count > 0 && (
        <Text style={styles.count}>{count}</Text>
      )}
    </AnimatedPressable>
  );
}
export function GradientButton({
  children,
  onPress,
  label,
}: PropsWithChildren<{ onPress: () => void; label?: string }>) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <LinearGradient
        colors={["#16425c", "#bd493c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{children}</Text>
        <ExploreIcon name="arrow" size={19} />
      </LinearGradient>
    </AnimatedPressable>
  );
}
export function DestinationImage({
  uri,
  label,
  height = 210,
  representative = false,
}: {
  uri: string;
  label: string;
  height?: number;
  representative?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();
  // Native Expo Image needs measured dimensions before it can select a source.
  return (
    <View
      style={{
        height,
        backgroundColor: colors.surfaceRaised,
        overflow: "hidden",
      }}
    >
      {!failed && !!uri && (
        <Image
          source={{ uri }}
          recyclingKey={uri}
          accessibilityLabel={label}
          style={{ width: "100%", height }}
          contentFit="cover"
          transition={reducedMotion ? 0 : 180}
          cachePolicy="memory-disk"
          onError={() => setFailed(true)}
        />
      )}
      {(failed || !uri) && (
        <View style={styles.imageFallback}>
          <ExploreIcon name="map" size={30} color={colors.muted} />
          <Text style={styles.fallbackText}>{label}</Text>
        </View>
      )}
      <LinearGradient
        colors={["#071c2b00", "#071c2b22", "#071c2bf0"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {representative && (
        <Text style={styles.imageCaption}>
          Safari inspiration · representative photo
        </Text>
      )}
    </View>
  );
}
export function ExternalRow({
  label,
  detail,
  url,
}: {
  label: string;
  detail?: string;
  url: string | null;
}) {
  const [error, setError] = useState(false);
  return (
    <View>
      <AnimatedPressable
        accessibilityRole="link"
        accessibilityLabel={`${label}. Opens website`}
        disabled={!url}
        onPress={() => {
          if (url) {
            setError(false);
            void Linking.openURL(url).catch(() => setError(true));
          }
        }}
        style={({ pressed }) => [styles.external, pressed && { opacity: 0.7 }]}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.externalLabel}>{label}</Text>
          {detail && <Text style={styles.externalDetail}>{detail}</Text>}
        </View>
        <ExploreIcon name="external" size={17} color={colors.coral} />
      </AnimatedPressable>
      {error && (
        <Text selectable style={styles.error}>
          Couldn’t open this link. Please try again.
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.muted,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  count: {
    position: "absolute",
    right: 3,
    top: 2,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 3,
    color: colors.coral,
    fontSize: 10,
    fontFamily: fonts.sansBold,
  },
  button: {
    minHeight: 50,
    borderRadius: 13,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#ffffff1a",
  },
  buttonText: {
    fontFamily: fonts.sansBold,
    color: colors.text,
    fontSize: 14,
    flexShrink: 1,
    textAlign: "center",
  },
  imageCaption: {
    position: "absolute",
    top: 66,
    left: 12,
    right: 12,
    fontFamily: fonts.sans,
    fontSize: 9,
    color: "#fff",
    backgroundColor: "#071c2bbd",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 25,
  },
  fallbackText: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.textSecondary,
  },
  external: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  externalLabel: {
    color: colors.text,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    lineHeight: 20,
  },
  externalDetail: {
    color: colors.muted,
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
  },
  error: {
    color: colors.coral,
    fontFamily: fonts.sans,
    fontSize: 12,
    padding: 8,
  },
});
