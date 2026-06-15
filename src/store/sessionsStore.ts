import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  appStorage,
  isOnline,
  isSupabaseConfigured,
  pushAndPull,
  sessionsApi,
  type EntityRemote,
} from '@/services';
import type { LocalWorkoutSession, WorkoutSession } from '@/types';
import { toRemoteWorkoutSession } from '@/types';

import { useAuthStore } from './authStore';
import { mergeAfterSync } from './syncMerge';

const sessionsRemote: EntityRemote<WorkoutSession> = {
  fetchAll: sessionsApi.fetchSessions,
  upsert: sessionsApi.upsertSession,
  remove: sessionsApi.deleteSession,
};

interface NewSession {
  routineId: string | null;
  routineName: string;
  startedAt: string;
  durationSeconds: number;
  rounds: number;
  completed: boolean;
}

interface SessionsState {
  sessions: LocalWorkoutSession[];
  syncing: boolean;
  lastSyncError: string | null;
  hydrated: boolean;

  addSession: (input: NewSession) => void;
  runSync: () => Promise<void>;
  reset: () => void;
  _setHydrated: () => void;
}

/**
 * Workout history (AGENTS.md §3). The circuit runner records one session per run;
 * local-first + synced like every other slice.
 */
export const useSessionsStore = create<SessionsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      syncing: false,
      lastSyncError: null,
      hydrated: false,

      addSession: (input) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        const session: LocalWorkoutSession = {
          id: randomUUID(),
          user_id: user.id,
          routine_id: input.routineId,
          routine_name: input.routineName,
          started_at: input.startedAt,
          duration_seconds: input.durationSeconds,
          rounds: input.rounds,
          completed: input.completed,
          pendingSync: true,
          pendingDelete: false,
        };
        set((s) => ({ sessions: [session, ...s.sessions] }));
        void get().runSync();
      },

      runSync: async () => {
        if (get().syncing || !isSupabaseConfigured) return;
        const snapshot = get().sessions;
        const snapshotIds = new Set(snapshot.map((x) => x.id));
        set({ syncing: true, lastSyncError: null });
        try {
          if (!(await isOnline())) {
            set({ syncing: false });
            return;
          }
          const server = await pushAndPull(snapshot, sessionsRemote, toRemoteWorkoutSession);
          set((s) => ({
            sessions: mergeAfterSync(server, s.sessions, snapshotIds),
            syncing: false,
          }));
        } catch (e) {
          set({ syncing: false, lastSyncError: e instanceof Error ? e.message : 'Sync failed' });
        }
      },

      reset: () => set({ sessions: [], syncing: false, lastSyncError: null }),
      _setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'sessions-store',
      storage: createJSONStorage(() => appStorage),
      partialize: (s) => ({ sessions: s.sessions }),
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
);

export const selectSessions = (s: SessionsState): LocalWorkoutSession[] =>
  s.sessions.filter((x) => !x.pendingDelete);

// Reset on sign-out; sync on sign-in. Kept here to avoid a circular import.
useAuthStore.subscribe((state, prev) => {
  if (prev.status !== 'unauthenticated' && state.status === 'unauthenticated') {
    useSessionsStore.getState().reset();
  }
  if (prev.status !== 'authenticated' && state.status === 'authenticated') {
    void useSessionsStore.getState().runSync();
  }
});
