import type { LocalExercise, LocalRoutine } from '@/types';
import { toRemoteExercise, toRemoteRoutine } from '@/types';

import { isOnline } from './connectivity';
import * as routinesApi from './routines';

/**
 * Sync engine (AGENTS.md §6). Strategy: push every pending local change, then pull
 * the server state as the source of truth. Idempotent — a failed/partial run keeps
 * local pending flags so the next run safely retries (upsert/delete are idempotent).
 *
 * Returns the server truth as clean local entities (flags cleared). The caller
 * (store) merges this against its current state, preserving any still-pending local
 * items so a write made during the sync is never lost.
 */

export interface SyncSnapshot {
  routines: LocalRoutine[];
  exercises: LocalExercise[];
}

export interface SyncOutcome {
  /** False when offline — nothing was pushed or pulled. */
  synced: boolean;
  serverRoutines: LocalRoutine[];
  serverExercises: LocalExercise[];
}

const clean = { pendingSync: false, pendingDelete: false } as const;

export async function syncRoutines(snapshot: SyncSnapshot): Promise<SyncOutcome> {
  if (!(await isOnline())) {
    return { synced: false, serverRoutines: [], serverExercises: [] };
  }

  // 1. Push tombstones first (so re-created ids don't collide).
  for (const routine of snapshot.routines.filter((r) => r.pendingDelete)) {
    await routinesApi.deleteRoutine(routine.id);
  }
  for (const exercise of snapshot.exercises.filter((e) => e.pendingDelete)) {
    await routinesApi.deleteExercise(exercise.id);
  }

  // 2. Push creates/updates.
  for (const routine of snapshot.routines.filter((r) => r.pendingSync && !r.pendingDelete)) {
    await routinesApi.upsertRoutine(toRemoteRoutine(routine));
  }
  for (const exercise of snapshot.exercises.filter((e) => e.pendingSync && !e.pendingDelete)) {
    await routinesApi.upsertExercise(toRemoteExercise(exercise));
  }

  // 3. Pull the reconciled server state (now includes our pushes).
  const [remoteRoutines, remoteExercises] = await Promise.all([
    routinesApi.fetchRoutines(),
    routinesApi.fetchExercises(),
  ]);

  return {
    synced: true,
    serverRoutines: remoteRoutines.map((r) => ({ ...r, ...clean })),
    serverExercises: remoteExercises.map((e) => ({ ...e, ...clean })),
  };
}
