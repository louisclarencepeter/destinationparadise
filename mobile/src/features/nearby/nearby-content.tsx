import { Linking, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { Image } from 'expo-image';
import { AppText, Button, Icon, Surface } from '@/src/components/ui';
import { Reveal } from '@/src/components/motion';
import { colors, fonts } from '@/src/theme';
import type { Destination } from '@/src/data/content';
import { ExternalRow } from '@/src/features/explore/explore-ui';
import { websiteUrl } from '@/src/features/explore/explore-model';
import { useNearbyLocation } from './nearby-location-provider';
import type { recommendNearby } from './nearby-model';
import { nearbyImages } from './nearby-images';

type Props = {
  recommendations: ReturnType<typeof recommendNearby> | null;
  onSelect: (id: string) => void;
  onPlan: (id: string) => void;
  onBrowse: (region: Destination['region']) => void;
  onClearFilters: () => void;
};

const distanceLabel = (km: number) => km < 1 ? 'Less than 1 km' : `About ${Math.round(km)} km`;

export default function NearbyContent({ recommendations, onSelect, onPlan, onBrowse, onClearFilters }: Props) {
  const nearby = useNearbyLocation();
  const { height } = useWindowDimensions();
  const [settingsError, setSettingsError] = useState('');
  const busy = nearby.status === 'checking' || nearby.status === 'locating';
  const ready = nearby.enabled && nearby.status === 'ready' && !!nearby.location && !!recommendations;
  const needsSettings = nearby.status === 'denied' && !nearby.canAskAgain;
  async function openSettings() {
    try { await Linking.openSettings(); }
    catch { setSettingsError('Open your device settings and allow location for Destination Paradise, then return and try again.'); }
  }
  const messages: Record<string, string> = {
    denied: 'Location access is off. You can allow approximate location or choose an area below.',
    'services-off': 'Location services are switched off on this device. Switch them on in device settings, then try again.',
    unavailable: 'Your location could not be found. Try again somewhere with a clearer signal, or choose an area.',
    timeout: 'Finding your location took too long. Try again, or browse an area without location.',
    stale: 'The available location is too old or too approximate for useful suggestions. Refresh it or choose an area.',
    inaccurate: 'The available location covers too large an area for useful suggestions. Try again or choose an area below.',
    idle: 'Location lookup is paused. Refresh when you are ready for nearby suggestions.',
  };
  return <ScrollView testID="nearby-content" contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 28 }}>
    {height >= 500 && <Reveal motionKey={ready ? 'nearby-ready' : 'nearby-intro'}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={{ padding: 12, borderRadius: 18, backgroundColor: colors.surfaceRaised }}><Icon name="compass" size={26} color={colors.coral} /></View>
        <View style={{ flex: 1, gap: 3 }}><AppText variant="label" color={colors.coral}>A little closer to paradise</AppText><AppText variant="heading">{ready ? 'Trips around you' : 'Find your next adventure'}</AppText></View>
      </View>
    </Reveal>}

    {!nearby.hydrated ? <AppText accessibilityLiveRegion="polite">Opening nearby preferences…</AppText> : !nearby.enabled && !busy && nearby.status !== 'denied' ? <Surface>
      <AppText>Discover tours and trip ideas near you in Zanzibar and Tanzania.</AppText>
      <AppText color={colors.textSecondary}>Allow approximate location to match you with our destination guide. Your location stays on this device and is never sent to the planner.</AppText>
      <AppText variant="caption">After you opt in, suggestions refresh when you reopen or return to the app. You can turn this off at any time.</AppText>
      {!!messages[nearby.status] && <AppText accessibilityRole="alert">{messages[nearby.status]}</AppText>}
      <Button label="Use my location" icon="pin" onPress={() => void nearby.enable()} />
    </Surface> : busy ? <Surface>
      {height >= 500 && <Button label="Finding trips near you…" loading onPress={() => undefined} />}
      <AppText accessibilityLiveRegion="polite" color={colors.textSecondary}>{height < 500 ? 'Finding trips near you…' : 'Checking your approximate location. This can take a few moments.'}</AppText>
      <Button label="Cancel location lookup" variant="secondary" onPress={nearby.cancel} />
    </Surface> : !ready ? <Surface>
      <AppText selectable accessibilityRole="alert">{messages[nearby.status] || 'Refresh your location to find nearby trips.'}</AppText>
      {needsSettings && Platform.OS !== 'web' && <Button label="Open device settings" icon="settings" onPress={() => void openSettings()} />}
      {needsSettings && Platform.OS === 'web' && <AppText variant="caption">Allow location in your browser's site settings, then try again. Location requires HTTPS or localhost.</AppText>}
      <Button label={nearby.status === 'denied' && nearby.canAskAgain ? 'Allow location' : 'Try location again'} icon="refresh" variant="secondary" onPress={() => void (nearby.status === 'denied' && nearby.canAskAgain ? nearby.enable() : nearby.refresh())} />
    </Surface> : recommendations.status === 'outside-coverage' || recommendations.status === 'invalid-location' ? <Surface>
      <AppText variant="heading">Plan a trip to Tanzania</AppText>
      <AppText>Our guide covers Zanzibar and mainland Tanzania. We do not have trips close enough to your current location to call them nearby.</AppText>
      <AppText color={colors.textSecondary}>Choose an area below to explore where you would like to go.</AppText>
    </Surface> : recommendations.status === 'no-matches' ? <Surface>
      <AppText variant="heading">No nearby matches</AppText><AppText>{height < 500 ? 'Try another interest or clear the filters.' : 'Try another interest, clear your search, or browse all nearby suggestions.'}</AppText>
      <Button label="Clear nearby filters" variant="secondary" onPress={onClearFilters} />
    </Surface> : <>
      <View style={{ gap: 6 }}>
        <AppText selectable color={colors.textSecondary}>Suggested from places within {recommendations.radiusKm} km.</AppText>
        <AppText selectable variant="caption">Approximate straight-line distances to the named destination, not to a tour pickup point. Travel time and meeting points are confirmed with your quote.</AppText>
        <AppText selectable variant="caption">Island and mainland trips can require a boat or flight, even when the distance looks short.</AppText>
      </View>
      {recommendations.experiences.length > 0 && <AppText variant="heading">Tours & trip ideas</AppText>}
      {recommendations.experiences.map((trip) => <View key={trip.id} style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
        <View><Image source={nearbyImages[trip.destination.id]} accessibilityLabel={trip.destination.imageLabel} contentFit="cover" style={{ height: 150, width: '100%' }} />{trip.destination.imageIsRepresentative && <View style={{ position: 'absolute', bottom: 8, right: 8, left: 8, padding: 6, borderRadius: 8, backgroundColor: '#071C2BE6' }}><AppText variant="caption">{trip.destination.imageLabel}</AppText></View>}</View>
        <View style={{ padding: 16, gap: 12 }}>
          <AppText variant="label" color={colors.coral}>{trip.kind === 'package' ? 'Trip package' : trip.kind === 'safari' ? 'Safari' : 'Tour'}</AppText>
          <AppText selectable style={{ fontFamily: fonts.sansBold, fontSize: 19, lineHeight: 27 }}>{trip.label}</AppText>
          <AppText selectable variant="caption">{distanceLabel(trip.distanceKm)} to {trip.destination.name} · {trip.destination.region}</AppText>
          <ExternalRow label="View trip details" detail="Opens our website" url={websiteUrl(trip.to)} />
          <Button label={`Explore ${trip.destination.name}`} variant="secondary" icon="map" onPress={() => onSelect(trip.destination.id)} />
        </View>
      </View>)}
      {recommendations.destinations.length > 0 && <AppText variant="heading">Places to start from</AppText>}
      {recommendations.destinations.map(({ destination, distanceKm }) => <Surface key={destination.id}>
        <AppText selectable variant="heading">{destination.name}</AppText>
        <AppText selectable color={colors.textSecondary}>{destination.desc}</AppText>
        <AppText selectable variant="caption">{distanceLabel(distanceKm)} to this destination</AppText>
        <Button label={`Plan from ${destination.name}`} icon="planner" onPress={() => onPlan(destination.id)} />
      </Surface>)}
      <AppText variant="caption">Suggestions use our destination guide. Prices, availability and transfers are confirmed by the team.</AppText>
    </>}

    {nearby.enabled && !busy && <View style={{ gap: 8 }}>
      <Button label="Refresh my location" icon="refresh" variant="secondary" onPress={() => void nearby.refresh()} />
      <Button label="Turn off nearby suggestions" variant="ghost" onPress={nearby.disable} />
    </View>}
    <View style={{ gap: 10 }}><AppText variant="label">Or choose an area</AppText><View style={{ flexDirection: 'row', gap: 10 }}><Button label="Zanzibar" variant="secondary" onPress={() => onBrowse('Zanzibar')} style={{ flex: 1 }} /><Button label="Mainland" variant="secondary" onPress={() => onBrowse('Mainland')} style={{ flex: 1 }} /></View></View>
    {!!nearby.storageError && <AppText selectable accessibilityRole="alert" variant="caption">{nearby.storageError}</AppText>}
    {!!settingsError && <AppText selectable accessibilityRole="alert" variant="caption">{settingsError}</AppText>}
  </ScrollView>;
}
