import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Pressable, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { destinations } from '@/src/data/content';
import { ApiError, PLANNER_MESSAGE_LIMIT, sendPlannerDraft, sendPlannerMessage } from '@/src/api';
import { useTripStore } from '@/src/state/trip-store';
import { AppText, Button, Chip, Surface } from '@/src/components/ui';
import { Reveal, useReducedMotion } from '@/src/components/motion';
import { colors, fonts, privacyPolicyUrl } from '@/src/theme';
import { ReportAiReply } from './report-ai';
import { Consent, DraftText, ErrorNotice, Field, Section, Stepper } from './planner-parts';
import { MONTH_NAMES, normalizeMonth, planningContext, preferenceSummary, quoteValidation } from './planning-context';

type Message = { role: 'user' | 'assistant'; content: string };
type Phase = 'preferences' | 'chat' | 'review' | 'quote';
const INTERESTS = ['Beach', 'Culture', 'Food', 'Wildlife', 'Snorkelling', 'Kitesurf', 'Honeymoon', 'Family'];
const STYLES = [
  { label: 'Safari + beach', sub: 'A short mainland safari, then the coast.', mark: '01' },
  { label: 'Honeymoon', sub: 'Quiet beaches, dhow sunsets, slow days.', mark: '02' },
  { label: 'Family', sub: 'Shorter drives, forest and shallow water.', mark: '03' },
  { label: 'Culture + ocean', sub: 'Stone Town, spice routes, reef days.', mark: '04' },
];
const EMPTY_CONTACT = { name: '', email: '', phone: '' };

export default function PlannerScreen({ destinationId, month }: { destinationId?: string; month?: string }) {
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const tablet = width >= 760;
  const { preferences, setPreferences, hydrated, storageError } = useTripStore();
  const place = destinations.find((item) => item.id === preferences.destinationId);
  const [phase, setPhase] = useState<Phase>('preferences');
  const [aiConsent, setAiConsent] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handoffReady, setHandoffReady] = useState(false);
  const [lastResponseContext, setLastResponseContext] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [quoteConsent, setQuoteConsent] = useState(false);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteUnconfirmed, setQuoteUnconfirmed] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const quoteRequestRef = useRef<AbortController | null>(null);
  const lastAttemptRef = useRef<Message[] | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const handoffRef = useRef('');
  const destinationMonthRef = useRef(`${preferences.destinationId || ''}|${preferences.month}`);
  const summary = preferenceSummary(preferences, place?.name);
  const inputLimit = Math.max(100, PLANNER_MESSAGE_LIMIT - planningContext(preferences, place?.name).length - 2);
  const latestDraft = [...messages].reverse().find((message) => message.role === 'assistant')?.content;
  const draftIsCurrent = !!latestDraft && lastResponseContext === planningContext(preferences, place?.name) && messages[messages.length - 1]?.role === 'assistant';

  useEffect(() => {
    const next = `${preferences.destinationId || ''}|${preferences.month}`;
    if (destinationMonthRef.current !== next) {
      destinationMonthRef.current = next;
      // Explore and Weather update the shared store before navigating here.
      setPhase('preferences');
      setQuoteConsent(false);
    }
  }, [preferences.destinationId, preferences.month]);

  useEffect(() => {
    if (!hydrated) return;
    const handoff = `${destinationId || ''}|${month || ''}`;
    if (handoffRef.current === handoff) return;
    handoffRef.current = handoff;
    const validMonth = normalizeMonth(month);
    const validPlace = destinations.some((item) => item.id === destinationId);
    if (validMonth || validPlace) {
      setPreferences({ ...(validMonth ? { month: validMonth } : {}), ...(validPlace ? { destinationId } : {}) });
      setPhase('preferences');
    }
  }, [destinationId, month, hydrated, setPreferences]);

  useEffect(() => () => {
    requestRef.current?.abort();
    quoteRequestRef.current?.abort();
  }, []);

  function historyWithPreferences(history: Message[], forQuote = false) {
    const context = planningContext(preferences, place?.name);
    // Place current preferences in the newest user turn so backend history bounds cannot drop them.
    if (forQuote) return [{ role: 'user' as const, content: context }, ...history];
    return history.map((message, index) => index === history.length - 1 ? { ...message, content: `${context}\n\n${message.content}` } : message);
  }

  async function requestReply(history: Message[]) {
    if (!aiConsent || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    lastAttemptRef.current = history;
    setError(null);
    setBusy(true);
    setPhase('chat');
    setMessages(history);
    const submittedContext = planningContext(preferences, place?.name);
    try {
      const response = await sendPlannerMessage(historyWithPreferences(history), { signal: controller.signal });
      if (controller.signal.aborted) return;
      setMessages([...history, { role: 'assistant', content: response.reply }]);
      setHandoffReady(response.handoffReady);
      setLastResponseContext(submittedContext);
      lastAttemptRef.current = null;
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'The planner could not connect. Please try again.');
    } finally {
      if (requestRef.current === controller) { requestRef.current = null; setBusy(false); }
    }
  }

  function send(content: string) {
    if (!content.trim() || busy || !aiConsent) return;
    if (content.trim().length > inputLimit) { setError(`Please keep your message under ${inputLimit} characters so your trip preferences fit alongside it.`); return; }
    const next = [...messages, { role: 'user' as const, content: content.trim() }];
    setInput('');
    setQuoteSent(false);
    setQuoteConsent(false);
    void requestReply(next);
  }

  function cancelReply() {
    requestRef.current?.abort();
    requestRef.current = null;
    setBusy(false);
    setError('Response cancelled. Your message is here if you want to try again.');
  }

  function resetConversation() {
    requestRef.current?.abort();
    requestRef.current = null;
    setBusy(false);
    lastAttemptRef.current = null;
    setMessages([]);
    setInput('');
    setError(null);
    setContact(EMPTY_CONTACT);
    setQuoteConsent(false);
    setQuoteError(null);
    setQuoteSent(false);
    setQuoteUnconfirmed(false);
    setHandoffReady(false);
    setLastResponseContext('');
    setShowTranscript(false);
    setAiConsent(false);
    setPhase('preferences');
  }

  async function sendQuote() {
    if (quoteRequestRef.current || quoteSent || quoteUnconfirmed || !draftIsCurrent) return;
    const validation = quoteValidation(contact, quoteConsent);
    setQuoteError(validation);
    if (validation) return;
    const controller = new AbortController();
    quoteRequestRef.current = controller;
    setQuoteBusy(true);
    try {
      await sendPlannerDraft({ contact: { name: contact.name.trim(), email: contact.email.trim(), phone: contact.phone.trim() }, history: historyWithPreferences(messages, true), lang: 'en' }, { signal: controller.signal });
      if (!controller.signal.aborted) { setQuoteSent(true); setContact(EMPTY_CONTACT); setQuoteConsent(false); }
    } catch (cause) {
      if (!controller.signal.aborted) {
        if (cause instanceof ApiError && cause.code === 'DELIVERY_UNCONFIRMED') setQuoteUnconfirmed(true);
        setQuoteError(cause instanceof Error ? cause.message : 'The request could not be confirmed. Contact our team before sending again to avoid a duplicate.');
      }
    } finally {
      quoteRequestRef.current = null;
      setQuoteBusy(false);
    }
  }

  const preferenceForm = <View style={{ gap: 23 }}>
    <Section title="Where do we start?">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {STYLES.map((item) => <Pressable key={item.label} accessibilityRole="button" accessibilityState={{ selected: preferences.tripStyle === item.label }} onPress={() => setPreferences({ tripStyle: item.label })} style={({ pressed }) => ({ width: '48%', flexGrow: 1, minHeight: 138, padding: 16, gap: 10, borderRadius: 20, borderCurve: 'continuous', borderWidth: 1, borderColor: preferences.tripStyle === item.label ? colors.coral : colors.border, backgroundColor: preferences.tripStyle === item.label ? '#382E39' : colors.surface, opacity: pressed ? .75 : 1 })}>
          <AppText variant="caption" color={colors.coral}>{item.mark}</AppText>
          <AppText style={{ fontFamily: fonts.sansBold, fontSize: 14 }}>{item.label}</AppText>
          <AppText variant="caption" color={colors.textSecondary}>{item.sub}</AppText>
        </Pressable>)}
      </View>
    </Section>
    <Surface style={{ padding: 18, gap: 21 }}>
      <Section title="Your basics">
        <Stepper label="Nights" value={preferences.nights} min={2} max={30} onChange={(nights) => setPreferences({ nights })} />
        <Stepper label="Adults" value={preferences.adults} min={1} max={12} onChange={(adults) => setPreferences({ adults })} />
        <Stepper label="Children" value={preferences.children} min={0} max={8} onChange={(children) => setPreferences({ children })} />
      </Section>
      <Section title="Travel month" hint="An idea of when. Exact dates and year can follow later.">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MONTH_NAMES.map((name) => <Chip key={name} label={name.slice(0, 3)} accessibilityLabel={name} selected={normalizeMonth(preferences.month) === name} onPress={() => setPreferences({ month: name })} />)}
        </View>
      </Section>
      <Section title="Budget">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['Value', 'Mid-range', 'Luxury'] as const).map((budget) => <Chip key={budget} label={budget} selected={preferences.budget === budget} onPress={() => setPreferences({ budget })} />)}</View>
      </Section>
      <Section title="Pace">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['Relaxed', 'Balanced', 'Active'] as const).map((pace) => <Chip key={pace} label={pace} selected={preferences.pace === pace} onPress={() => setPreferences({ pace })} />)}</View>
      </Section>
      <Section title="Make room for">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{INTERESTS.map((interest) => <Chip key={interest} label={interest} selected={preferences.interests.includes(interest)} onPress={() => setPreferences((current) => ({ interests: current.interests.includes(interest) ? current.interests.filter((item) => item !== interest) : [...current.interests, interest] }))} />)}</View>
      </Section>
    </Surface>
  </View>;

  const introduction = <View style={{ gap: 19 }}>
    <AppText variant="label" color={colors.coral}>MADE AROUND YOU</AppText>
    <AppText style={{ fontFamily: fonts.script, fontSize: tablet ? 40 : 32, lineHeight: tablet ? 54 : 44 }}>Karibu. Let’s shape your trip.</AppText>
    <AppText color={colors.textSecondary} style={{ lineHeight: 24 }}>Tell us roughly what you want. We draft the days, then a human in Zanzibar checks every price and booking. No account needed.</AppText>
    {place ? <Surface style={{ padding: 15, backgroundColor: '#342C37', borderColor: '#6D4347', gap: 8 }}>
      <AppText variant="caption" color={colors.coral}>PLANNING AROUND</AppText>
      <AppText variant="heading">{place.name}</AppText>
      <Button label="Remove selected place" variant="ghost" onPress={() => setPreferences({ destinationId: null })} />
    </Surface> : null}
  </View>;

  const planningStart = <View style={{ gap: 16 }}>
    <Surface style={{ padding: 18, gap: 15 }}>
      <AppText style={{ fontFamily: fonts.sansBold }}>A little context, a better journey.</AppText>
      <AppText selectable color={colors.textSecondary}>{summary}</AppText>
      <AppText variant="caption" color={colors.muted}>Your non-sensitive preferences stay on this device. Messages and contact details stay in memory until you reset or close the app.</AppText>
      {storageError ? <AppText selectable variant="caption" color={colors.coral}>{storageError}</AppText> : null}
    </Surface>
    <Surface style={{ padding: 18, gap: 15 }}>
      <AppText style={{ fontFamily: fonts.sansBold }}>Before you start</AppText>
      <Consent checked={aiConsent} onChange={setAiConsent}>I agree to send my preferences and planner messages to Destination Paradise and Anthropic for AI suggestions. I will keep passport, payment and other sensitive information out of chat.</Consent>
      <Pressable accessibilityRole="link" onPress={() => { setPrivacyError(false); void Linking.openURL(privacyPolicyUrl).catch(() => setPrivacyError(true)); }} style={{ minHeight: 44, justifyContent: 'center' }}><AppText variant="caption" color={colors.coral}>Read our privacy policy ↗</AppText></Pressable>
      {privacyError ? <AppText selectable variant="caption" color={colors.coral}>The privacy policy could not open. Please try again.</AppText> : null}
      <Button label={messages.length ? 'Continue planning' : place ? `Plan around ${place.name}` : 'Start planning'} disabled={!aiConsent || !hydrated} onPress={() => messages.length ? lastResponseContext && lastResponseContext !== planningContext(preferences, place?.name) ? send('I have updated my trip preferences. Please revise the route and draft to reflect the current month, destination and other choices.') : setPhase('chat') : send('Help me shape a trip using my preferences. Suggest a sensible route and ask what else you need before drafting the days.')} />
      <AppText variant="caption" color={colors.muted}>AI suggestions · a human checks details before booking</AppText>
    </Surface>
  </View>;

  // Phone columns need their intrinsic height inside ScrollView; flex belongs only to tablet rows.
  if (phase === 'preferences') return <ScrollView contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: tablet ? 30 : 18, paddingTop: insets.top + 20, paddingBottom: 32, gap: 25, maxWidth: 1240, width: '100%', alignSelf: 'center' }}>
    <Reveal motionKey="preferences" style={{ flexDirection: tablet ? 'row' : 'column', gap: tablet ? 34 : 26, alignItems: 'flex-start' }}>
      <View style={{ width: tablet ? '40%' : '100%', gap: 25 }}>{introduction}{tablet ? planningStart : null}</View>
      <View style={tablet ? { flex: 1 } : { width: '100%' }}>{preferenceForm}</View>
      {!tablet ? <View style={{ width: '100%' }}>{planningStart}</View> : null}
    </Reveal>
  </ScrollView>;

  if (phase === 'review' || phase === 'quote') return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: tablet ? 30 : 18, paddingTop: insets.top + 14, paddingBottom: 35, gap: 20, maxWidth: 1160, width: '100%', alignSelf: 'center' }}>
      <Button label="Back to conversation" variant="ghost" disabled={quoteBusy} onPress={() => setPhase('chat')} />
      <AppText variant="label" color={colors.coral}>YOUR JOURNEY, TAKING SHAPE</AppText>
      <AppText style={{ fontFamily: fonts.script, fontSize: 32, lineHeight: 44 }}>{phase === 'quote' ? 'Let’s make it personal.' : 'Your draft itinerary.'}</AppText>
      <AppText selectable color={colors.textSecondary}>{summary}</AppText>
      <Reveal motionKey={phase} style={{ flexDirection: tablet ? 'row' : 'column', gap: 22, alignItems: 'flex-start' }}>
        <View style={[tablet ? { flex: 1 } : { width: '100%' }, { gap: 15 }]}>
          <Surface style={{ padding: 20, gap: 14 }}>
            <AppText variant="caption" color={colors.coral}>AI DRAFT · FOR YOUR REVIEW</AppText>
            {latestDraft ? <><DraftText text={latestDraft} /><ReportAiReply reply={latestDraft} /></> : <AppText>No itinerary yet. Return to the conversation to create one.</AppText>}
          </Surface>
          <AppText variant="caption" color={colors.muted}>Hotels, flights, availability and prices are proposals until our team confirms them. The planner cannot make bookings.</AppText>
          {phase === 'quote' ? <Surface style={{ padding: 18, gap: 15 }}>
            <Button label={showTranscript ? 'Hide conversation to be shared' : 'Review full conversation to be shared'} variant="secondary" onPress={() => setShowTranscript((current) => !current)} />
            {showTranscript ? <>
              <AppText selectable variant="caption" color={colors.textSecondary}>{planningContext(preferences, place?.name)}</AppText>
              {messages.map((message, index) => <View key={index} style={{ paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 }}><AppText variant="label" color={colors.coral}>{message.role === 'user' ? 'You' : 'Paradise Planner'}</AppText><DraftText text={message.content} />{message.role === 'assistant' ? <ReportAiReply reply={message.content} /> : null}</View>)}
            </> : null}
          </Surface> : null}
        </View>
        <View style={{ width: tablet ? '36%' : '100%', gap: 15 }}>
          {phase === 'review' ? <Surface style={{ padding: 19, gap: 15 }}>
            <AppText variant="heading">A real person. Local knowledge.</AppText>
            <AppText color={colors.textSecondary}>Happy with the direction? Share this conversation with our Zanzibar team for a tailored quote.</AppText>
            <Button label="Request a human quote" onPress={() => { if (!quoteUnconfirmed) setQuoteError(null); setPhase('quote'); }} />
            <Button label="Keep refining in chat" variant="secondary" onPress={() => setPhase('chat')} />
          </Surface> : quoteSent ? <Surface style={{ padding: 20, gap: 15, borderColor: colors.success }}>
            <AppText variant="heading">Request received</AppText>
            <AppText selectable color={colors.textSecondary}>Destination Paradise accepted your quote request. Our team will review your trip and contact you. This is not a confirmed booking.</AppText>
            <Button label="Start a fresh conversation" variant="secondary" onPress={resetConversation} />
          </Surface> : <Surface style={{ padding: 19, gap: 17 }}>
            <AppText variant="heading">Where can we reach you?</AppText>
            <AppText variant="caption" color={colors.textSecondary}>Sending shares the conversation shown here and these details with Destination Paradise by email via Resend.</AppText>
            <Field label="Your name" value={contact.name} editable={!quoteBusy} onChangeText={(name) => setContact((current) => ({ ...current, name }))} autoComplete="name" maxLength={100} />
            <Field label="Email address" value={contact.email} editable={!quoteBusy} onChangeText={(email) => setContact((current) => ({ ...current, email }))} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={200} />
            <Field label="Phone / WhatsApp (optional)" value={contact.phone} editable={!quoteBusy} onChangeText={(phone) => setContact((current) => ({ ...current, phone }))} keyboardType="phone-pad" autoComplete="tel" maxLength={40} />
            <Consent checked={quoteConsent} onChange={(checked) => { if (!quoteBusy) setQuoteConsent(checked); }}>I agree to share this conversation and my contact details with Destination Paradise to prepare and follow up on my trip quote.</Consent>
            {quoteError ? <ErrorNotice message={quoteError} /> : null}
            <Button label={quoteUnconfirmed ? 'Delivery needs checking' : 'Send quote request'} loading={quoteBusy} disabled={!quoteConsent || !contact.name.trim() || !contact.email.trim() || quoteBusy || quoteUnconfirmed} onPress={() => void sendQuote()} />
            {quoteUnconfirmed ? <Button label="Contact Destination Paradise" variant="secondary" onPress={() => void Linking.openURL('https://yournexttriptoparadise.com/#contact').catch(() => setQuoteError('Please contact info@yournexttriptoparadise.com to check whether your request arrived.'))} /> : null}
            {quoteBusy ? <AppText variant="caption" color={colors.muted}>Sending your request. Please keep this screen open.</AppText> : null}
          </Surface>}
        </View>
      </Reveal>
    </ScrollView>
  </KeyboardAvoidingView>;

  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
    <Reveal motionKey="chat" style={{ flex: 1, flexDirection: tablet ? 'row' : 'column', width: '100%', maxWidth: 1240, alignSelf: 'center', paddingTop: insets.top }}>
      {tablet ? <View style={{ width: 300, borderRightWidth: 1, borderRightColor: colors.border, padding: 22, gap: 18 }}>
        <AppText variant="label" color={colors.coral}>YOUR TRIP</AppText>
        <AppText style={{ fontFamily: fonts.script, fontSize: 30, lineHeight: 42 }}>Room for discovery.</AppText>
        <AppText selectable color={colors.textSecondary}>{summary}</AppText>
        <AppText color={colors.textSecondary}>{preferences.tripStyle || 'Open to ideas'}{ '\n' }{preferences.budget} · {preferences.pace}{ '\n' }{preferences.interests.join(', ') || 'Interests open'}</AppText>
        <Button label="Edit preferences" variant="secondary" disabled={busy} onPress={() => setPhase('preferences')} />
        <AppText variant="caption" color={colors.muted}>Suggestions use Anthropic AI. Avoid sharing sensitive personal details. Nothing is booked or emailed through chat.</AppText>
      </View> : null}
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 18, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <AppText style={{ flex: 1, fontFamily: fonts.sansBold }}>Paradise Planner <AppText variant="caption" color={colors.coral}>AI</AppText></AppText>
            {!tablet ? <Button label="Preferences" variant="ghost" disabled={busy} onPress={() => setPhase('preferences')} /> : null}
            <Button label="Reset" variant="ghost" disabled={busy} onPress={resetConversation} />
          </View>
          <AppText selectable variant="caption" color={colors.muted}>{summary}</AppText>
        </View>
        <ScrollView ref={scrollRef} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled" onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: !reducedMotion })} style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 17 }}>
          <AppText variant="caption" color={colors.muted}>Drafted with AI · human reviewed before booking</AppText>
          {messages.map((message, index) => <Reveal key={index} motionKey={index} style={{ alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: tablet ? '88%' : '95%', padding: 16, gap: 7, borderWidth: 1, borderColor: message.role === 'user' ? '#70454A' : colors.border, borderRadius: 19, borderBottomRightRadius: message.role === 'user' ? 5 : 19, borderBottomLeftRadius: message.role === 'assistant' ? 5 : 19, backgroundColor: message.role === 'user' ? '#392E39' : colors.surfaceRaised }}>
            <AppText variant="caption" color={message.role === 'user' ? '#FFB0A5' : colors.muted}>{message.role === 'user' ? 'YOU' : 'PARADISE PLANNER'}</AppText>
            <DraftText text={message.content} />
            {message.role === 'assistant' ? <ReportAiReply reply={message.content} /> : null}
          </Reveal>)}
          {busy ? <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}><ActivityIndicator color={colors.coral} /><AppText variant="caption" color={colors.textSecondary}>Thinking through your trip…</AppText><Button label="Cancel" variant="ghost" onPress={cancelReply} /></View> : null}
          {error ? <ErrorNotice message={error} onRetry={lastAttemptRef.current ? () => void requestReply(lastAttemptRef.current!) : undefined} /> : null}
        </ScrollView>
        <View style={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14, gap: 11, borderTopWidth: 1, borderTopColor: colors.border }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
            {['Suggest a slower pace', 'Add a short safari', 'Draft my day-by-day itinerary'].map((suggestion) => <Chip key={suggestion} label={suggestion} onPress={() => { if (!busy) send(suggestion); }} />)}
          </ScrollView>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
            <TextInput accessibilityLabel="Message Paradise Planner" value={input} onChangeText={setInput} editable={!busy} placeholder="Ask about places, dates or pace" placeholderTextColor={colors.muted} multiline maxLength={inputLimit} style={{ flex: 1, minHeight: 49, maxHeight: 125, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 13, fontFamily: fonts.sans, fontSize: 14, color: colors.text }} />
            <Button label="Send" disabled={busy || !input.trim()} onPress={() => send(input)} />
          </View>
          {latestDraft ? <Button label={handoffReady ? 'Review your trip draft' : 'Review latest suggestion'} variant="secondary" disabled={busy || !draftIsCurrent} onPress={() => setPhase('review')} /> : null}
        </View>
      </View>
    </Reveal>
  </KeyboardAvoidingView>;
}
