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

interface RoutineCardProps {
  name: string;
  exerciseCount: number;
  onPress: () => void;
  onDelete: () => void;
}

/** Athletic routine row: lime accent bar, bold name, tap to open. */
export function RoutineCard({ name, exerciseCount, onPress, onDelete }: RoutineCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.accentBar} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta}>
          {exerciseCount} {exerciseCount === 1 ? 'EXERCISE' : 'EXERCISES'}
        </Text>
      </View>
      <Pressable
        onPress={onDelete}
        hitSlop={spacing.md}
        style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: minTapTarget + spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: spacing.lg,
    overflow: 'hidden',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  accentBar: {
    width: 5,
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
  },
  info: {
    flex: 1,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: tracking.wide,
  },
  delete: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  deleteText: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  chevron: {
    color: colors.accent,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginLeft: -spacing.xs,
  },
});
