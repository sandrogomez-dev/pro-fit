import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  appStorage,
  isOnline,
  isSupabaseConfigured,
  pushAndPull,
  routinesApi,
  type EntityRemote,
} from '@/services';
import type { Exercise, LocalExercise, LocalRoutine, Routine } from '@/types';
import { toRemoteExercise, toRemoteRoutine } from '@/types';

import { useAuthStore } from './authStore';
import { mergeAfterSync } from './syncMerge';

const routinesRemote: EntityRemote<Routine> = {
  fetchAll: routinesApi.fetchRoutines,
  upsert: routinesApi.upsertRoutine,
  remove: routinesApi.deleteRoutine,
};

const exercisesRemote: EntityRemote<Exercise> = {
  fetchAll: routinesApi.fetchExercises,
  upsert: routinesApi.upsertExercise,
  remove: routinesApi.deleteExercise,
};

/** Free tier is capped at 3 routines; premium is unlimited (AGENTS.md §3). */
export const FREE_ROUTINE_LIMIT = 3;

interface NewExerciseInput {
  name: string;
  target_sets?: number | null;
  target_reps?: number | null;
  work_seconds?: number | null;
  rest_seconds?: number | null;
}

type ExercisePatch = Partial<
  Pick<LocalExercise, 'name' | 'target_sets' | 'target_reps' | 'work_seconds' | 'rest_seconds'>
>;

type RoutinePatch = Partial<
  Pick<LocalRoutine, 'name' | 'work_seconds' | 'rest_seconds' | 'rounds'>
>;

interface RoutineTemplateInput {
  name: string;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  exercises: string[];
}

interface RoutinesState {
  routines: LocalRoutine[];
  exercises: LocalExercise[];
  syncing: boolean;
  lastSyncError: string | null;
  hydrated: boolean;

  createRoutine: (name: string) => string | null;
  addRoutineFromTemplate: (template: RoutineTemplateInput) => string | null;
  renameRoutine: (id: string, name: string) => void;
  updateRoutine: (id: string, patch: RoutinePatch) => void;
  deleteRoutine: (id: string) => void;

  addExercise: (routineId: string, input: NewExerciseInput) => void;
  updateExercise: (id: string, patch: ExercisePatch) => void;
  deleteExercise: (id: string) => void;

  runSync: () => Promise<void>;
  reset: () => void;
  _setHydrated: () => void;
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
          work_seconds: null,
          rest_seconds: null,
          rounds: 1,
          pendingSync: true,
          pendingDelete: false,
        };
        set((s) => ({ routines: [...s.routines, routine] }));
        void get().runSync();
        return routine.id;
      },

      addRoutineFromTemplate: (template) => {
        const user = useAuthStore.getState().user;
        if (!user) return null;
        if (!canCreateRoutine(get().routines)) return null;

        const routineId = randomUUID();
        const now = new Date().toISOString();
        const routine: LocalRoutine = {
          id: routineId,
          user_id: user.id,
          name: template.name,
          created_at: now,
          work_seconds: template.workSeconds,
          rest_seconds: template.restSeconds,
          rounds: template.rounds,
          pendingSync: true,
          pendingDelete: false,
        };
        const exercises: LocalExercise[] = template.exercises.map((name, index) => ({
          id: randomUUID(),
          routine_id: routineId,
          user_id: user.id,
          name,
          target_sets: null,
          target_reps: null,
          order: index,
          work_seconds: null,
          rest_seconds: null,
          pendingSync: true,
          pendingDelete: false,
        }));
        set((s) => ({
          routines: [...s.routines, routine],
          exercises: [...s.exercises, ...exercises],
        }));
        void get().runSync();
        return routineId;
      },

      renameRoutine: (id, name) => {
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === id ? { ...r, name: name.trim(), pendingSync: true } : r,
          ),
        }));
        void get().runSync();
      },

      updateRoutine: (id, patch) => {
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === id ? { ...r, ...patch, pendingSync: true } : r,
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
          work_seconds: input.work_seconds ?? null,
          rest_seconds: input.rest_seconds ?? null,
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
          if (!(await isOnline())) {
            set({ syncing: false }); // offline — try again later
            return;
          }
          // Routines before exercises so a server cascade-delete is reflected on pull.
          const serverRoutines = await pushAndPull(snapRoutines, routinesRemote, toRemoteRoutine);
          const serverExercises = await pushAndPull(snapExercises, exercisesRemote, toRemoteExercise);
          set((s) => ({
            routines: mergeAfterSync(serverRoutines, s.routines, snapRoutineIds),
            exercises: mergeAfterSync(serverExercises, s.exercises, snapExerciseIds),
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

export const selectExerciseById =
  (exerciseId: string) =>
  (s: RoutinesState): LocalExercise | undefined =>
    s.exercises.find((e) => e.id === exerciseId && !e.pendingDelete);

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
