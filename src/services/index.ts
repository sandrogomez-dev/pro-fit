/**
 * Services layer — the ONLY place the app talks to Supabase, edge functions or
 * device persistence. Features and components consume these, never the SDKs
 * directly (AGENTS.md §8).
 */
export { supabase, requireSupabase, isSupabaseConfigured } from './supabase';
export { env } from './env';
export { appStorage, type KeyValueStorage } from './storage';
export { isOnline, subscribeConnectivity } from './connectivity';
export * as authService from './auth';
export * as profileService from './profile';
export * as routinesApi from './routines';
export * as workoutsApi from './workouts';
export * as sessionsApi from './sessions';
export { pushAndPull, type EntityRemote } from './sync';
export {
  scheduleTimerNotification,
  scheduleNotificationAt,
  cancelNotification,
  type TimerPhase,
} from './notifications';
export { restEndHaptic } from './haptics';
export { playTick, playGo, playDone, speak } from './sound';
export {
  suggestSubstitutes,
  type Alternative,
  type SubstituteResult,
  type SubstituteInput,
  type SwapReason,
} from './ai';
