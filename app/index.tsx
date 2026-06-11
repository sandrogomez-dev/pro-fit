import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components';
import { isSupabaseConfigured } from '@/services';
import { colors, fontSize, fontWeight, spacing } from '@/theme';

/**
 * Placeholder home screen for the Phase 1 skeleton. It renders the design tokens
 * and reports whether the backend is wired yet — proof the scaffold boots and the
 * theme + services layers resolve. Real features replace this.
 */
export default function HomeScreen() {
  return (
    <Screen centered>
      <Text style={styles.title}>ProFit</Text>
      <Text style={styles.subtitle}>Skeleton is alive.</Text>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.dot,
            { backgroundColor: isSupabaseConfigured ? colors.success : colors.warning },
          ]}
        />
        <Text style={styles.statusText}>
          {isSupabaseConfigured
            ? 'Supabase configured'
            : 'Supabase not configured (see SETUP.md)'}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
