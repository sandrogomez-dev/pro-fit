import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  fontSize,
  fontWeight,
  minTapTarget,
  radius,
  spacing,
  tracking,
} from '@/theme';

interface ExerciseRowProps {
  name: string;
  targetSets: number | null;
  targetReps: number | null;
  onPress: () => void;
  onDelete: () => void;
}

function targetLabel(sets: number | null, reps: number | null): string | null {
  if (sets != null && reps != null) return `${sets} × ${reps}`;
  if (sets != null) return `${sets} SETS`;
  if (reps != null) return `${reps} REPS`;
  return null;
}

/** Athletic exercise row inside a routine. */
export function ExerciseRow({ name, targetSets, targetReps, onPress, onDelete }: ExerciseRowProps) {
  const target = targetLabel(targetSets, targetReps);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      {target != null && (
        <View style={styles.targetChip}>
          <Text style={styles.targetText}>{target}</Text>
        </View>
      )}
      <Pressable
        onPress={onDelete}
        hitSlop={spacing.md}
        style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
      >
        <Text style={styles.deleteText}>Remove</Text>
      </Pressable>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
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
  },
  name: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
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
  delete: {
    paddingHorizontal: spacing.xs,
  },
  deleteText: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  chevron: {
    color: colors.textFaint,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});
