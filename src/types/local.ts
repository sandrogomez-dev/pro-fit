import type { Exercise, Routine } from './database';

/**
 * Local-first sync metadata attached to every locally-stored entity.
 *
 * - `pendingSync`: created/updated locally, not yet pushed to Supabase.
 * - `pendingDelete`: deleted locally (tombstone), not yet deleted on Supabase.
 *
 * The sync engine (services/sync.ts) clears these as it reconciles with the
 * server. The server is the source of truth on conflict, but a local change is
 * never dropped before it has been pushed (AGENTS.md §6).
 */
export interface SyncMeta {
  pendingSync: boolean;
  pendingDelete: boolean;
}

export type LocalRoutine = Routine & SyncMeta;
export type LocalExercise = Exercise & SyncMeta;

/** Strip local-only sync metadata to get the clean DB row shape. */
export function toRemoteRoutine(r: LocalRoutine): Routine {
  const { pendingSync: _p, pendingDelete: _d, ...remote } = r;
  return remote;
}

export function toRemoteExercise(e: LocalExercise): Exercise {
  const { pendingSync: _p, pendingDelete: _d, ...remote } = e;
  return remote;
}
