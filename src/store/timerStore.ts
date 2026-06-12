import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  appStorage,
  cancelNotification,
  restEndHaptic,
  scheduleRestNotification,
} from '@/services';

export const DEFAULT_REST_SECONDS = 90;
const MIN_REST_SECONDS = 5;

interface TimerState {
  active: boolean;
  /** Epoch ms when the rest ends. The countdown is derived from this. */
  endsAt: number | null;
  /** Duration of the current/last rest, for the progress ring. */
  durationSeconds: number;
  /** Id of the scheduled local notification (the source of truth for expiry). */
  notificationId: string | null;

  start: (seconds?: number) => void;
  addTime: (deltaSeconds: number) => void;
  cancel: () => void;
  /** Called by the UI when the foreground countdown reaches zero. */
  expire: () => void;
  _setHydrated: () => void;
  hydrated: boolean;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => {
      // (Re)schedule the notification for `seconds` from now, storing its id only if
      // this is still the active timer with the expected end time.
      function reschedule(endsAt: number, seconds: number): void {
        const previous = get().notificationId;
        if (previous) void cancelNotification(previous);
        set({ notificationId: null });
        void scheduleRestNotification(seconds).then((id) => {
          if (id && get().active && get().endsAt === endsAt) set({ notificationId: id });
        });
      }

      return {
        active: false,
        endsAt: null,
        durationSeconds: DEFAULT_REST_SECONDS,
        notificationId: null,
        hydrated: false,

        start: (seconds) => {
          const duration = Math.max(MIN_REST_SECONDS, seconds ?? get().durationSeconds);
          const endsAt = Date.now() + duration * 1000;
          set({ active: true, endsAt, durationSeconds: duration });
          reschedule(endsAt, duration);
        },

        addTime: (deltaSeconds) => {
          const current = get().endsAt;
          if (!get().active || current == null) return;
          const endsAt = Math.max(Date.now() + MIN_REST_SECONDS * 1000, current + deltaSeconds * 1000);
          set({ endsAt });
          reschedule(endsAt, Math.round((endsAt - Date.now()) / 1000));
        },

        cancel: () => {
          const previous = get().notificationId;
          if (previous) void cancelNotification(previous);
          set({ active: false, endsAt: null, notificationId: null });
        },

        expire: () => {
          // The notification already fired (handles the locked case). In the
          // foreground we add a haptic and clear the on-screen bar.
          set({ active: false, endsAt: null, notificationId: null });
          void restEndHaptic();
        },

        _setHydrated: () => set({ hydrated: true }),
      };
    },
    {
      name: 'timer-store',
      storage: createJSONStorage(() => appStorage),
      partialize: (s) => ({
        durationSeconds: s.durationSeconds,
        active: s.active,
        endsAt: s.endsAt,
        notificationId: s.notificationId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Drop a timer that already elapsed while the app was closed.
        if (state.active && (state.endsAt == null || state.endsAt <= Date.now())) {
          state.active = false;
          state.endsAt = null;
          state.notificationId = null;
        }
        state._setHydrated();
      },
    },
  ),
);
