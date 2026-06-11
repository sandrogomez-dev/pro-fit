import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage, isSupabaseConfigured, syncRoutines } from '@/services';
import type { LocalExercise, LocalRoutine, SyncMeta } from '@/types';

import { useAuthStore } from './authStore';

/** Free tier is capped at 3 routines; premium is unlimited (AGENTS.md §3). */
export const FREE_ROUTINE_LIMIT = 3;

interface NewExerciseInput {
  name: string;
  target_sets?: number | null;
  target_reps?: number | null;
}

type ExercisePatch = Partial<Pick<LocalExercise, 'name' | 'target_sets' | 'target_reps'>>;

interface RoutinesState {
  routines: LocalRoutine[];
  exercises: LocalExercise[];
  syncing: boolean;
  lastSyncError: string | null;
  hydrated: boolean;

  createRoutine: (name: string) => string | null;
  renameRoutine: (id: string, name: string) => void;
  deleteRoutine: (id: string) => void;

  addExercise: (routineId: string, input: NewExerciseInput) => void;
  updateExercise: (id: string, patch: ExercisePatch) => void;
  deleteExercise: (id: string) => void;

  runSync: () => Promise<void>;
  reset: () => void;
  _setHydrated: () => void;
}

/** Keep server truth, plus any local items created/changed AFTER the synced snapshot. */
function mergeAfterSync<T extends { id: string } & SyncMeta>(
  serverTruth: T[],
  current: T[],
  snapshotIds: Set<string>,
): T[] {
  const newcomers = current.filter(
    (item) => !snapshotIds.has(item.id) && (item.pendingSync || item.pendingDelete),
  );
  return [...serverTruth, ...newcomers];
}

export const useRoutinesStore = create<RoutinesState>()(
  persist(
    (set, get) => ({
      routines: [],
      exercises: [],
      syncing: false,
      lastSyncError: null,
      hydrated: false,

      createRoutine: (name) => {
        const user = useAuthStore.getState().user;
        if (!user) return null;
        if (!canCreateRoutine(get().routines)) return null;

        const routine: LocalRoutine = {
          id: randomUUID(),
          user_id: user.id,
          name: name.trim(),
          created_at: new Date().toISOString(),
          pendingSync: true,
          pendingDelete: false,
        };
        set((s) => ({ routines: [...s.routines, routine] }));
        void get().runSync();
        return routine.id;
      },

      renameRoutine: (id, name) => {
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === id ? { ...r, name: name.trim(), pendingSync: true } : r,
          ),
        }));
        void get().runSync();
      },

      deleteRoutine: (id) => {
        // Tombstone the routine and its exercises (server cascades; tombstones are
        // idempotent). Local-first: it disappears from the UI immediately.
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === id ? { ...r, pendingDelete: true, pendingSync: false } : r,
          ),
          exercises: s.exercises.map((e) =>
            e.routine_id === id ? { ...e, pendingDelete: true, pendingSync: false } : e,
          ),
        }));
        void get().runSync();
      },

      addExercise: (routineId, input) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        const siblings = get().exercises.filter(
          (e) => e.routine_id === routineId && !e.pendingDelete,
        );
        const order = siblings.length
          ? Math.max(...siblings.map((e) => e.order)) + 1
          : 0;

        const exercise: LocalExercise = {
          id: randomUUID(),
          routine_id: routineId,
          user_id: user.id,
          name: input.name.trim(),
          target_sets: input.target_sets ?? null,
          target_reps: input.target_reps ?? null,
          order,
          pendingSync: true,
          pendingDelete: false,
        };
        set((s) => ({ exercises: [...s.exercises, exercise] }));
        void get().runSync();
      },

      updateExercise: (id, patch) => {
        set((s) => ({
          exercises: s.exercises.map((e) =>
            e.id === id ? { ...e, ...patch, pendingSync: true } : e,
          ),
        }));
        void get().runSync();
      },

      deleteExercise: (id) => {
        set((s) => ({
          exercises: s.exercises.map((e) =>
            e.id === id ? { ...e, pendingDelete: true, pendingSync: false } : e,
          ),
        }));
        void get().runSync();
      },

      runSync: async () => {
        if (get().syncing || !isSupabaseConfigured) return;

        const snapRoutines = get().routines;
        const snapExercises = get().exercises;
        const snapRoutineIds = new Set(snapRoutines.map((r) => r.id));
        const snapExerciseIds = new Set(snapExercises.map((e) => e.id));

        set({ syncing: true, lastSyncError: null });
        try {
          const outcome = await syncRoutines({
            routines: snapRoutines,
            exercises: snapExercises,
          });
          if (!outcome.synced) {
            set({ syncing: false }); // offline — try again later
            return;
          }
          set((s) => ({
            routines: mergeAfterSync(outcome.serverRoutines, s.routines, snapRoutineIds),
            exercises: mergeAfterSync(outcome.serverExercises, s.exercises, snapExerciseIds),
            syncing: false,
          }));
        } catch (e) {
          set({
            syncing: false,
            lastSyncError: e instanceof Error ? e.message : 'Sync failed',
          });
        }
      },

      reset: () =>
        set({ routines: [], exercises: [], syncing: false, lastSyncError: null }),

      _setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'routines-store',
      storage: createJSONStorage(() => appStorage),
      partialize: (s) => ({ routines: s.routines, exercises: s.exercises }),
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
);

// ---- Selectors (pure; pass to useRoutinesStore) -----------------------------
export const selectActiveRoutines = (s: RoutinesState): LocalRoutine[] =>
  s.routines.filter((r) => !r.pendingDelete);

export const selectExercisesForRoutine =
  (routineId: string) =>
  (s: RoutinesState): LocalExercise[] =>
    s.exercises
      .filter((e) => e.routine_id === routineId && !e.pendingDelete)
      .sort((a, b) => a.order - b.order);

export const selectRoutineById =
  (routineId: string) =>
  (s: RoutinesState): LocalRoutine | undefined =>
    s.routines.find((r) => r.id === routineId && !r.pendingDelete);

function canCreateRoutine(routines: LocalRoutine[]): boolean {
  const { isPremium } = useAuthStore.getState();
  const count = routines.filter((r) => !r.pendingDelete).length;
  return isPremium || count < FREE_ROUTINE_LIMIT;
}

export const selectCanCreateRoutine = (s: RoutinesState): boolean =>
  canCreateRoutine(s.routines);

// ---- Cross-store wiring -----------------------------------------------------
// Reset local data on sign-out; kick a sync on sign-in. Kept here (not in
// authStore) to avoid a circular import.
useAuthStore.subscribe((state, prev) => {
  if (prev.status !== 'unauthenticated' && state.status === 'unauthenticated') {
    useRoutinesStore.getState().reset();
  }
  if (prev.status !== 'authenticated' && state.status === 'authenticated') {
    void useRoutinesStore.getState().runSync();
  }
});
