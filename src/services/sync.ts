import type { SyncMeta } from '@/types';

import { isOnline } from './connectivity';

/**
 * Generic local-first sync (AGENTS.md §6). One reusable engine for every entity
 * collection (routines, exercises, workout logs, …).
 *
 * Strategy per collection: push pending local changes (tombstones, then upserts),
 * then pull the server state as the source of truth. Idempotent — a failed/partial
 * run keeps local pending flags so the next run safely retries (upsert/delete are
 * idempotent). Returns server rows as clean local entities (flags cleared); the
 * caller (store) merges them, preserving items changed during the sync.
 */

export interface EntityRemote<R> {
  fetchAll: () => Promise<R[]>;
  upsert: (row: R) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export async function pushAndPull<R extends { id: string }>(
  snapshot: (R & SyncMeta)[],
  remote: EntityRemote<R>,
  toRemote: (item: R & SyncMeta) => R,
): Promise<(R & SyncMeta)[]> {
  for (const item of snapshot.filter((i) => i.pendingDelete)) {
    await remote.remove(item.id);
  }
  for (const item of snapshot.filter((i) => i.pendingSync && !i.pendingDelete)) {
    await remote.upsert(toRemote(item));
  }
  const rows = await remote.fetchAll();
  return rows.map((r) => ({ ...r, pendingSync: false, pendingDelete: false }));
}

export { isOnline };
