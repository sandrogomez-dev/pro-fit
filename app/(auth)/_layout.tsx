import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Stack for the unauthenticated flow (sign in / sign up). */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
