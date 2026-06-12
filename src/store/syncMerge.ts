import type { SyncMeta } from '@/types';

/**
 * Merge server truth into the current local collection after a sync, keeping any
 * local items created/changed AFTER the synced snapshot (so a write made during the
 * sync is never lost). Shared by every local-first store (AGENTS.md §6).
 */
export function mergeAfterSync<T extends { id: string } & SyncMeta>(
  serverTruth: T[],
  current: T[],
  snapshotIds: Set<string>,
): T[] {
  const newcomers = current.filter(
    (item) => !snapshotIds.has(item.id) && (item.pendingSync || item.pendingDelete),
  );
  return [...serverTruth, ...newcomers];
}
