# /store — global state

Local-first, on-device-persisted global state (Zustand + AsyncStorage).

- Writes are **optimistic**: update the store first, sync to Supabase in the
  background (AGENTS.md §6). Never block the UI on the network.
- Persistence goes through `/services`, not directly to AsyncStorage from here.
- Keep slices small and per-domain (e.g. `useWorkoutStore`, `useTimerStore`).

Slices: `authStore` (session + profile/premium), `routinesStore` (routines &
exercises, local-first + persisted + sync). More land with their features.
