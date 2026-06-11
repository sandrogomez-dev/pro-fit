import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Screen, TextField } from '@/components';
import { authService } from '@/services';
import { colors, fontSize, fontWeight, spacing } from '@/theme';

const MIN_PASSWORD_LENGTH = 6;

/**
 * Email/password sign-up. If the project requires email confirmation, we surface a
 * "check your inbox" message; otherwise the auth listener signs the user straight in.
 */
export function SignUpScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const onSubmit = async () => {
    if (email.trim() === '' || password === '') {
      setError('Enter your email and password.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await authService.signUpWithEmail(
        email.trim(),
        password,
        displayName.trim() || undefined,
      );
      if (needsEmailConfirmation) {
        setConfirmationSent(true);
      }
      // Otherwise the auth listener flips the session and routes automatically.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <Screen centered>
        <View style={styles.confirmation}>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            We sent a confirmation link to {email.trim()}. Tap it, then sign in.
          </Text>
          <Button title="Back to sign in" onPress={() => router.replace('/sign-in')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Start logging your workouts.</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Name (optional)"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="How should we call you?"
            autoCapitalize="words"
            autoComplete="name"
            editable={!submitting}
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            editable={!submitting}
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            autoComplete="new-password"
            editable={!submitting}
          />
          {error != null && <Text style={styles.error}>{error}</Text>}
          <Button title="Create account" onPress={onSubmit} loading={submitting} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/sign-in" style={styles.link}>
            Sign in
          </Link>
        </View>
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
  confirmation: {
    gap: spacing.lg,
    alignItems: 'center',
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  link: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
