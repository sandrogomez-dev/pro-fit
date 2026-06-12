import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Button, Screen } from '@/components';
import {
  selectExercisesForRoutine,
  selectRoutineById,
  useRoutinesStore,
  useWorkoutStore,
} from '@/store';
import { colors, fontSize, fontWeight, spacing, tracking } from '@/theme';

import { ExerciseLog } from '../components/ExerciseLog';

export function WorkoutScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const router = useRouter();
  const routine = useRoutinesStore(selectRoutineById(routineId));
  const exercises = useRoutinesStore(useShallow(selectExercisesForRoutine(routineId)));
  const startSession = useWorkoutStore((s) => s.startSession);
  const finishSession = useWorkoutStore((s) => s.finishSession);

  // Start (or resume) a session for this routine.
  useEffect(() => {
    const current = useWorkoutStore.getState().session;
    if (!current || current.routineId !== routineId) startSession(routineId);
  }, [routineId, startSession]);

  if (!routine) {
    return (
      <Screen centered>
        <Text style={styles.gone}>This routine is no longer available.</Text>
      </Screen>
    );
  }

  const onFinish = () => {
    finishSession();
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: routine.name }} />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>WORKOUT IN PROGRESS</Text>
            <Text style={styles.title}>{routine.name}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No exercises in this routine</Text>
            <Text style={styles.emptyText}>Add exercises to it first, then come back to log.</Text>
          </View>
        }
        renderItem={({ item }) => <ExerciseLog exercise={item} />}
      />

      {exercises.length > 0 && (
        <Button title="Finish workout" onPress={onFinish} style={styles.finish} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    letterSpacing: tracking.wider,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: tracking.tight,
  },
  list: {
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  gone: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  finish: {
    marginVertical: spacing.md,
  },
});
