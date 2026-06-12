import { Stack } from 'expo-router';

import { useRoutinesSync } from '@/features/routines';
import { useWorkoutSync } from '@/features/workouts';
import { colors, fontWeight } from '@/theme';

/** Stack for the authenticated app. Drives local-first sync while mounted. */
export default function AppLayout() {
  useRoutinesSync();
  useWorkoutSync();

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
      <Stack.Screen name="workout/[routineId]" options={{ title: 'Workout' }} />
    </Stack>
  );
}
