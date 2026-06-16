import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components';
import { suggestSubstitutes, type Alternative, type SwapReason } from '@/services';
import { useAuthStore } from '@/store';
import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

const REASONS: { value: SwapReason; label: string }[] = [
  { value: 'equipment_busy', label: 'Equipment busy' },
  { value: 'no_equipment', label: 'No equipment' },
  { value: 'too_hard', label: 'Too hard' },
  { value: 'too_easy', label: 'Too easy' },
];

/**
 * Premium AI exercise substitution. Sends only the exercise name + a fixed reason
 * (no personal data) to the edge function, which enforces the 5/day limit.
 */
export function AiSubstitute({
  exerciseName,
  onPick,
}: {
  exerciseName: string;
  onPick: (name: string) => void;
}) {
  const isPremium = useAuthStore((s) => s.isPremium);
  const [reason, setReason] = useState<SwapReason | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Alternative[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSuggest = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const { alternatives } = await suggestSubstitutes({
        exercise: exerciseName,
        reason: reason ?? undefined,
      });
      setResults(alternatives);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not get suggestions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.section}>Swap with AI</Text>

      {!isPremium ? (
        <Text style={styles.locked}>🔒 AI swaps are a Premium feature.</Text>
      ) : (
        <>
          <View style={styles.reasons}>
            {REASONS.map((r) => {
              const active = reason === r.value;
              return (
                <Pressable
                  key={r.value}
                  onPress={() => setReason(active ? null : r.value)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            title={loading ? 'Thinking…' : 'Suggest alternatives'}
            variant="secondary"
            onPress={() => void onSuggest()}
            loading={loading}
            disabled={loading || exerciseName.trim() === ''}
          />

          {error != null && <Text style={styles.error}>{error}</Text>}

          {results != null && (
            <View style={styles.results}>
              {results.map((alt, index) => (
                <View key={index} style={styles.resultCard}>
                  <Text style={styles.resultName}>{alt.name}</Text>
                  {alt.why !== '' && <Text style={styles.resultWhy}>{alt.why}</Text>}
                  <Pressable onPress={() => onPick(alt.name)} style={styles.use}>
                    <Text style={styles.useText}>Use this</Text>
                  </Pressable>
                </View>
              ))}
              <Text style={styles.disclaimer}>AI-suggested · not medical advice</Text>
            </View>
          )}

          {loading && <ActivityIndicator color={colors.accent} style={styles.spinner} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  section: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  locked: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  reasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  pillText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  pillTextActive: {
    color: colors.accent,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  results: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  resultName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  resultWhy: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  use: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  useText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  disclaimer: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
  },
  spinner: {
    marginTop: spacing.sm,
  },
});
