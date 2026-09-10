import { useCallback, useId, useRef } from 'react';
import { Animated, AppState, Easing, View, type AppStateStatus } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import type { WeatherSnapshot } from '@/src/api';
import { useReducedMotion } from '@/src/components/motion';
import { weatherSceneState } from './weather-scene-state';

const CLOUD_PATH = 'M24 62C10 62 3 54 3 44C3 34 10 27 20 26C22 12 33 4 46 5C58 5 68 13 71 24C77 19 83 17 91 19C102 21 108 30 108 40C122 39 130 44 130 53C130 60 124 65 112 65H26Z';
const RAYS = [[80, 22, 80, 29], [108, 34, 103, 39], [120, 62, 113, 62], [108, 90, 103, 85], [80, 102, 80, 95], [52, 90, 57, 85], [40, 62, 47, 62], [52, 34, 57, 39]];
const STARS = [[129, 36, 1.7], [145, 67, 1.1], [36, 63, 1.1], [48, 29, 1.5], [132, 97, .9]];
const PARTICLES = [{ x: 47, y: 116, offset: 0 }, { x: 65, y: 121, offset: .24 }, { x: 86, y: 118, offset: .49 }, { x: 108, y: 122, offset: .72 }, { x: 127, y: 115, offset: .9 }];
const useNativeDriver = process.env.EXPO_OS !== 'web';

/** Decorative weather art: the surrounding card owns the readable condition and source. */
export function WeatherScene({ weather, size = 136, paused = false }: { weather: WeatherSnapshot; size?: number; paused?: boolean }) {
  const state = weatherSceneState(weather.weatherCode, weather.isDay);
  const reducedMotion = useReducedMotion();
  const drift = useRef(new Animated.Value(.5)).current;
  const precipitation = useRef(new Animated.Value(.42)).current;
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const glowId = `weatherGlow${id}`;
  const moonId = `weatherMoon${id}`;
  const cloudId = `weatherCloud${id}`;

  useFocusEffect(useCallback(() => {
    let animations: Animated.CompositeAnimation[] = [];
    function stop() {
      animations.forEach((animation) => animation.stop());
      animations = [];
      drift.stopAnimation();
      precipitation.stopAnimation();
      drift.setValue(.5);
      precipitation.setValue(.42);
    }
    function update(appState: AppStateStatus) {
      stop();
      if (paused || reducedMotion || appState !== 'active' || state.kind === 'unknown') return;
      const atmosphere = Animated.loop(Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver, isInteraction: false }),
        Animated.timing(drift, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver, isInteraction: false }),
      ]), { resetBeforeIteration: false });
      animations.push(atmosphere);
      if (state.precipitation !== 'none') {
        precipitation.setValue(0);
        animations.push(Animated.loop(Animated.timing(precipitation, {
          toValue: 1, duration: state.precipitation === 'snow' ? 3900 : state.kind === 'drizzle' ? 3000 : 2300,
          easing: Easing.linear, useNativeDriver, isInteraction: false,
        })));
      }
      animations.forEach((animation) => animation.start());
    }
    update(AppState.currentState);
    const subscription = AppState.addEventListener('change', update);
    return () => { subscription.remove(); stop(); };
  }, [drift, precipitation, paused, reducedMotion, state.kind, state.precipitation]));

  const cloudShift = drift.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });
  const softLift = drift.interpolate({ inputRange: [0, 1], outputRange: [2, -2] });
  const isDarkCloud = ['overcast', 'rain', 'thunder'].includes(state.kind);
  const isSnow = state.precipitation === 'snow';
  const celestialColor = state.celestial === 'sun' ? '#F2A899' : '#C3E0EF';

  return <View testID="weather-scene" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, flexShrink: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    <View style={{ position: 'absolute', width: 180, height: 180, left: (size - 180) / 2, top: (size - 180) / 2, transform: [{ scale: size / 180 }], pointerEvents: 'none' }}>
      <Svg width={180} height={180} viewBox="0 0 180 180" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id={glowId} cx="48%" cy="42%" r="58%"><Stop offset="0%" stopColor={celestialColor} stopOpacity={0.13} /><Stop offset="70%" stopColor="#335A70" stopOpacity={0.06} /><Stop offset="100%" stopColor="#071C2B" stopOpacity={0} /></RadialGradient>
        </Defs>
        <Circle cx="90" cy="88" r="79" fill={`url(#${glowId})`} />
        <Ellipse cx="90" cy="157" rx="53" ry="7" fill="#051623" opacity=".36" />
        <Path d="M23 151c25-5 51-5 75 0m9 0c18 3 35 2 49-1" stroke="#3E6075" strokeWidth="1" opacity=".23" strokeLinecap="round" />
      </Svg>

      {state.celestial === 'moon' ? <Animated.View style={{ position: 'absolute', width: 180, height: 180, opacity: drift.interpolate({ inputRange: [0, 1], outputRange: [.48, .8] }) }}>
        <Svg width={180} height={180}>{STARS.map(([x, y, radius], index) => <Circle key={index} cx={x} cy={y} r={radius} fill="#BED8E7" />)}<Path d="M141 27v7m-3.5-3.5h7" stroke="#C9DEEA" strokeWidth=".8" opacity=".5" /></Svg>
      </Animated.View> : null}

      {state.celestial !== 'none' ? <Animated.View style={{ position: 'absolute', width: 180, height: 180, transform: [{ translateY: softLift }, { rotate: drift.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] }) }] }}>
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Defs><LinearGradient id={moonId} x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0" stopColor={state.celestial === 'sun' ? '#FFD2C2' : '#E3F2FA'} /><Stop offset="1" stopColor={state.celestial === 'sun' ? '#D87E70' : '#8EB6CE'} /></LinearGradient></Defs>
          {state.celestial === 'sun' ? <>
            <Circle cx="80" cy="62" r="34" stroke="#E99A87" strokeWidth=".7" fill="none" opacity=".12" />
            <G stroke="#E7A291" strokeWidth="1.8" strokeLinecap="round" opacity=".55">{RAYS.map(([x1, y1, x2, y2], index) => <Line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />)}</G>
            <Circle cx="80" cy="62" r="25" fill={`url(#${moonId})`} />
            <Path d="M65 46a21 21 0 0 1 22-4" stroke="#FFE1D5" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".5" />
          </> : <>
            <Path d="M99 32C79 32 63 48 63 68C63 88 79 104 99 104C109 104 118 100 125 93C103 97 85 81 85 60C85 49 90 39 99 32Z" fill={`url(#${moonId})`} />
            <Path d="M86 39C74 44 67 55 67 68C67 85 80 99 97 100" fill="none" stroke="#E9F5FB" strokeWidth="1.1" opacity=".45" strokeLinecap="round" />
          </>}
        </Svg>
      </Animated.View> : null}

      {state.clouds > 0 ? <Animated.View style={{ position: 'absolute', left: state.clouds === 1 ? 56 : 41, top: state.clouds === 1 ? 94 : 65, width: 124, height: 71, transform: [{ translateX: cloudShift }, { translateY: softLift }], opacity: state.kind === 'mostly-clear' ? .58 : .85 }}>
        <Svg width={state.clouds === 1 ? 91 : 124} height={state.clouds === 1 ? 53 : 71} viewBox="0 0 134 74"><Path d={CLOUD_PATH} fill={isDarkCloud ? '#2E4B60' : '#6A899B'} /><Path d="M21 29c5-16 20-24 34-17" stroke="#A6C4D4" strokeWidth="1" fill="none" opacity=".25" strokeLinecap="round" /></Svg>
      </Animated.View> : null}

      {state.precipitation !== 'none' ? PARTICLES.filter((_, index) => state.kind !== 'drizzle' || index % 2 === 0).map((particle, index) => {
        const progress = Animated.modulo(Animated.add(precipitation, particle.offset), 1);
        return <Animated.View key={index} style={{ position: 'absolute', left: particle.x, top: particle.y, width: 12, height: 22, opacity: progress.interpolate({ inputRange: [0, .16, .72, 1], outputRange: [0, .7, .6, 0] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-6, 32] }) }, { translateX: isSnow ? progress.interpolate({ inputRange: [0, .5, 1], outputRange: [-2, 3, -2] }) : progress.interpolate({ inputRange: [0, 1], outputRange: [2, -5] }) }] }}>
          <Svg width={12} height={22} viewBox="0 0 12 22">
            {isSnow ? <G stroke="#C8E2EE" strokeWidth="1.2" strokeLinecap="round"><Path d="M6 2v8M2 4l8 4M2 8l8-4" /></G> : state.precipitation === 'hail' ? <Circle cx="6" cy="6" r="2.2" fill="#C0D5E4" /> : <Path d="m8 1-4 12" stroke={state.kind === 'thunder' ? '#7898B0' : '#8BAFC7'} strokeWidth={state.kind === 'drizzle' ? 1.2 : 1.7} strokeLinecap="round" />}
          </Svg>
        </Animated.View>;
      }) : null}

      {state.clouds === 2 ? <Animated.View style={{ position: 'absolute', left: 21, top: state.kind === 'partly-cloudy' ? 94 : 83, width: 136, height: 76, transform: [{ translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [4, -4] }) }] }}>
        <Svg width={136} height={76} viewBox="0 0 134 74"><Defs><LinearGradient id={cloudId} x1="0%" y1="0%" x2="0%" y2="100%"><Stop offset="0" stopColor={isDarkCloud ? '#56748B' : '#9AB8C9'} /><Stop offset="1" stopColor={isDarkCloud ? '#213E54' : '#526F83'} /></LinearGradient></Defs><Path d={CLOUD_PATH} fill={`url(#${cloudId})`} /><Path d="M8 47c-1-10 7-18 17-18C26 15 37 8 46 9" fill="none" stroke="#BDD5E2" strokeWidth="1" opacity=".26" strokeLinecap="round" /></Svg>
      </Animated.View> : null}

      {state.kind === 'fog' ? <Animated.View style={{ position: 'absolute', left: 25, top: 111, width: 132, height: 52, opacity: .6, transform: [{ translateX: cloudShift }] }}>
        <Svg width={132} height={52}><G stroke="#9BB6C7" strokeLinecap="round" strokeWidth="2"><Path d="M8 8h77m12 0h22M0 20h40m12 0h76M12 33h82m13 0h14M28 45h76" /></G></Svg>
      </Animated.View> : null}
      {state.kind === 'thunder' ? <Svg width={180} height={180} style={{ position: 'absolute' }}><Path d="m91 128-11 16h9l-5 15 18-23H91l7-8Z" fill="#DCA089" opacity=".85" /></Svg> : null}
      {state.kind === 'unknown' ? <Svg width={180} height={180} style={{ position: 'absolute' }}><Circle cx="90" cy="84" r="30" stroke="#526F83" strokeWidth="1.3" fill="none" opacity=".5" /><Path d="M62 84h56m-28-28v56" stroke="#526F83" strokeWidth=".7" opacity=".3" /></Svg> : null}
    </View>
  </View>;
}

export default WeatherScene;
