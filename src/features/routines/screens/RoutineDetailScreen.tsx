import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Button, Screen, TextField } from '@/components';
import {
  selectExercisesForRoutine,
  selectRoutineById,
  useRoutinesStore,
} from '@/store';
import { colors, fontSize, fontWeight, spacing, tracking } from '@/theme';

import { ExerciseRow } from '../components/ExerciseRow';

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const routine = useRoutinesStore(selectRoutineById(id));
  const exercises = useRoutinesStore(useShallow(selectExercisesForRoutine(id)));
  const renameRoutine = useRoutinesStore((s) => s.renameRoutine);
  const addExercise = useRoutinesStore((s) => s.addExercise);
  const deleteExercise = useRoutinesStore((s) => s.deleteExercise);

  const [exName, setExName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  if (!routine) {
    return (
      <Screen centered>
        <Text style={styles.gone}>This routine is no longer available.</Text>
      </Screen>
    );
  }

  const onAddExercise = () => {
    const name = exName.trim();
    if (name === '') return;
    addExercise(routine.id, {
      name,
      target_sets: parseOptionalInt(sets),
      target_reps: parseOptionalInt(reps),
    });
    setExName('');
    setSets('');
    setReps('');
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: routine.name }} />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <TextField
              label="Routine name"
              value={routine.name}
              onChangeText={(text) => renameRoutine(routine.id, text)}
              autoCapitalize="sentences"
            />
            {exercises.length > 0 && (
              <Button
                title="Start workout"
                onPress={() =>
                  router.push({
                    pathname: '/workout/[routineId]',
                    params: { routineId: routine.id },
                  })
                }
              />
            )}
            <Text style={styles.sectionTitle}>Exercises</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No exercises yet. Add one below.</Text>
        }
        renderItem={({ item }) => (
          <ExerciseRow
            name={item.name}
            targetSets={item.target_sets}
            targetReps={item.target_reps}
            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: item.id } })}
            onDelete={() => deleteExercise(item.id)}
          />
        )}
      />

      <View style={styles.addForm}>
        <TextField
          label="Add exercise"
          value={exName}
          onChangeText={setExName}
          placeholder="e.g. Bench press"
          autoCapitalize="sentences"
        />
        <View style={styles.targetRow}>
          <View style={styles.targetField}>
            <TextField
              label="Sets"
              value={sets}
              onChangeText={setSets}
              placeholder="—"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.targetField}>
            <TextField
              label="Reps"
              value={reps}
              onChangeText={setReps}
              placeholder="—"
              keyboardType="number-pad"
            />
          </View>
        </View>
        <Button title="Add exercise" onPress={onAddExercise} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  list: {
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  gone: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  addForm: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  targetRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  targetField: {
    flex: 1,
  },
});
