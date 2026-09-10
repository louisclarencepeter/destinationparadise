import { ScrollView, View, useWindowDimensions } from 'react-native';
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
import NearbyLocationControls from './nearby-location-controls';

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
  const ready = nearby.enabled && nearby.status === 'ready' && !!nearby.location && !!recommendations;
  return <ScrollView testID="nearby-content" contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 28 }}>
    {height >= 500 && <Reveal motionKey={ready ? 'nearby-ready' : 'nearby-intro'}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={{ padding: 12, borderRadius: 18, backgroundColor: colors.surfaceRaised }}><Icon name="compass" size={26} color={colors.coral} /></View>
        <View style={{ flex: 1, gap: 3 }}><AppText variant="label" color={colors.coral}>A little closer to paradise</AppText><AppText variant="heading">{ready ? 'Trips around you' : 'Find your next adventure'}</AppText></View>
      </View>
    </Reveal>}

    <NearbyLocationControls recommendations={recommendations} onClearFilters={onClearFilters} />
    {ready && recommendations.status === 'ready' && <>
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

    <View style={{ gap: 10 }}><AppText variant="label">Or choose an area</AppText><View style={{ flexDirection: 'row', gap: 10 }}><Button label="Zanzibar" variant="secondary" onPress={() => onBrowse('Zanzibar')} style={{ flex: 1 }} /><Button label="Mainland" variant="secondary" onPress={() => onBrowse('Mainland')} style={{ flex: 1 }} /></View></View>
  </ScrollView>;
}
