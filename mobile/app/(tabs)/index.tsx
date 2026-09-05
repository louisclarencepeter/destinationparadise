import { router } from 'expo-router';
import ExploreScreen from '@/src/features/explore/explore-screen';
import { useTripStore } from '@/src/state/trip-store';

export default function ExploreRoute() {
  const { setPreferences } = useTripStore();
  return <ExploreScreen onPlan={(destinationId) => { setPreferences({ destinationId }); router.navigate('/planner'); }} />;
}
