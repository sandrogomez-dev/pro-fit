import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * On-device key/value persistence, behind a small interface so the backing store
 * can change (AsyncStorage now → MMKV later) without touching callers
 * (AGENTS.md §12). Shape matches Zustand's `StateStorage` so it can back a
 * persisted store directly.
 */
export interface KeyValueStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export const appStorage: KeyValueStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
