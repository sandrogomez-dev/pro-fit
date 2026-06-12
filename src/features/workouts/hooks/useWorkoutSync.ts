import { useEffect } from 'react';

import { subscribeConnectivity } from '@/services';
import { useWorkoutStore } from '@/store';

/**
 * Drives background sync for the workout-logs slice: once on mount and again when
 * connectivity returns (AGENTS.md §6). Mount once near the top of the authed app.
 */
export function useWorkoutSync(): void {
  useEffect(() => {
    const { runSync } = useWorkoutStore.getState();
    void runSync();
    return subscribeConnectivity((online) => {
      if (online) void runSync();
    });
  }, []);
}
