import { Tabs, router } from 'expo-router';
import { Keyboard, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useEffect, useState, type ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Icon, type IconName } from '@/src/components/ui';
import { TabSymbol, useReducedMotion } from '@/src/components/motion';
import { colors, fonts } from '@/src/theme';

const items: Record<string, { label: string; icon: IconName }> = { index: { label: 'Explore', icon: 'compass' }, planner: { label: 'Planner', icon: 'planner' }, weather: { label: 'Weather', icon: 'sun' } };

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
function NavigationBar({ state, navigation }: TabBarProps) {
  const wide = useWindowDimensions().width >= 1100;
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  if (keyboardVisible && !wide) return null;
  return <View style={[styles.bar, wide ? { width: 190, borderRightWidth: 1, paddingTop: insets.top + 30, paddingLeft: insets.left + 12, paddingRight: 12, paddingBottom: insets.bottom + 16, gap: 12 } : { flexDirection: 'row', borderTopWidth: 1, paddingBottom: Math.max(insets.bottom, 10), paddingTop: 8, paddingLeft: Math.max(insets.left, 8), paddingRight: Math.max(insets.right, 8) }]}>
    {wide && <View style={{ padding: 12, marginBottom: 24 }}><AppText style={{ fontFamily: fonts.script, fontSize: 25 }}>Destination</AppText><AppText style={{ fontFamily: fonts.script, fontSize: 30, color: colors.coral }}>Paradise</AppText><AppText variant="label" style={{ marginTop: 10, fontSize: 9 }}>Zanzibar & Tanzania</AppText></View>}
    {state.routes.map((route, index) => {
      const item = items[route.name];
      if (!item) return null;
      const selected = state.index === index;
      return <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={item.label} testID={`tab-${item.label.toLowerCase()}`} onPress={() => {
        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        if (!selected && !event.defaultPrevented) navigation.navigate(route.name);
      }} onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })} style={({ pressed }) => [styles.item, wide ? { flexDirection: 'row', paddingHorizontal: 16, gap: 12, borderRadius: 14, backgroundColor: selected ? '#2E3039' : 'transparent' } : { flex: 1 }, pressed && { opacity: 0.7 }]}>
        <TabSymbol selected={selected}><Icon name={item.icon} size={23} color={selected ? colors.coral : colors.muted} /></TabSymbol>
        <AppText variant="caption" style={{ fontFamily: selected ? fonts.sansBold : fonts.sansMedium, color: selected ? colors.coral : colors.muted, fontSize: 11 }}>{item.label}</AppText>
      </Pressable>;
    })}
    {wide && <View style={{ flex: 1 }} />}
    <Pressable accessibilityRole="button" accessibilityLabel="App information and saved data" onPress={() => router.push('/settings')} style={({ pressed }) => [styles.item, { minWidth: 44, opacity: pressed ? 0.6 : 1 }, wide && { flexDirection: 'row', gap: 12 }]}><Icon name="info" size={21} color={colors.muted} />{wide && <AppText variant="caption">App information</AppText>}</Pressable>
  </View>;
}

export default function TabLayout() {
  const wide = useWindowDimensions().width >= 1100;
  const reducedMotion = useReducedMotion();
  return <Tabs tabBar={(props) => <NavigationBar {...props} />} screenOptions={{ headerShown: false, animation: reducedMotion ? 'none' : 'fade', transitionSpec: { animation: 'timing', config: { duration: 180 } }, sceneStyle: { backgroundColor: colors.background }, tabBarPosition: wide ? 'left' : 'bottom', tabBarHideOnKeyboard: true }}>
    <Tabs.Screen name="index" options={{ title: 'Explore' }} />
    <Tabs.Screen name="planner" options={{ title: 'Planner' }} />
    <Tabs.Screen name="weather" options={{ title: 'Weather' }} />
  </Tabs>;
}
const styles = StyleSheet.create({ bar: { backgroundColor: '#0B2333', borderColor: colors.border }, item: { minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 5 } });
