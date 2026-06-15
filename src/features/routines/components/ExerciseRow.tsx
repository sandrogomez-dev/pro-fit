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
  onPress: () => void;
  onDelete: () => void;
}

/** Exercise row inside a routine. Tap to edit (rename), trailing button to remove. */
export function ExerciseRow({ name, onPress, onDelete }: ExerciseRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
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
