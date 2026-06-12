import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Screen, TextField, confirm } from '@/components';
import { selectExerciseById, useRoutinesStore } from '@/store';
import { colors, fontSize, fontWeight, spacing, tracking } from '@/theme';

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function initial(value: number | null): string {
  return value == null ? '' : String(value);
}

export function ExerciseEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exercise = useRoutinesStore(selectExerciseById(id));
  const updateExercise = useRoutinesStore((s) => s.updateExercise);
  const deleteExercise = useRoutinesStore((s) => s.deleteExercise);

  const [name, setName] = useState(exercise?.name ?? '');
  const [sets, setSets] = useState(initial(exercise?.target_sets ?? null));
  const [reps, setReps] = useState(initial(exercise?.target_reps ?? null));
  const [work, setWork] = useState(initial(exercise?.work_seconds ?? null));
  const [rest, setRest] = useState(initial(exercise?.rest_seconds ?? null));

  if (!exercise) {
    return (
      <Screen centered>
        <Text style={styles.gone}>This exercise is no longer available.</Text>
      </Screen>
    );
  }

  const onSave = () => {
    if (name.trim() === '') return;
    updateExercise(exercise.id, {
      name: name.trim(),
      target_sets: parseOptionalInt(sets),
      target_reps: parseOptionalInt(reps),
      work_seconds: parseOptionalInt(work),
      rest_seconds: parseOptionalInt(rest),
    });
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

        <Text style={styles.sectionTitle}>Targets</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <TextField label="Sets" value={sets} onChangeText={setSets} placeholder="—" keyboardType="number-pad" />
          </View>
          <View style={styles.field}>
            <TextField label="Reps" value={reps} onChangeText={setReps} placeholder="—" keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Timer (seconds)</Text>
        <Text style={styles.hint}>
          Set a work time for timed exercises (e.g. a 45s plank). Leave it empty for normal sets.
          Rest is the countdown after each set — empty uses the app default (90s).
        </Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <TextField label="Work" value={work} onChangeText={setWork} placeholder="—" keyboardType="number-pad" />
          </View>
          <View style={styles.field}>
            <TextField label="Rest" value={rest} onChangeText={setRest} placeholder="90" keyboardType="number-pad" />
          </View>
        </View>

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
  sectionTitle: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: -spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flex: 1,
  },
  save: {
    marginTop: spacing.md,
  },
  gone: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
