import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { fetchWeather } from '@/src/api';
import { contentProvenance, monthlySeasons, seasonLegend } from '@/src/data/content';
import { AppText, Button, Chip, Icon, Surface } from '@/src/components/ui';
import { AnimatedPressable, Reveal, useReducedMotion } from '@/src/components/motion';
import { WeatherScene } from './weather-scene';
import { colors, fonts } from '@/src/theme';
import { useTripStore } from '@/src/state/trip-store';

const SEASON_COLORS = { peak: '#FF9183', high: '#A9D3E8', low: '#9BB2C2' };
// Editorial guidance preserved from the approved mobile design, not a live forecast.
const MONTH_NOTES = [
  'Festive-season peak. Premium rates, and worth booking early.',
  'The warmest month on our seasonal guide, and one of the busy dry months at standard high-season rates.',
  'Rainy season. Lower rates and quieter beaches can make this a flexible time to visit.',
  'Rainy season. Look for lower rates, but some hotels close through April and May.',
  'Rainy season. Lower rates, and some hotels stay closed until June.',
  'The first of the busy dry months. Expect standard high-season hotel rates.',
  'European summer peak. Premium hotel rates. Check any festival dates directly before booking flights.',
  'European summer peak. Premium hotel rates, with popular beach stays worth planning ahead.',
  'A busy dry month after the summer peak. Standard high-season hotel rates.',
  'The last of the busy dry months in our guide. Standard high-season hotel rates.',
  'Rainy season. Lower rates and quieter beaches, with flexibility for passing showers.',
  'Festive-season peak from mid-month. Premium hotel rates, and worth booking early.',
];

function readingTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Dar_es_Salaam' }).format(new Date(value));
}

export default function WeatherScreen({ onPlan }: { onPlan: (month: string) => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tablet = width >= 760;
  const reducedMotion = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(false);
  const sceneSize = tablet ? (width < 1000 ? 108 : 154) : width < 380 ? 106 : 136;
  const { preferences, setPreferences } = useTripStore();
  const [selectedMonth, setSelectedMonth] = useState(() => monthlySeasons.find((item) => item.month === preferences.month)?.monthIndex ?? Number(new Intl.DateTimeFormat('en', { month: 'numeric', timeZone: 'Africa/Dar_es_Salaam' }).format(new Date())) - 1);
  const [linkError, setLinkError] = useState<string | null>(null);
  useEffect(() => {
    const current = monthlySeasons.find((item) => item.month === preferences.month);
    if (current) setSelectedMonth(current.monthIndex);
  }, [preferences.month]);
  const { data, isPending, isFetching, fetchStatus, error, refetch } = useQuery({
    queryKey: ['weather', 'apple-weather', 'zanzibar'],
    queryFn: ({ signal }) => fetchWeather({ signal }),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  const selected = monthlySeasons.find((item) => item.monthIndex === selectedMonth) || monthlySeasons[0];
  const connectionPaused = fetchStatus === 'paused';
  const staleReading = !!data && Date.now() - Date.parse(data.observedAt) > 90 * 60 * 1000;
  // Refreshing state changes buttons only; reveal again when the actual reading changes.
  const readingKey = data ? `${data.observedAt}:${data.temperature}:${data.humidity}:${data.seaTemperature}` : 'loading';

  async function openSource(url: string) {
    setLinkError(null);
    try { await Linking.openURL(url); } catch { setLinkError('The source could not open. Please try again.'); }
  }

  const liveWeather = <View style={{ gap: 16 }}>
    <Reveal style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="pin" color={colors.coral} size={18} />
        <AppText style={{ fontFamily: fonts.sansBold, fontSize: 18 }}>Zanzibar</AppText>
      </View>
      <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#263D43', borderWidth: 1, borderColor: '#3D6261' }}><AppText variant="caption" color={colors.success}>{connectionPaused ? 'OFFLINE' : isPending ? 'CONNECTING' : data ? staleReading ? 'LAST READING' : 'CURRENT WEATHER' : 'UNAVAILABLE'}</AppText></View>
    </Reveal>
    <Reveal motionKey={readingKey}>
    <LinearGradient colors={['#102A3D', '#091F2F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 28, borderCurve: 'continuous', borderWidth: 1, borderColor: '#284052', padding: tablet ? 28 : 22, gap: 23, overflow: 'hidden' }}>
      {isPending && !connectionPaused ? <View style={{ paddingVertical: 48, alignItems: 'center', gap: 16 }}><ActivityIndicator color={colors.coral} size="large" /><AppText color={colors.textSecondary}>Checking the island weather…</AppText></View> : data ? <>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
          <View style={{ gap: 5, flex: 1 }}>
            <AppText selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={{ fontFamily: fonts.serif, fontSize: tablet && width >= 1000 ? 80 : width < 380 ? 58 : 68, lineHeight: tablet && width >= 1000 ? 90 : 78, fontVariant: ['tabular-nums'] }}>{data.temperature}°</AppText>
            <AppText selectable color={colors.textSecondary}>{data.description}</AppText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <WeatherScene weather={data} size={sceneSize} paused={motionPaused} />
            {!reducedMotion ? <AnimatedPressable accessibilityRole="button" accessibilityLabel={motionPaused ? 'Play weather animation' : 'Pause weather animation'} onPress={() => setMotionPaused((paused) => !paused)} style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? 0.7 : 1 })}>
              <Icon name={motionPaused ? 'play' : 'pause'} size={13} color={colors.muted} />
              <AppText variant="caption" style={{ fontSize: 10 }}>{motionPaused ? 'Play animation' : 'Pause animation'}</AppText>
            </AnimatedPressable> : null}
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[
            ['Sea temperature', data.seaTemperature == null ? 'Unavailable' : `${data.seaTemperature}°C`],
            ['Humidity', data.humidity == null ? 'Unavailable' : `${data.humidity}%`],
            ['Sunrise', data.sunrise || 'Unavailable'],
            ['Sunset', data.sunset || 'Unavailable'],
          ].map(([label, value]) => <View key={label} style={{ width: '47%', flexGrow: 1, backgroundColor: '#132D40', borderRadius: 16, borderWidth: 1, borderColor: '#243E50', padding: 15, gap: 8 }}>
            <AppText variant="caption" color={colors.muted}>{label}</AppText>
            <AppText selectable style={{ fontFamily: fonts.sansMedium, fontSize: value === 'Unavailable' ? 14 : 21, fontVariant: ['tabular-nums'] }}>{value}</AppText>
          </View>)}
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, gap: 7 }}>
          <AppText selectable variant="caption" color={colors.textSecondary}>Updated {readingTime(data.observedAt)} · Zanzibar time (EAT)</AppText>
          <AppText variant="caption" color={colors.muted}>Current conditions from {data.source}. Temperatures in °C.</AppText>
          <Image source={require('../../../assets/apple-weather-dark.png')} contentFit="contain" accessibilityLabel="Apple Weather" style={{ width: 108, height: 24, marginVertical: 3 }} />
          <Pressable accessibilityRole="link" accessibilityLabel="Apple Weather legal attribution and data sources" onPress={() => void openSource(data.sourceUrl)} style={{ minHeight: 44, justifyContent: 'center' }}><AppText variant="caption" color={colors.coral}>Legal attribution and data sources ↗</AppText></Pressable>
          {staleReading ? <AppText variant="caption" color={colors.coral}>This reading is over 90 minutes old. Refresh for the latest available data.</AppText> : null}
          {data.marineUnavailable ? <AppText variant="caption" color={colors.muted}>Sea temperature is not provided by Apple Weather.</AppText> : null}
        </View>
      </> : <View style={{ paddingVertical: 16, gap: 16 }}>
        <Icon name="cloud" size={55} color={colors.muted} />
        <AppText variant="heading">Weather is taking a moment.</AppText>
        <AppText selectable color={colors.textSecondary}>{connectionPaused ? 'You’re offline. Current conditions will load when your connection returns. The seasonal guide is available below.' : error instanceof Error ? error.message : 'Current conditions could not be loaded. Your seasonal guide is available below.'}</AppText>
        <Button label="Try again" icon="refresh" onPress={() => void refetch()} loading={isFetching} />
      </View>}
      {data ? <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <Button label="Refresh" variant="secondary" icon="refresh" loading={isFetching} onPress={() => void refetch()} />
        <Button label="Source" variant="ghost" icon="external" onPress={() => void openSource(data.sourceUrl)} />
      </View> : null}
    </LinearGradient>
    </Reveal>
    {error && data ? <Surface style={{ padding: 15, borderColor: '#8F534D' }}><AppText selectable variant="caption" color={colors.coral}>Refresh failed. Showing the previous reading from {readingTime(data.observedAt)} EAT.</AppText></Surface> : null}
    {connectionPaused && data ? <Surface style={{ padding: 15, borderColor: '#8F534D' }}><AppText selectable variant="caption" color={colors.coral}>You’re offline. Showing the last reading from {readingTime(data.observedAt)} EAT. Refresh will resume when your connection returns.</AppText></Surface> : null}
    {linkError ? <AppText selectable variant="caption" color={colors.coral}>{linkError}</AppText> : null}
    <Surface style={{ padding: 20, gap: 10 }}>
      <AppText variant="label" color={colors.coral}>THE ISLAND HAS ITS OWN RHYTHM</AppText>
      <AppText style={{ fontFamily: fonts.script, fontSize: 25, lineHeight: 36 }}>A little sun. A little sea.</AppText>
      <AppText color={colors.textSecondary}>Use today’s conditions for the moment, and the monthly guide to choose the shape of your trip.</AppText>
    </Surface>
  </View>;

  const seasonalGuide = <View style={{ gap: 18 }}>
    <Reveal delay={60} style={{ gap: 8 }}>
      <AppText variant="label" color={colors.coral}>SEASONAL TEMPERATURE GUIDE</AppText>
      <AppText style={{ fontFamily: fonts.script, fontSize: 30, lineHeight: 42 }}>When to come, and what it costs.</AppText>
      <AppText variant="caption" color={colors.muted}>Typical monthly temperatures and hotel seasons from our website. A planning guide, not a forecast for your dates.</AppText>
    </Reveal>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {monthlySeasons.map((item) => <Chip key={item.month} label={item.shortName} accessibilityLabel={`${item.month}, ${item.temperature} degrees Celsius, ${item.season} season`} selected={item.monthIndex === selectedMonth} onPress={() => setSelectedMonth(item.monthIndex)} />)}
    </View>
    <Reveal motionKey={selected.month}>
    <Surface style={{ padding: 22, gap: 19 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 15 }}>
        <View style={{ flex: 1, gap: 7 }}>
          <AppText variant="heading">{selected.month}</AppText>
          <AppText variant="caption" color={colors.muted}>Typical daytime temperature</AppText>
        </View>
        <AppText selectable style={{ fontFamily: fonts.serif, fontSize: 39, lineHeight: 46 }}>{selected.temperature}°C</AppText>
      </View>
      <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: colors.surfaceRaised }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: SEASON_COLORS[selected.season] }} />
        <AppText variant="caption" color={SEASON_COLORS[selected.season]} style={{ textTransform: 'uppercase', fontFamily: fonts.sansBold }}>{selected.season} hotel season</AppText>
      </View>
      <AppText color={colors.textSecondary} style={{ lineHeight: 25 }}>{MONTH_NOTES[selected.monthIndex]}</AppText>
      <Button label={`Plan for ${selected.month}`} icon="arrow-right" onPress={() => { setPreferences({ month: selected.month }); onPlan(selected.month); }} />
    </Surface>
    </Reveal>
    <Surface style={{ padding: 20, gap: 17, backgroundColor: 'transparent' }}>
      <AppText variant="label" color={colors.muted}>HOTEL SEASONS</AppText>
      {(['peak', 'high', 'low'] as const).map((season) => <View key={season} style={{ flexDirection: 'row', gap: 11 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 7, backgroundColor: SEASON_COLORS[season] }} />
        <AppText style={{ flex: 1, fontSize: 13, lineHeight: 22 }} color={colors.textSecondary}><AppText style={{ fontFamily: fonts.sansBold, fontSize: 13 }}>{seasonLegend[`${season}_label`]} — </AppText>{seasonLegend[`${season}_text`]}</AppText>
      </View>)}
      <Pressable accessibilityRole="link" onPress={() => void openSource(`${contentProvenance.website}/#weather`)} style={{ minHeight: 44, justifyContent: 'center' }}><AppText variant="caption" color={colors.coral}>View the website guide ↗</AppText></Pressable>
    </Surface>
  </View>;

  return <ScrollView contentInsetAdjustmentBehavior="never" style={{ flex: 1, backgroundColor: colors.background }} refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={() => void refetch()} tintColor={colors.coral} colors={[colors.coral]} />} contentContainerStyle={{ padding: tablet ? 30 : 18, paddingTop: insets.top + 18, paddingBottom: 32, width: '100%', maxWidth: 1240, alignSelf: 'center', gap: 23 }}>
    <View style={{ flexDirection: tablet ? 'row' : 'column', gap: tablet ? 32 : 30, alignItems: 'flex-start' }}>
      <View style={{ width: tablet ? '44%' : '100%' }}>{liveWeather}</View>
      <View style={tablet ? { flex: 1 } : { width: '100%' }}>{seasonalGuide}</View>
    </View>
  </ScrollView>;
}
