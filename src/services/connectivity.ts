import NetInfo from '@react-native-community/netinfo';

/**
 * Connectivity helpers used by the sync engine. The app never blocks on these —
 * writes are local-first; sync just waits for connectivity (AGENTS.md §6).
 */

function isReachable(state: { isConnected: boolean | null; isInternetReachable: boolean | null }): boolean {
  // isInternetReachable can be null while unknown; treat only an explicit false as offline.
  return state.isConnected === true && state.isInternetReachable !== false;
}

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return isReachable(state);
}

/** Subscribe to connectivity changes. Returns an unsubscribe function. */
export function subscribeConnectivity(callback: (online: boolean) => void): () => void {
  return NetInfo.addEventListener((state) => callback(isReachable(state)));
}
