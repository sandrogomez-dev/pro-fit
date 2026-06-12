import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Local-notification wrapper for the rest timer (AGENTS.md §13). The scheduled
 * notification is the source of truth for "time's up" — it fires with sound +
 * vibration even when the screen is locked. The on-screen countdown is cosmetic.
 *
 * No-ops on web (the browser can't schedule a reliable timed notification); there
 * only the foreground countdown runs.
 */

const REST_CHANNEL = 'rest-timer';

// Show the notification (banner + sound) even if the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionGranted: boolean | null = null;

async function ensureReady(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REST_CHANNEL, {
      name: 'Rest timer',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 400, 200, 400],
      sound: 'default',
      bypassDnd: false,
    });
  }

  if (permissionGranted === null) {
    let status = (await Notifications.getPermissionsAsync()).status;
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    permissionGranted = status === 'granted';
  }
  return permissionGranted;
}

/** Schedule the "rest over" notification `seconds` from now. Returns its id, or null. */
export async function scheduleRestNotification(seconds: number): Promise<string | null> {
  if (!(await ensureReady())) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rest over 💪',
      body: 'Time for your next set.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(seconds)),
      channelId: REST_CHANNEL,
    },
  });
}

export async function cancelNotification(id: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already fired or gone — nothing to cancel.
  }
}
