import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback. Used when the rest timer expires while the app is in the
 * foreground (AGENTS.md §13). No-op on web.
 */
export async function restEndHaptic(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics unavailable on this device — ignore.
  }
}
