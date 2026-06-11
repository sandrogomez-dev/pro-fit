import { Stack } from 'expo-router';

import { useRoutinesSync } from '@/features/routines';
import { colors, fontWeight } from '@/theme';

/** Stack for the authenticated app. Drives routines sync while mounted. */
export default function AppLayout() {
  useRoutinesSync();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.accent,
        headerShadowVisible: false,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: fontWeight.extrabold,
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="routine/[id]" options={{ title: 'Routine' }} />
    </Stack>
  );
}
