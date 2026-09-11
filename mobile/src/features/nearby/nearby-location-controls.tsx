import { useState } from 'react';
import { ActivityIndicator, Linking, Platform, View } from 'react-native';
import { AppText, Button, Surface } from '@/src/components/ui';
import { colors } from '@/src/theme';
import { useNearbyLocation } from './nearby-location-provider';
import type { NearbyRecommendations } from './nearby-model';

type Props = {
  recommendations: NearbyRecommendations | null;
  onClearFilters: () => void;
  compact?: boolean;
};

const messages: Record<string, string> = {
  denied: 'Location access is off. Allow approximate location or choose an area.',
  'services-off': 'Location services are switched off. Switch them on in device settings, then try again.',
  unavailable: 'Your location could not be found. Try again somewhere with a clearer signal, or choose an area.',
  timeout: 'Finding your location took too long. Try again, or browse an area without location.',
  stale: 'Your location is out of date. Refresh it or choose an area.',
  inaccurate: 'The available location covers too large an area for useful suggestions. Try again or choose an area.',
  idle: 'Location lookup is paused. Refresh when you are ready for nearby suggestions.',
};

export default function NearbyLocationControls({ recommendations, onClearFilters, compact = false }: Props) {
  const nearby = useNearbyLocation();
  const [settingsError, setSettingsError] = useState('');
  const busy = nearby.status === 'checking' || nearby.status === 'locating';
  const ready = nearby.enabled && nearby.status === 'ready' && !!nearby.location && !!recommendations;
  const needsSettings = nearby.status === 'denied' && !nearby.canAskAgain;
  const available = ready && recommendations?.status === 'ready';
  async function openSettings() {
    setSettingsError('');
    try { await Linking.openSettings(); }
    catch { setSettingsError('Open your device settings and allow location for Destination Paradise, then return and try again.'); }
  }

  return <Surface style={compact ? { padding: 12, gap: 8, borderRadius: 16 } : undefined}>
    {!nearby.hydrated ? <AppText accessibilityLiveRegion="polite">Opening nearby preferences…</AppText> : !nearby.enabled && !busy && nearby.status !== 'denied' ? <>
      <AppText>{compact ? 'See your approximate position and nearby places.' : 'Discover tours and trip ideas near you in Zanzibar and Tanzania.'}</AppText>
      <AppText variant="caption" color={colors.textSecondary}>Approximate coordinates are used on this device and are not sent to our planner. OpenStreetMap receives the map area you view, which can reveal your approximate area.</AppText>
      {!compact && <AppText variant="caption">After you opt in, suggestions refresh when you reopen or return to the app. You can turn this off at any time.</AppText>}
      <Button label="Use my location" icon="pin" onPress={() => void nearby.enable()} />
    </> : busy ? <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><ActivityIndicator color={colors.coral} /><AppText accessibilityLiveRegion="polite" style={{ flex: 1 }}>Finding places near you…</AppText></View>
      <Button label="Cancel location lookup" variant="secondary" onPress={nearby.cancel} />
    </> : !ready ? <>
      <AppText selectable accessibilityRole="alert">{messages[nearby.status] || 'Refresh your location to find nearby trips.'}</AppText>
      {needsSettings && Platform.OS !== 'web' && <Button label="Open device settings" icon="settings" onPress={() => void openSettings()} />}
      {needsSettings && Platform.OS === 'web' && <AppText variant="caption">Allow location in your browser's site settings, then try again. Location requires HTTPS or localhost.</AppText>}
      <Button label={nearby.status === 'denied' && nearby.canAskAgain ? 'Allow location' : 'Try location again'} icon="refresh" variant="secondary" onPress={() => void (nearby.status === 'denied' && nearby.canAskAgain ? nearby.enable() : nearby.refresh())} />
    </> : recommendations?.status === 'outside-coverage' || recommendations?.status === 'invalid-location' ? <>
      <AppText variant={compact ? 'body' : 'heading'}>No nearby places in our Tanzania guide</AppText>
      {!compact && <AppText color={colors.textSecondary}>Choose Zanzibar or Mainland to explore where you would like to go.</AppText>}
    </> : recommendations?.status === 'no-matches' ? <>
      <AppText>No nearby places match these filters.</AppText>
      <Button label="Clear nearby filters" variant="secondary" onPress={onClearFilters} />
    </> : <AppText selectable accessibilityLiveRegion="polite" variant={compact ? 'caption' : 'body'} color={colors.textSecondary}>{recommendations?.destinations.length ?? 0} nearby {(recommendations?.destinations.length ?? 0) === 1 ? 'place' : 'places'} · Approximate location</AppText>}

    {nearby.enabled && !busy && <View style={{ flexDirection: compact ? 'row' : 'column', gap: 8 }}>
      {ready && <Button label={compact ? 'Refresh' : 'Refresh my location'} accessibilityLabel="Refresh my location" icon="refresh" variant="secondary" style={compact ? { flex: 1 } : undefined} onPress={() => void nearby.refresh()} />}
      <Button label={compact ? 'Turn off' : 'Turn off nearby suggestions'} accessibilityLabel="Turn off nearby suggestions" variant="ghost" style={compact && ready ? { flex: 1 } : undefined} labelStyle={compact && ready ? { flex: 1 } : undefined} onPress={nearby.disable} />
    </View>}
    {!compact && available && <AppText variant="caption">Distances are approximate. You can refresh your position or turn Nearby off at any time.</AppText>}
    {!!nearby.storageError && <AppText selectable accessibilityRole="alert" variant="caption">{nearby.storageError}</AppText>}
    {!!settingsError && <AppText selectable accessibilityRole="alert" variant="caption">{settingsError}</AppText>}
  </Surface>;
}
