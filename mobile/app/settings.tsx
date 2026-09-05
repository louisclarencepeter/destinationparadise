import { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Icon, Surface } from '@/src/components/ui';
import { colors, websiteUrl, privacyPolicyUrl } from '@/src/theme';
import { useTripStore } from '@/src/state/trip-store';

export default function AppInformation() {
  const insets = useSafeAreaInsets();
  const { savedIds, clearSavedData } = useTripStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState('');
  async function open(url: string) { try { await Linking.openURL(url); } catch { setStatus('The link could not be opened. Please try again.'); } }
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ width: '100%', maxWidth: 720, alignSelf: 'center', padding: 24, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32, gap: 24 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}><AppText variant="title" style={{ flex: 1 }}>Made for paradise</AppText><Pressable accessibilityRole="button" accessibilityLabel="Close app information" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><Icon name="close" /></Pressable></View>
    <AppText color={colors.textSecondary}>Destination Paradise brings Zanzibar and Tanzania together. Explore places, shape a trip and choose your season.</AppText>
    <Surface><AppText variant="heading">Your trip, on this device</AppText><AppText>We save your trip preferences and {savedIds.length} saved {savedIds.length === 1 ? 'place' : 'places'} on this device. Your planner conversation and contact details stay in this session and are not saved locally.</AppText><AppText color={colors.textSecondary}>Planner messages are sent to our AI planning service after you agree. A quote request is sent to our team only when you review it and tap Send quote request.</AppText>
      {confirmClear ? <><AppText>Clear saved places and reset trip preferences on this device?</AppText><Button label="Clear saved trip data" icon="trash" onPress={() => { clearSavedData(); setConfirmClear(false); setStatus('Saved places and trip preferences cleared.'); }} /><Button label="Keep my saved data" variant="secondary" onPress={() => setConfirmClear(false)} /></> : <Button label="Clear saved trip data" variant="secondary" icon="trash" onPress={() => setConfirmClear(true)} />}
    </Surface>
    <Surface><AppText variant="heading">Stay connected</AppText><AppText color={colors.textSecondary}>Maps, photos, current weather and the AI planner need an internet connection. Destination and seasonal guides are bundled with the app.</AppText><Button label="Visit our website" variant="secondary" icon="external" onPress={() => open(websiteUrl)} /><Button label="Privacy policy" variant="ghost" icon="shield" onPress={() => open(privacyPolicyUrl)} /></Surface>
    <Surface><AppText variant="heading">Sources & credits</AppText><AppText variant="caption">Destinations, guides and seasonal information: Destination Paradise. Map: Leaflet and OpenStreetMap contributors. Current weather: Apple Weather. Photography: the Destination Paradise website.</AppText><Button label="OpenStreetMap contributors" variant="ghost" icon="external" onPress={() => open('https://www.openstreetmap.org/copyright')} /><Button label="Apple Weather attribution" variant="ghost" icon="external" onPress={() => open('https://developer.apple.com/weatherkit/data-source-attribution/')} /></Surface>
    {!!status && <AppText accessibilityRole="alert">{status}</AppText>}<AppText variant="caption" color={colors.muted}>Destination Paradise · Version 1.0.0</AppText>
  </ScrollView>;
}
