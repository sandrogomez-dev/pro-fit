import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Button, Screen, TextField } from '@/components';
import { CircuitSettings } from '@/features/circuit';
import {
  selectExercisesForRoutine,
  selectRoutineById,
  useRoutinesStore,
} from '@/store';
import { colors, fontSize, fontWeight, spacing, tracking } from '@/theme';

import { ExerciseRow } from '../components/ExerciseRow';

export function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const routine = useRoutinesStore(selectRoutineById(id));
  const exercises = useRoutinesStore(useShallow(selectExercisesForRoutine(id)));
  const renameRoutine = useRoutinesStore((s) => s.renameRoutine);
  const addExercise = useRoutinesStore((s) => s.addExercise);
  const deleteExercise = useRoutinesStore((s) => s.deleteExercise);

  const [exName, setExName] = useState('');

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
    addExercise(routine.id, { name });
    setExName('');
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
            <CircuitSettings routine={routine} />
            {exercises.length > 0 && (
              <Button
                title="▶  Play workout"
                onPress={() =>
                  router.push({
                    pathname: '/run/[routineId]',
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
          placeholder="e.g. Push-ups"
          autoCapitalize="sentences"
        />
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
});
