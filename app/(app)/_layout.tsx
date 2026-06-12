import { Stack } from 'expo-router';
import { View } from 'react-native';

import { useRoutinesSync } from '@/features/routines';
import { RestTimerBar } from '@/features/timer';
import { useWorkoutSync } from '@/features/workouts';
import { colors, fontWeight } from '@/theme';

/** Stack for the authenticated app. Drives local-first sync and the rest timer. */
export default function AppLayout() {
  useRoutinesSync();
  useWorkoutSync();

  return (
    <View style={{ flex: 1 }}>
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
        <Stack.Screen name="exercise/[id]" options={{ title: 'Exercise' }} />
        <Stack.Screen name="workout/[routineId]" options={{ title: 'Workout' }} />
      </Stack>
      <RestTimerBar />
    </View>
  );
}
