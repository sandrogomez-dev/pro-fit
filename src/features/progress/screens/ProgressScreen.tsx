import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Screen } from '@/components';
import { useAuthStore, useRoutinesStore, useWorkoutStore } from '@/store';
import { colors, fontSize, fontWeight, spacing, tracking } from '@/theme';

import { HistoryCard } from '../components/HistoryCard';
import { PremiumGate } from '../components/PremiumGate';
import { PrCard } from '../components/PrCard';
import { derivePRs, deriveHistory } from '../derive';

export function ProgressScreen() {
  const isPremium = useAuthStore((s) => s.isPremium);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const logs = useWorkoutStore(useShallow((s) => s.logs));
  const exercises = useRoutinesStore(useShallow((s) => s.exercises));

  // Pick up a manually-toggled is_premium without needing to re-login (MVP testing).
  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const prs = useMemo(() => derivePRs(logs, exercises), [logs, exercises]);
  const history = useMemo(() => deriveHistory(logs, exercises), [logs, exercises]);

  if (!isPremium) return <PremiumGate />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>PROGRESS</Text>

        <Text style={styles.section}>Personal records</Text>
        {prs.length === 0 ? (
          <Text style={styles.empty}>Log some sets with weight to see your PRs.</Text>
        ) : (
          <View style={styles.list}>
            {prs.map((entry) => (
              <PrCard key={entry.exerciseId} entry={entry} />
            ))}
          </View>
        )}

        <Text style={styles.section}>History</Text>
        {history.length === 0 ? (
          <Text style={styles.empty}>Your logged workouts will show up here.</Text>
        ) : (
          <View style={styles.list}>
            {history.map((day) => (
              <HistoryCard key={day.date} day={day} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    letterSpacing: tracking.tight,
  },
  section: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    marginTop: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
