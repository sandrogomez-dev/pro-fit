import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, minTapTarget, radius, spacing } from '@/theme';

interface RoutineCardProps {
  name: string;
  exerciseCount: number;
  onPress: () => void;
  onDelete: () => void;
}

/** Presentational routine row. Tap to open; trailing button to delete. */
export function RoutineCard({ name, exerciseCount, onPress, onDelete }: RoutineCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta}>
          {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
        </Text>
      </View>
      <Pressable
        onPress={onDelete}
        hitSlop={spacing.md}
        style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  meta: {
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
