import { useEffect } from 'react';

import { subscribeConnectivity } from '@/services';
import { useSessionsStore } from '@/store';

/**
 * Drives background sync for the workout-sessions slice: once on mount and again
 * when connectivity returns (AGENTS.md §6). Mount once near the top of the authed app.
 */
export function useSessionsSync(): void {
  useEffect(() => {
    const { runSync } = useSessionsStore.getState();
    void runSync();
    return subscribeConnectivity((online) => {
      if (online) void runSync();
    });
  }, []);
}
