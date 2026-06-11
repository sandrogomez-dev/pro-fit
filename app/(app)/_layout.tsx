import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Stack for the authenticated app. Feature screens get added here. */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'ProFit' }} />
    </Stack>
  );
}
