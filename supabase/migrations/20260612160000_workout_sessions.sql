-- ============================================================================
-- 0004 — Workout sessions (training log).
-- One row per completed (or stopped) circuit run, so Progress can show a real
-- workout history. routine_name is denormalised so history survives a routine
-- deletion. Idempotent; RLS scopes rows to the owner.
-- ============================================================================

create table if not exists public.workout_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users (id) on delete cascade,
  routine_id       uuid        references public.routines (id) on delete set null,
  routine_name     text        not null,
  started_at       timestamptz not null default now(),
  duration_seconds integer     not null default 0,
  rounds           integer     not null default 1,
  completed        boolean     not null default true
);

create index if not exists workout_sessions_user_id_idx on public.workout_sessions (user_id);

alter table public.workout_sessions enable row level security;

drop policy if exists "workout_sessions: all own" on public.workout_sessions;
create policy "workout_sessions: all own"
  on public.workout_sessions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
