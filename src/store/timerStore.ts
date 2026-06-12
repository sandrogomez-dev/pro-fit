import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  appStorage,
  cancelNotification,
  restEndHaptic,
  scheduleTimerNotification,
  type TimerPhase,
} from '@/services';

export const DEFAULT_REST_SECONDS = 90;
const MIN_SECONDS = 5;

interface TimerState {
  active: boolean;
  phase: TimerPhase | null;
  /** Epoch ms when the current phase ends. The countdown is derived from this. */
  endsAt: number | null;
  /** Duration of the current phase, for the progress ring. */
  durationSeconds: number;
  /** Rest to chain after a work phase (seconds), or null. */
  nextRestSeconds: number | null;
  /** Ids of the scheduled local notifications (the source of truth for expiry). */
  notificationIds: string[];
  hydrated: boolean;

  /** Start a rest (e.g. after marking a set done). */
  startRest: (seconds?: number) => void;
  /** Start a timed work phase that auto-chains into rest (AGENTS.md §13). */
  startWork: (workSeconds: number, restSeconds: number) => void;
  addTime: (deltaSeconds: number) => void;
  cancel: () => void;
  /** Called by the UI when the foreground countdown reaches zero. */
  expire: () => void;
  _setHydrated: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => {
      async function cancelAll(ids: string[]): Promise<void> {
        await Promise.all(ids.map(cancelNotification));
      }

      // Cancel any pending notifications, then (re)schedule for the given state and
      // store the ids if this is still the active timer with the same end time.
      function scheduleFor(endsAt: number, phase: TimerPhase, nextRest: number | null): void {
        void cancelAll(get().notificationIds);
        set({ notificationIds: [] });

        const firstSeconds = Math.round((endsAt - Date.now()) / 1000);
        const jobs: Promise<string | null>[] = [scheduleTimerNotification(firstSeconds, phase)];
        if (phase === 'work' && nextRest != null) {
          jobs.push(scheduleTimerNotification(firstSeconds + nextRest, 'rest'));
        }

        void Promise.all(jobs).then((ids) => {
          const valid = ids.filter((id): id is string => id != null);
          if (get().active && get().endsAt === endsAt) set({ notificationIds: valid });
        });
      }

      return {
        active: false,
        phase: null,
        endsAt: null,
        durationSeconds: DEFAULT_REST_SECONDS,
        nextRestSeconds: null,
        notificationIds: [],
        hydrated: false,

        startRest: (seconds) => {
          const rest = Math.max(MIN_SECONDS, seconds ?? DEFAULT_REST_SECONDS);
          const endsAt = Date.now() + rest * 1000;
          set({
            active: true,
            phase: 'rest',
            endsAt,
            durationSeconds: rest,
            nextRestSeconds: null,
          });
          scheduleFor(endsAt, 'rest', null);
        },

        startWork: (workSeconds, restSeconds) => {
          const work = Math.max(MIN_SECONDS, workSeconds);
          const rest = Math.max(MIN_SECONDS, restSeconds);
          const endsAt = Date.now() + work * 1000;
          set({
            active: true,
            phase: 'work',
            endsAt,
            durationSeconds: work,
            nextRestSeconds: rest,
          });
          scheduleFor(endsAt, 'work', rest);
        },

        addTime: (deltaSeconds) => {
          const current = get().endsAt;
          const phase = get().phase;
          if (!get().active || current == null || phase == null) return;
          const endsAt = Math.max(Date.now() + MIN_SECONDS * 1000, current + deltaSeconds * 1000);
          set({ endsAt });
          scheduleFor(endsAt, phase, get().nextRestSeconds);
        },

        cancel: () => {
          void cancelAll(get().notificationIds);
          set({
            active: false,
            phase: null,
            endsAt: null,
            nextRestSeconds: null,
            notificationIds: [],
          });
        },

        expire: () => {
          // The matching notification already fired (handles the locked case).
          const { phase, nextRestSeconds } = get();
          if (phase === 'work' && nextRestSeconds != null) {
            // Chain into rest. The rest notification was scheduled up front, so it
            // still fires correctly even if we were locked — just update the UI.
            const endsAt = Date.now() + nextRestSeconds * 1000;
            set({
              phase: 'rest',
              endsAt,
              durationSeconds: nextRestSeconds,
              nextRestSeconds: null,
            });
            void restEndHaptic();
            return;
          }
          void cancelAll(get().notificationIds);
          set({ active: false, phase: null, endsAt: null, notificationIds: [] });
          void restEndHaptic();
        },

        _setHydrated: () => set({ hydrated: true }),
      };
    },
    {
      name: 'timer-store',
      storage: createJSONStorage(() => appStorage),
      partialize: (s) => ({
        active: s.active,
        phase: s.phase,
        endsAt: s.endsAt,
        durationSeconds: s.durationSeconds,
        nextRestSeconds: s.nextRestSeconds,
        notificationIds: s.notificationIds,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.active && (state.endsAt == null || state.endsAt <= Date.now())) {
          state.active = false;
          state.phase = null;
          state.endsAt = null;
          state.nextRestSeconds = null;
          state.notificationIds = [];
        }
        state._setHydrated();
      },
    },
  ),
);
