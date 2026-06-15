import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSize, fontWeight, minTapTarget, radius, spacing } from '@/theme';

interface SetRowProps {
  setNumber: number;
  reps: number;
  weight: number;
  done: boolean;
  onCommit: (values: { reps: number; weight: number }) => void;
  onToggleDone: () => void;
  onDelete: () => void;
}

function toInt(value: string): number {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function toNumber(value: string): number {
  const n = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * One logged set: editable reps × weight and a green "done" check (AGENTS.md §3).
 * Values commit on blur to avoid syncing on every keystroke. Toggling done is what
 * will start the rest timer in Phase 6.
 */
export function SetRow({
  setNumber,
  reps,
  weight,
  done,
  onCommit,
  onToggleDone,
  onDelete,
}: SetRowProps) {
  const [repsText, setRepsText] = useState(String(reps));
  const [weightText, setWeightText] = useState(String(weight));

  const commit = () => {
    onCommit({ reps: toInt(repsText), weight: toNumber(weightText) });
  };

  return (
    <View style={[styles.row, done && styles.rowDone]}>
      <Text style={styles.setNumber}>{setNumber}</Text>

      <View style={styles.field}>
        <TextInput
          style={styles.input}
          value={repsText}
          onChangeText={setRepsText}
          onEndEditing={commit}
          onBlur={commit}
          keyboardType="number-pad"
          selectTextOnFocus
          editable={!done}
        />
        <Text style={styles.unit}>reps</Text>
      </View>

      <Text style={styles.times}>×</Text>

      <View style={styles.field}>
        <TextInput
          style={styles.input}
          value={weightText}
          onChangeText={setWeightText}
          onEndEditing={commit}
          onBlur={commit}
          keyboardType="decimal-pad"
          selectTextOnFocus
          editable={!done}
        />
        <Text style={styles.unit}>kg</Text>
      </View>

      <Pressable
        onPress={onToggleDone}
        hitSlop={spacing.sm}
        style={[styles.check, done && styles.checkDone]}
      >
        {done && <Text style={styles.checkMark}>✓</Text>}
      </Pressable>

      <Pressable onPress={onDelete} hitSlop={spacing.sm} style={styles.delete}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDone: {
    borderColor: colors.success,
  },
  setNumber: {
    color: colors.textFaint,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    width: 18,
    textAlign: 'center',
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    paddingVertical: spacing.xs,
  },
  unit: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  times: {
    color: colors.textFaint,
    fontSize: fontSize.sm,
  },
  check: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkMark: {
    color: colors.textInverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  delete: {
    paddingHorizontal: spacing.xs,
  },
  deleteText: {
    color: colors.textFaint,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
