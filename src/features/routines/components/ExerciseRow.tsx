import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, minTapTarget, radius, spacing } from '@/theme';

interface ExerciseRowProps {
  name: string;
  targetSets: number | null;
  targetReps: number | null;
  onDelete: () => void;
}

function targetLabel(sets: number | null, reps: number | null): string | null {
  if (sets != null && reps != null) return `${sets} × ${reps}`;
  if (sets != null) return `${sets} sets`;
  if (reps != null) return `${reps} reps`;
  return null;
}

/** Presentational exercise row inside a routine. */
export function ExerciseRow({ name, targetSets, targetReps, onDelete }: ExerciseRowProps) {
  const target = targetLabel(targetSets, targetReps);

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {target != null && <Text style={styles.target}>{target}</Text>}
      </View>
      <Pressable
        onPress={onDelete}
        hitSlop={spacing.md}
        style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
      >
        <Text style={styles.deleteText}>Remove</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  target: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  delete: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  deleteText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
