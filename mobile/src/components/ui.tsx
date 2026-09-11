import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { AnimatedPressable as Pressable } from '@/src/components/motion';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { colors, fonts } from '@/src/theme';

export type IconName = 'compass' | 'map' | 'planner' | 'route' | 'sun' | 'cloud' | 'moon' | 'rain' | 'heart' | 'search' | 'list' | 'close' | 'arrow-right' | 'arrow-left' | 'chevron-right' | 'chevron-down' | 'plus' | 'minus' | 'check' | 'refresh' | 'send' | 'settings' | 'info' | 'external' | 'pin' | 'calendar' | 'users' | 'shield' | 'trash' | 'mail' | 'sparkles' | 'menu' | 'play' | 'pause';

export function Icon({ name, size = 22, color = colors.textSecondary, filled = false }: { name: IconName; size?: number; color?: string; filled?: boolean }) {
  const shape = (() => {
    switch (name) {
      case 'compass': return <><Circle cx="12" cy="12" r="9"/><Path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/></>;
      case 'map': return <><Path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><Path d="M9 3v15M15 6v15"/></>;
      case 'planner': case 'route': return <><Circle cx="6" cy="18" r="2.5"/><Circle cx="18" cy="5" r="2.5"/><Path d="M6 15.5v-3a3 3 0 0 1 3-3h6a3 3 0 0 0 3-3"/></>;
      case 'sun': return <><Circle cx="12" cy="12" r="4"/><Path d="M12 2v2M12 20v2M2 12h2M20 12h2m-3-9-1.5 1.5M5.5 18.5 4 20M4 4l1.5 1.5M18.5 18.5 20 20"/></>;
      case 'moon': return <Path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a7 7 0 0 0 9.7 9.7Z"/>;
      case 'cloud': case 'rain': return <><Path d="M6 17a4 4 0 1 1 .2-8A6 6 0 0 1 18 8a4.5 4.5 0 0 1 0 9Z"/>{name === 'rain' && <Path d="m8 20-1 2m5-2-1 2m5-2-1 2"/>}</>;
      case 'heart': return <Path fill={filled ? color : 'none'} d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/>;
      case 'search': return <><Circle cx="10.5" cy="10.5" r="6.5"/><Line x1="15.5" y1="15.5" x2="21" y2="21"/></>;
      case 'list': case 'menu': return <Path d="M4 6h16M4 12h16M4 18h16"/>;
      case 'close': return <Path d="m6 6 12 12M6 18 18 6"/>;
      case 'arrow-right': return <Path d="M4 12h16m-6-6 6 6-6 6"/>;
      case 'arrow-left': return <Path d="M20 12H4m6-6-6 6 6 6"/>;
      case 'chevron-right': return <Polyline points="9,5 16,12 9,19"/>;
      case 'chevron-down': return <Polyline points="5,9 12,16 19,9"/>;
      case 'plus': return <Path d="M12 5v14M5 12h14"/>;
      case 'minus': return <Path d="M5 12h14"/>;
      case 'check': return <Path d="m4 12 5 5L20 6"/>;
      case 'refresh': return <><Path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></>;
      case 'send': return <><Path d="m3 3 19 9-19 9 4-9Z"/><Path d="M7 12h15"/></>;
      case 'settings': return <><Path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z"/><Circle cx="12" cy="12" r="3"/></>;
      case 'info': return <><Circle cx="12" cy="12" r="9"/><Path d="M12 11v6m0-10v.1"/></>;
      case 'external': return <><Path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6"/></>;
      case 'pin': return <><Path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><Circle cx="12" cy="10" r="2.5"/></>;
      case 'calendar': return <><Rect x="3" y="5" width="18" height="16" rx="3"/><Path d="M7 3v4m10-4v4M3 11h18"/></>;
      case 'users': return <><Circle cx="9" cy="7" r="3"/><Path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/></>;
      case 'shield': return <><Path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><Path d="m8 12 3 3 5-6"/></>;
      case 'trash': return <><Path d="M3 6h18M9 3h6M5 6l1 15h12l1-15M9 10v7m6-7v7"/></>;
      case 'mail': return <><Rect x="3" y="5" width="18" height="14" rx="2"/><Path d="m3 6 9 7 9-7"/></>;
      case 'sparkles': return <><Path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/><Path d="M20 2v4m-2-2h4"/></>;
      case 'play': return <Path d="m8 4 12 8-12 8Z" />;
      case 'pause': return <><Path d="M8 5v14M16 5v14" /></>;
    }
  })();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{shape}</Svg>;
}

const typeStyles: Record<string, TextStyle> = {
  title: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 42 },
  heading: { fontFamily: fonts.sansBold, fontSize: 21, lineHeight: 29 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 24 },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 19, color: colors.muted },
  label: { fontFamily: fonts.sansBold, fontSize: 11, lineHeight: 17, letterSpacing: 1.6, textTransform: 'uppercase' },
};
export function AppText({ variant = 'body', color, style, ...props }: TextProps & { variant?: keyof typeof typeStyles; color?: string }) {
  return <Text {...props} style={[{ color: colors.text }, typeStyles[variant], color ? { color } : null, style]} />;
}

type ButtonProps = { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; icon?: IconName; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; labelStyle?: StyleProp<TextStyle>; accessibilityLabel?: string; testID?: string };
export function Button({ label, onPress, variant = 'primary', icon, loading, disabled, style, labelStyle, accessibilityLabel, testID }: ButtonProps) {
  const inactive = disabled || loading;
  const content = <>{loading ? <ActivityIndicator color={colors.text}/> : null}<AppText style={[{ fontFamily: fonts.sansBold, fontSize: 14, flexShrink: 1, textAlign: 'center' }, labelStyle]}>{label}</AppText>{icon && !loading ? <Icon name={icon} size={18} color={colors.text}/> : null}</>;
  const box: ViewStyle = { minHeight: 50, paddingHorizontal: 18, paddingVertical: 12, gap: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' };
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel || label} accessibilityState={{ disabled: !!inactive, busy: !!loading }} testID={testID} onPress={onPress} disabled={inactive} style={({ pressed }) => [{ opacity: inactive ? 0.5 : pressed ? 0.78 : 1, borderRadius: 16, overflow: 'hidden' }, style]}>{variant === 'primary' ? <LinearGradient colors={['#315D77', '#AE463A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[box, { borderWidth: 1, borderColor: '#85594E' }]}>{content}</LinearGradient> : <View style={[box, variant === 'secondary' ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border } : null]}>{content}</View>}</Pressable>;
}

export function Chip({ label, selected = false, onPress, icon, accessibilityLabel }: { label: string; selected?: boolean; onPress: () => void; icon?: IconName; accessibilityLabel?: string }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel || label} accessibilityState={{ selected }} style={({ pressed }) => ({ minHeight: 44, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 24, borderWidth: 1, borderColor: selected ? '#8D5A57' : colors.border, backgroundColor: selected ? '#3F343D' : colors.surface, opacity: pressed ? 0.75 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 })}>{icon ? <Icon name={icon} size={16} color={selected ? colors.coral : colors.textSecondary}/> : null}<AppText style={{ fontFamily: selected ? fonts.sansBold : fonts.sansMedium, color: selected ? colors.text : colors.textSecondary, fontSize: 12, lineHeight: 18 }}>{label}</AppText></Pressable>;
}

export function Surface({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 20, gap: 12 }, style]}>{children}</View>;
}
