import { type ReactNode } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts } from '@/src/theme';
import { AppText, Button } from '@/src/components/ui';

export function Section({ title, children, hint }: { title: string; children: ReactNode; hint?: string }) {
  return <View style={{ gap: 12 }}>
    <AppText variant="label" color={colors.muted}>{title}</AppText>
    {children}
    {hint ? <AppText variant="caption" color={colors.muted}>{hint}</AppText> : null}
  </View>;
}

export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
    <AppText>{label}</AppText>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Fewer ${label.toLowerCase()}`} accessibilityState={{ disabled: value <= min }} disabled={value <= min} onPress={() => onChange(Math.max(min, value - 1))} style={({ pressed }) => ({ width: 44, height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 13, alignItems: 'center', justifyContent: 'center', opacity: value <= min ? .3 : pressed ? .6 : 1 })}>
        <Text style={{ color: colors.text, fontSize: 24 }}>−</Text>
      </Pressable>
      <AppText selectable style={{ minWidth: 27, textAlign: 'center', fontVariant: ['tabular-nums'], fontFamily: fonts.sansBold }}>{value}</AppText>
      <Pressable accessibilityRole="button" accessibilityLabel={`More ${label.toLowerCase()}`} accessibilityState={{ disabled: value >= max }} disabled={value >= max} onPress={() => onChange(Math.min(max, value + 1))} style={({ pressed }) => ({ width: 44, height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 13, alignItems: 'center', justifyContent: 'center', opacity: value >= max ? .3 : pressed ? .6 : 1 })}>
        <Text style={{ color: colors.text, fontSize: 23 }}>+</Text>
      </Pressable>
    </View>
  </View>;
}

export function Consent({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => onChange(!checked)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 48, opacity: pressed ? .7 : 1 })}>
    <View style={{ marginTop: 2, width: 25, height: 25, borderWidth: 1, borderRadius: 7, borderColor: checked ? colors.coral : colors.muted, backgroundColor: checked ? colors.coral : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      {checked ? <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>✓</Text> : null}
    </View>
    <AppText style={{ flex: 1, fontSize: 12, lineHeight: 19 }} color={colors.textSecondary}>{children}</AppText>
  </Pressable>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ gap: 8 }}>
    <AppText variant="caption" color={colors.textSecondary}>{label}</AppText>
    <TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[{ minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.background, color: colors.text, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.sans, fontSize: 14 }, props.style]} />
  </View>;
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <View accessibilityLiveRegion="polite" style={{ padding: 15, gap: 10, borderRadius: 15, borderWidth: 1, borderColor: '#974F4B', backgroundColor: '#35242F' }}>
    <AppText selectable style={{ fontSize: 13, lineHeight: 20 }}>{message}</AppText>
    {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
  </View>;
}

export function DraftText({ text }: { text: string }) {
  return <View style={{ gap: 11 }}>
    {text.split('\n').filter((line) => line.trim()).map((line, index) => {
      if (/^\s*[-*_]{3,}\s*$/.test(line)) return <View key={index} style={{ height: 1, backgroundColor: colors.border, marginVertical: 7 }} />;
      const isHeading = /^#{1,4}\s|^\*\*[^*]+\*\*\s*$|^(Day\s+\d+|Days\s+\d+)/i.test(line.trim());
      const clean = line.replace(/^#{1,6}\s*/, '').replace(/\*\*/g, '').replace(/\*([^*\n]+)\*/g, '$1').replace(/^[-*]\s+/, '• ');
      return <AppText key={index} selectable style={{ fontFamily: isHeading ? fonts.sansBold : fonts.sans, fontSize: isHeading ? 16 : 14, lineHeight: isHeading ? 24 : 23, marginTop: isHeading && index ? 8 : 0 }} color={isHeading ? colors.text : colors.textSecondary}>{clean}</AppText>;
    })}
  </View>;
}
