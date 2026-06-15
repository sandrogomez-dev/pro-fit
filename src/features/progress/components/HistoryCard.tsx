import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

import type { HistoryDay } from '../derive';

function formatDay(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function HistoryCard({ day }: { day: HistoryDay }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDay(day.date)}</Text>
        <Text style={styles.sets}>{day.totalSets} sets</Text>
      </View>
      {day.exercises.map((exercise, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={styles.detail}>
            {exercise.sets} × {exercise.topWeight > 0 ? `${exercise.topWeight}kg` : 'BW'}
          </Text>
        </View>
      ))}
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
  },
  date: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  sets: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    letterSpacing: tracking.wide,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    flex: 1,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  detail: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
