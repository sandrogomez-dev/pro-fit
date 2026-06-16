import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Screen } from '@/components';
import { useAuthStore, useSettingsStore, type AudioMode } from '@/store';
import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

const AUDIO_OPTIONS: { value: AudioMode; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'beeps', label: 'Beeps' },
  { value: 'voice', label: 'Voice' },
  { value: 'both', label: 'Both' },
];

export function SettingsScreen() {
  const audioMode = useSettingsStore((s) => s.audioMode);
  const setAudioMode = useSettingsStore((s) => s.setAudioMode);
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.section}>Workout sound</Text>
        <View style={styles.segment}>
          {AUDIO_OPTIONS.map((option) => {
            const active = audioMode === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setAudioMode(option.value)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>
          Beeps play a countdown and a tone on each change. Voice announces the exercise
          and rest. Heard while the workout screen is open.
        </Text>

        <View style={styles.spacer} />

        {user?.email != null && <Text style={styles.account}>Signed in as {user.email}</Text>}
        <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  section: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  pillTextActive: {
    color: colors.textInverse,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  spacer: {
    flex: 1,
  },
  account: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
