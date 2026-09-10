import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AI_REPORT_NOTES_LIMIT, AI_REPORT_REASONS, AI_REPORT_REPLY_LIMIT, reportAiReply, type AiReportReason } from '@/src/api/report-ai';
import { AppText, Button, Icon, Surface } from '@/src/components/ui';
import { AnimatedPressable as Pressable, useReducedMotion } from '@/src/components/motion';
import { colors } from '@/src/theme';
import { Consent, ErrorNotice, Field } from './planner-parts';

/** Place after each assistant message so reporting stays within the app. */
export function ReportAiReply({ reply }: { reply: string }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState<AiReportReason | null>(null);
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  const withinLimit = reply.length <= AI_REPORT_REPLY_LIMIT;

  useEffect(() => () => pending.current?.abort(), []);

  function openReport() {
    setReason(null);
    setNotes('');
    setConsent(false);
    setError(null);
    setVisible(true);
  }

  async function submit() {
    if (!reason || !consent || busy || reported || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError(null);
    try {
      await reportAiReply({ reason, reply, notes, consent: true }, { signal: controller.signal });
      if (!controller.signal.aborted) setReported(true);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'The report could not be sent. Please try again later.');
    } finally {
      if (pending.current === controller) { pending.current = null; setBusy(false); }
    }
  }

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={reported ? 'View submitted report' : 'Report this AI reply'} onPress={reported ? () => setVisible(true) : openReport} style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', opacity: pressed ? .65 : 1 })}>
      <Icon name={reported ? 'check' : 'shield'} size={15} color={colors.muted}/>
      <AppText variant="caption">{reported ? 'Report submitted' : 'Report reply'}</AppText>
    </Pressable>
    <Modal visible={visible} animationType={reducedMotion ? 'none' : 'slide'} presentationStyle="fullScreen" supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']} onRequestClose={() => { if (!busy) setVisible(false); }}>
      <SafeAreaView accessibilityViewIsModal edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 22, paddingBottom: 38, width: '100%', maxWidth: 720, alignSelf: 'center', gap: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <AppText variant="heading" style={{ flex: 1 }}>Report AI reply</AppText>
              <Button label="Close" variant="ghost" disabled={busy} onPress={() => setVisible(false)}/>
            </View>
            {reported ? <Surface>
              <Icon name="check" color={colors.coral}/>
              <AppText variant="heading" accessibilityLiveRegion="polite">Report submitted for review</AppText>
              <AppText color={colors.textSecondary}>Thank you for helping us improve the planner. Your report has been sent to the Destination Paradise team for review.</AppText>
              <Button label="Back to planner" onPress={() => setVisible(false)}/>
            </Surface> : <>
              <AppText color={colors.textSecondary}>Tell us what is wrong with this reply. We will share the selected reply, your reason and optional notes with our team for safety and quality review.</AppText>
              <Surface>
                <AppText variant="label" color={colors.muted}>Selected AI reply</AppText>
                <AppText selectable style={{ fontSize: 13, lineHeight: 21 }}>{reply}</AppText>
              </Surface>
              <View style={{ gap: 8 }}>
                <AppText variant="label" color={colors.muted}>Reason</AppText>
                {AI_REPORT_REASONS.map((item) => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ selected: reason === item.id, disabled: busy }} accessibilityLabel={item.label} disabled={busy} onPress={() => { setReason(item.id); setConsent(false); }} style={({ pressed }) => ({ minHeight: 48, borderWidth: 1, borderColor: reason === item.id ? colors.coral : colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', gap: 10, alignItems: 'center', opacity: pressed ? .7 : 1 })}>
                  <Icon name={reason === item.id ? 'check' : 'info'} size={17} color={reason === item.id ? colors.coral : colors.muted}/><AppText style={{ flex: 1, fontSize: 14 }}>{item.label}</AppText>
                </Pressable>)}
              </View>
              <Field label="Additional notes (optional)" value={notes} editable={!busy} onChangeText={(text) => { setNotes(text); setConsent(false); }} multiline maxLength={AI_REPORT_NOTES_LIMIT} placeholder="What should our team review? Avoid adding private details." style={{ minHeight: 100, textAlignVertical: 'top' }}/>
              <AppText variant="caption">No other chat messages or contact details are added to your report.</AppText>
              <Consent checked={consent} onChange={(checked) => { if (!busy) setConsent(checked); }}>Send the reply shown above, my reason and notes to Destination Paradise for review.</Consent>
              {!withinLimit ? <ErrorNotice message="This reply is too long to report in one submission. No content has been sent."/> : null}
              {error ? <ErrorNotice message={error}/> : null}
              <Button label={busy ? 'Submitting report…' : 'Submit report'} icon="shield" loading={busy} disabled={!reason || !consent || !withinLimit} onPress={() => void submit()}/>
            </>}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  </>;
}
