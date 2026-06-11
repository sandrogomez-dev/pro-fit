import { StyleSheet, Text, View } from 'react-native';

import { Button, Screen } from '@/components';
import { useAuthStore } from '@/store';
import { colors, fontSize, fontWeight, spacing } from '@/theme';

/**
 * Authenticated home (placeholder). Confirms the session is live and lets the user
 * sign out. Real feature navigation (routines, workouts, timer…) replaces this.
 */
export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{"You're in 💪"}</Text>
          <Text style={styles.subtitle}>
            Signed in as {user?.email ?? 'unknown user'}
          </Text>
        </View>

        <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
