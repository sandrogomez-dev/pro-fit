import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LocalWorkoutLog } from '@/types';
import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

import { SetRow } from './SetRow';

interface ExerciseLogCardProps {
  name: string;
  sets: LocalWorkoutLog[];
  onAddSet: () => void;
  onCommitSet: (logId: string, values: { reps: number; weight: number }) => void;
  onToggleDone: (logId: string, currentlyDone: boolean) => void;
  onDeleteSet: (logId: string) => void;
}

/** A workout exercise with its logged sets and an add-set action. */
export function ExerciseLogCard({
  name,
  sets,
  onAddSet,
  onCommitSet,
  onToggleDone,
  onDeleteSet,
}: ExerciseLogCardProps) {
  const doneCount = sets.filter((s) => s.done).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {sets.length > 0 && (
          <Text style={styles.progress}>
            {doneCount}/{sets.length} done
          </Text>
        )}
      </View>

      <View style={styles.sets}>
        {sets.map((s) => (
          <SetRow
            key={s.id}
            setNumber={s.set_number}
            reps={s.reps}
            weight={s.weight}
            done={s.done}
            onCommit={(values) => onCommitSet(s.id, values)}
            onToggleDone={() => onToggleDone(s.id, s.done)}
            onDelete={() => onDeleteSet(s.id)}
          />
        ))}
      </View>

      <Pressable
        onPress={onAddSet}
        style={({ pressed }) => [styles.addSet, pressed && styles.pressed]}
      >
        <Text style={styles.addSetText}>+ Add set</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  progress: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: tracking.wide,
    textTransform: 'uppercase',
  },
  sets: {
    gap: spacing.sm,
  },
  addSet: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  pressed: {
    opacity: 0.7,
  },
  addSetText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    letterSpacing: tracking.wide,
    textTransform: 'uppercase',
  },
});
