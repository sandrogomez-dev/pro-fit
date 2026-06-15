import { StyleSheet, Text, View } from 'react-native';

import type { LocalWorkoutSession } from '@/types';
import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SessionCard({ session }: { session: LocalWorkoutSession }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {session.routine_name}
        </Text>
        <Text style={styles.duration}>{formatDuration(session.duration_seconds)}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.when}>{formatWhen(session.started_at)}</Text>
        <Text style={[styles.tag, session.completed ? styles.tagDone : styles.tagPartial]}>
          {session.completed ? `${session.rounds} ROUNDS ✓` : 'STOPPED'}
        </Text>
      </View>
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
  duration: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    fontVariant: ['tabular-nums'],
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  when: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  tag: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    letterSpacing: tracking.wide,
  },
  tagDone: {
    color: colors.success,
  },
  tagPartial: {
    color: colors.textFaint,
  },
});
