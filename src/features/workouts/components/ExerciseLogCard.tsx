import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LocalWorkoutLog } from '@/types';
import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

import { SetRow } from './SetRow';

interface ExerciseLogCardProps {
  name: string;
  targetSets: number | null;
  targetReps: number | null;
  sets: LocalWorkoutLog[];
  onAddSet: () => void;
  onCommitSet: (logId: string, values: { reps: number; weight: number }) => void;
  onToggleDone: (logId: string, currentlyDone: boolean) => void;
  onDeleteSet: (logId: string) => void;
  /** Provided only for timed exercises — starts the work→rest cycle for a set. */
  onStartSet?: () => void;
}

function targetLabel(sets: number | null, reps: number | null): string | null {
  if (sets != null && reps != null) return `${sets} × ${reps}`;
  if (sets != null) return `${sets} SETS`;
  if (reps != null) return `${reps} REPS`;
  return null;
}

/** A workout exercise with its logged sets and an add-set action. */
export function ExerciseLogCard({
  name,
  targetSets,
  targetReps,
  sets,
  onAddSet,
  onCommitSet,
  onToggleDone,
  onDeleteSet,
  onStartSet,
}: ExerciseLogCardProps) {
  const target = targetLabel(targetSets, targetReps);
  const doneCount = sets.filter((s) => s.done).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {target != null && (
          <View style={styles.targetChip}>
            <Text style={styles.targetText}>{target}</Text>
          </View>
        )}
      </View>

      {sets.length > 0 && (
        <Text style={styles.progress}>
          {doneCount}/{sets.length} done
        </Text>
      )}

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
            onStart={onStartSet}
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
  targetChip: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  targetText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    letterSpacing: tracking.wide,
  },
  progress: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: tracking.wide,
    textTransform: 'uppercase',
    marginTop: -spacing.xs,
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
