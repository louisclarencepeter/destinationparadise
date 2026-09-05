import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat/400Regular';
import { Montserrat_500Medium } from '@expo-google-fonts/montserrat/500Medium';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat/700Bold';
import { PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display/400Regular';
import { KaushanScript_400Regular } from '@expo-google-fonts/kaushan-script/400Regular';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TripStoreProvider, useTripStore } from '@/src/state/trip-store';
import { AppText } from '@/src/components/ui';
import { MotionProvider, useReducedMotion } from '@/src/components/motion';
import { colors } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';
void SplashScreen.preventAutoHideAsync().catch(() => undefined);
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

function Navigation() {
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { hydrated, storageError } = useTripStore();
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 }}><ActivityIndicator color={colors.coral} /><AppText>Opening your paradise…</AppText></View>;
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    {!!storageError && <View accessibilityRole="alert" style={{ backgroundColor: colors.surfaceRaised, paddingTop: insets.top + 12, paddingBottom: 12, paddingLeft: Math.max(insets.left, 12), paddingRight: Math.max(insets.right, 12) }}><AppText variant="caption">{storageError}</AppText></View>}
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" options={{ presentation: 'modal', animation: reducedMotion ? 'none' : 'slide_from_bottom' }} />
    </Stack>
  </View>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Montserrat: Montserrat_400Regular, MontserratMedium: Montserrat_500Medium, MontserratBold: Montserrat_700Bold, PlayfairDisplay: PlayfairDisplay_400Regular, KaushanScript: KaushanScript_400Regular });
  useEffect(() => { if (fontsLoaded || fontError) void SplashScreen.hideAsync(); }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return null;
  return <SafeAreaProvider><MotionProvider><QueryClientProvider client={queryClient}><TripStoreProvider><StatusBar style="light" /><Navigation /></TripStoreProvider></QueryClientProvider></MotionProvider></SafeAreaProvider>;
}
