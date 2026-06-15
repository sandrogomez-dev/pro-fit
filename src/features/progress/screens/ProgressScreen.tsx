import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Screen } from '@/components';
import { selectSessions, useAuthStore, useSessionsStore } from '@/store';
import { colors, fontSize, fontWeight, spacing, tracking } from '@/theme';

import { PremiumGate } from '../components/PremiumGate';
import { SessionCard } from '../components/SessionCard';

export function ProgressScreen() {
  const isPremium = useAuthStore((s) => s.isPremium);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const sessions = useSessionsStore(useShallow(selectSessions));

  // Pick up a manually-toggled is_premium without needing to re-login (MVP testing).
  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  if (!isPremium) return <PremiumGate />;

  return (
    <Screen>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>HISTORY</Text>
            <Text style={styles.subtitle}>Your training log</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptyText}>Finish a circuit and it shows up here.</Text>
          </View>
        }
        renderItem={({ item }) => <SessionCard session={item} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.xl,
    flexGrow: 1,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    letterSpacing: tracking.tight,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  separator: {
    height: spacing.md,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
