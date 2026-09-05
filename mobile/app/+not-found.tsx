import { router } from 'expo-router';
import { View } from 'react-native';
import { AppText, Button } from '@/src/components/ui';
import { colors } from '@/src/theme';
export default function NotFound() { return <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 20, backgroundColor: colors.background }}><AppText variant="title">A little off the path</AppText><AppText>This page could not be found.</AppText><Button label="Explore paradise" onPress={() => router.replace('/')} /></View>; }
