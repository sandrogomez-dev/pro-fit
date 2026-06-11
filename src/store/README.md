# /store — global state

Local-first, on-device-persisted global state (Zustand + AsyncStorage).

- Writes are **optimistic**: update the store first, sync to Supabase in the
  background (AGENTS.md §6). Never block the UI on the network.
- Persistence goes through `/services`, not directly to AsyncStorage from here.
- Keep slices small and per-domain (e.g. `useWorkoutStore`, `useTimerStore`).

Empty for the Phase 1 skeleton — slices land with their features.
