import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField, confirm } from '@/components';
import { AiSubstitute } from '@/features/ai';
import { selectExerciseById, useRoutinesStore } from '@/store';
import { colors, fontSize, spacing } from '@/theme';

export function ExerciseEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exercise = useRoutinesStore(selectExerciseById(id));
  const updateExercise = useRoutinesStore((s) => s.updateExercise);
  const deleteExercise = useRoutinesStore((s) => s.deleteExercise);

  const [name, setName] = useState(exercise?.name ?? '');

  if (!exercise) {
    return (
      <Screen centered>
        <Text style={styles.gone}>This exercise is no longer available.</Text>
      </Screen>
    );
  }

  const onSave = () => {
    if (name.trim() === '') return;
    updateExercise(exercise.id, { name: name.trim() });
    router.back();
  };

  const onDelete = () => {
    confirm(
      {
        title: 'Delete exercise',
        message: `Remove "${exercise.name}" from this routine?`,
        confirmLabel: 'Delete',
        destructive: true,
      },
      () => {
        deleteExercise(exercise.id);
        router.back();
      },
    );
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Edit exercise' }} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="sentences" />
        <Text style={styles.hint}>Times are set on the routine (Work / Rest / Rounds).</Text>

        <AiSubstitute exerciseName={name} onPick={setName} />

        <Button title="Save" onPress={onSave} style={styles.save} />
        <Button title="Delete exercise" variant="ghost" onPress={onDelete} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: -spacing.sm,
  },
  save: {
    marginTop: spacing.md,
  },
  gone: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
