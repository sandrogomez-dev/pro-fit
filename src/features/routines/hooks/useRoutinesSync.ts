import { useEffect } from 'react';

import { subscribeConnectivity } from '@/services';
import { useRoutinesStore } from '@/store';

/**
 * Drives background sync for the routines slice: once on mount and again whenever
 * connectivity returns (AGENTS.md §6). Mount once near the top of the authed app.
 */
export function useRoutinesSync(): void {
  useEffect(() => {
    const { runSync } = useRoutinesStore.getState();
    void runSync();
    return subscribeConnectivity((online) => {
      if (online) void runSync();
    });
  }, []);
}
