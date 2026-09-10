import { createContext, use, useEffect, useLayoutEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, type PressableProps, type ViewProps } from 'react-native';

// Start conservatively until the native accessibility preference is known.
const ReducedMotionContext = createContext(true);
export function MotionProvider({ children }: PropsWithChildren) {
  const [reduced, setReduced] = useState(() => process.env.EXPO_OS === 'web' && typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : true);
  useEffect(() => {
    if (process.env.EXPO_OS === 'web' && typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setReduced(media.matches);
      update();
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    let active = true;
    let eventReceived = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      eventReceived = true;
      if (active) setReduced(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active && !eventReceived) setReduced(value);
    }).catch(() => { /* Keep reduced motion if the preference is unavailable. */ });
    return () => { active = false; subscription.remove(); };
  }, []);
  return <ReducedMotionContext value={reduced}>{children}</ReducedMotionContext>;
}
export function useReducedMotion() { return use(ReducedMotionContext); }
const nativeDriver = process.env.EXPO_OS !== 'web';

/** Animate content in place: keys trigger motion without remounting forms/maps. */
export function Reveal({ motionKey, delay = 0, style, ...props }: ViewProps & { motionKey?: string | number; delay?: number }) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useLayoutEffect(() => {
    progress.stopAnimation();
    if (reduced) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: 1, duration: 240, delay: Math.max(0, Math.min(delay, 180)), easing: Easing.out(Easing.cubic), useNativeDriver: nativeDriver, isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [motionKey, reduced, delay, progress]);
  return <Animated.View {...props} style={[style, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]} />;
}

const NativePressable = Animated.createAnimatedComponent(Pressable);
/** Native-driver press feedback; disabled controls never start an animation. */
export function AnimatedPressable({ style, onPressIn, onPressOut, onHoverIn, onHoverOut, disabled, ...props }: PressableProps) {
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (disabled || reduced) { scale.stopAnimation(); scale.setValue(1); }
    if (disabled) setPressed(false);
  }, [disabled, reduced, scale]);
  useEffect(() => () => scale.stopAnimation(), [scale]);
  function animate(toValue: number) {
    scale.stopAnimation();
    if (disabled || reduced) { scale.setValue(1); return; }
    Animated.spring(scale, { toValue, speed: 32, bounciness: 0, useNativeDriver: nativeDriver, isInteraction: false }).start();
  }
  const resolvedStyle = typeof style === 'function' ? style({ pressed, hovered }) : style;
  const baseTransform = StyleSheet.flatten(resolvedStyle)?.transform;
  // Preserve caller positioning/rotation. String transforms remain intact;
  // array transforms can safely compose with native-driver press feedback.
  const transform = Array.isArray(baseTransform) ? [...baseTransform, { scale }] : baseTransform ?? [{ scale }];
  return <NativePressable {...props} disabled={disabled}
    onPressIn={(event) => { setPressed(true); if (!disabled) animate(0.975); onPressIn?.(event); }}
    onPressOut={(event) => { setPressed(false); animate(1); onPressOut?.(event); }}
    onHoverIn={(event) => { setHovered(true); onHoverIn?.(event); }}
    onHoverOut={(event) => { setHovered(false); onHoverOut?.(event); }}
    style={[resolvedStyle, { transform }]} />;
}

export function TabSymbol({ selected, children }: PropsWithChildren<{ selected: boolean }>) {
  const reduced = useReducedMotion();
  const value = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    value.stopAnimation();
    if (reduced) { value.setValue(0); return; }
    const animation = Animated.spring(value, { toValue: selected ? 1 : 0, speed: 22, bounciness: 0, useNativeDriver: nativeDriver, isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [selected, reduced, value]);
  return <Animated.View style={{ transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }, { scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}>{children}</Animated.View>;
}
