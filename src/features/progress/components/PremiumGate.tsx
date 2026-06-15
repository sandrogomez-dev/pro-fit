import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components';
import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

/**
 * Upsell shown to free users (AGENTS.md §3: history + charts are premium). Payments
 * are stubbed for the MVP — `profiles.is_premium` is toggled manually for testing.
 */
export function PremiumGate() {
  return (
    <Screen centered>
      <View style={styles.card}>
        <Text style={styles.lock}>🔒</Text>
        <Text style={styles.title}>Progress is Premium</Text>
        <Text style={styles.body}>
          Personal records, history and progress charts are part of ProFit Premium.
          Logging your workouts stays free, always.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Coming soon</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  lock: {
    fontSize: 48,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: tracking.tight,
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
});
