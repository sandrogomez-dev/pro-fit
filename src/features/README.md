# /features — one folder per feature

Each feature owns its screens, components, hooks and types. A feature is
self-contained so it can be built and reasoned about in isolation.

Planned MVP features (AGENTS.md §3):

- `auth` — email sign-in (Google later)
- `routines` — routines & exercises CRUD (free: 3 routines; premium: unlimited)
- `workouts` — workout logging (sets/reps/weight + done check), offline-first
- `timer` — rest timer via scheduled local notifications (AGENTS.md §13)
- `prs` — personal records & progress (history/charts are premium)
- `ai-substitution` — exercise swap via the `deepseek-substitute` edge function

Shared, presentational UI goes in `/src/components`; shared logic in `/src/hooks`.

Empty for the Phase 1 skeleton.
