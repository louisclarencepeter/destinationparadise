import { router } from 'expo-router';
import WeatherScreen from '@/src/features/weather/weather-screen';
import { useTripStore } from '@/src/state/trip-store';
export default function WeatherRoute() {
  const { setPreferences } = useTripStore();
  return <WeatherScreen onPlan={(month) => { setPreferences({ month }); router.navigate('/planner'); }} />;
}
