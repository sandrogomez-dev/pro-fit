import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from '@/services';

export type AudioMode = 'off' | 'beeps' | 'voice' | 'both';

interface SettingsState {
  audioMode: AudioMode;
  setAudioMode: (mode: AudioMode) => void;
  hydrated: boolean;
  _setHydrated: () => void;
}

/** User preferences (persisted on device). */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      audioMode: 'beeps',
      setAudioMode: (mode) => set({ audioMode: mode }),
      hydrated: false,
      _setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => appStorage),
      partialize: (s) => ({ audioMode: s.audioMode }),
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
);
