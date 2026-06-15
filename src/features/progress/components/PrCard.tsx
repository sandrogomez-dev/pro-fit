import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

import type { PrEntry } from '../derive';
import { MiniBarChart } from './MiniBarChart';

export function PrCard({ entry }: { entry: PrEntry }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.exerciseName}
        </Text>
        <View style={styles.prBlock}>
          <Text style={styles.weight}>{entry.bestWeight}</Text>
          <Text style={styles.unit}>kg</Text>
        </View>
      </View>
      <Text style={styles.meta}>BEST · {entry.reps} reps</Text>
      <MiniBarChart data={entry.series} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  prBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  weight: {
    color: colors.accent,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
  },
  unit: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: tracking.wide,
  },
});
