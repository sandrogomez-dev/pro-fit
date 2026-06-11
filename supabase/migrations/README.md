# /supabase/migrations — versioned SQL schema

Every schema change is a versioned SQL file here. Each migration:

- Creates its tables **and** their RLS policies in the same file (`/supabase/AGENTS.md` §4, §6).
- Is idempotent where possible.
- Is the source of truth — no dashboard-only changes.

Empty until the Supabase project exists (SETUP.md pending). First migration will
create `profiles`, `routines`, `exercises`, `workout_logs`, `prs`, `ai_usage`.
