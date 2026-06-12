import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  appStorage,
  isOnline,
  isSupabaseConfigured,
  pushAndPull,
  workoutsApi,
  type EntityRemote,
} from '@/services';
import type { LocalWorkoutLog, WorkoutLog } from '@/types';
import { toRemoteWorkoutLog } from '@/types';

import { useAuthStore } from './authStore';
import { mergeAfterSync } from './syncMerge';

const workoutsRemote: EntityRemote<WorkoutLog> = {
  fetchAll: workoutsApi.fetchWorkoutLogs,
  upsert: workoutsApi.upsertWorkoutLog,
  remove: workoutsApi.deleteWorkoutLog,
};

/** An in-progress workout. Sets logged after `startedAt` belong to it. */
interface WorkoutSession {
  id: string;
  routineId: string;
  startedAt: string;
}

interface SetValues {
  reps: number;
  weight: number;
}

interface WorkoutState {
  logs: LocalWorkoutLog[];
  session: WorkoutSession | null;
  syncing: boolean;
  lastSyncError: string | null;
  hydrated: boolean;

  startSession: (routineId: string) => void;
  finishSession: () => void;
  addSet: (exerciseId: string, values: SetValues) => void;
  updateSet: (logId: string, values: SetValues) => void;
  toggleDone: (logId: string) => void;
  deleteSet: (logId: string) => void;

  runSync: () => Promise<void>;
  reset: () => void;
  _setHydrated: () => void;
}

/** Sets for an exercise within the active session (not deleted, ordered). */
function sessionSets(
  logs: LocalWorkoutLog[],
  session: WorkoutSession | null,
  exerciseId: string,
): LocalWorkoutLog[] {
  if (!session) return [];
  return logs
    .filter(
      (l) =>
        l.exercise_id === exerciseId &&
        !l.pendingDelete &&
        l.performed_at >= session.startedAt,
    )
    .sort((a, b) => a.set_number - b.set_number);
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      logs: [],
      session: null,
      syncing: false,
      lastSyncError: null,
      hydrated: false,

      startSession: (routineId) => {
        set({
          session: { id: randomUUID(), routineId, startedAt: new Date().toISOString() },
        });
      },

      finishSession: () => set({ session: null }),

      addSet: (exerciseId, values) => {
        const user = useAuthStore.getState().user;
        const session = get().session;
        if (!user || !session) return;

        const setNumber = sessionSets(get().logs, session, exerciseId).length + 1;
        const log: LocalWorkoutLog = {
          id: randomUUID(),
          user_id: user.id,
          exercise_id: exerciseId,
          set_number: setNumber,
          reps: values.reps,
          weight: values.weight,
          done: false,
          performed_at: new Date().toISOString(),
          pendingSync: true,
          pendingDelete: false,
        };
        set((s) => ({ logs: [...s.logs, log] }));
        void get().runSync();
      },

      updateSet: (logId, values) => {
        set((s) => ({
          logs: s.logs.map((l) =>
            l.id === logId
              ? { ...l, reps: values.reps, weight: values.weight, pendingSync: true }
              : l,
          ),
        }));
        void get().runSync();
      },

      toggleDone: (logId) => {
        // Marking a set done is what will trigger the rest timer in Phase 6.
        set((s) => ({
          logs: s.logs.map((l) =>
            l.id === logId ? { ...l, done: !l.done, pendingSync: true } : l,
          ),
        }));
        void get().runSync();
      },

      deleteSet: (logId) => {
        set((s) => ({
          logs: s.logs.map((l) =>
            l.id === logId ? { ...l, pendingDelete: true, pendingSync: false } : l,
          ),
        }));
        void get().runSync();
      },

      runSync: async () => {
        if (get().syncing || !isSupabaseConfigured) return;

        const snapshot = get().logs;
        const snapshotIds = new Set(snapshot.map((l) => l.id));

        set({ syncing: true, lastSyncError: null });
        try {
          if (!(await isOnline())) {
            set({ syncing: false });
            return;
          }
          const serverLogs = await pushAndPull(snapshot, workoutsRemote, toRemoteWorkoutLog);
          set((s) => ({
            logs: mergeAfterSync(serverLogs, s.logs, snapshotIds),
            syncing: false,
          }));
        } catch (e) {
          set({
            syncing: false,
            lastSyncError: e instanceof Error ? e.message : 'Sync failed',
          });
        }
      },

      reset: () => set({ logs: [], session: null, syncing: false, lastSyncError: null }),

      _setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'workout-store',
      storage: createJSONStorage(() => appStorage),
      partialize: (s) => ({ logs: s.logs, session: s.session }),
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
);

// ---- Selectors --------------------------------------------------------------
export const selectSession = (s: WorkoutState): WorkoutSession | null => s.session;

export const selectSessionSetsForExercise =
  (exerciseId: string) =>
  (s: WorkoutState): LocalWorkoutLog[] =>
    sessionSets(s.logs, s.session, exerciseId);

// ---- Cross-store wiring -----------------------------------------------------
// Reset on sign-out; kick a sync on sign-in. Kept here to avoid a circular import.
useAuthStore.subscribe((state, prev) => {
  if (prev.status !== 'unauthenticated' && state.status === 'unauthenticated') {
    useWorkoutStore.getState().reset();
  }
  if (prev.status !== 'authenticated' && state.status === 'authenticated') {
    void useWorkoutStore.getState().runSync();
  }
});
