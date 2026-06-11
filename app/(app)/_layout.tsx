import { Stack } from 'expo-router';

import { useRoutinesSync } from '@/features/routines';
import { colors } from '@/theme';

/** Stack for the authenticated app. Drives routines sync while mounted. */
export default function AppLayout() {
  useRoutinesSync();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Routines' }} />
      <Stack.Screen name="routine/[id]" options={{ title: 'Routine' }} />
    </Stack>
  );
}
