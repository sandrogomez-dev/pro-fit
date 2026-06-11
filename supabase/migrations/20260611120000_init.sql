-- ============================================================================
-- 0001 — Initial schema for the ProFit gym app.
-- Creates the 6 MVP tables, enables RLS on every one (default deny), adds the
-- per-user policies, and the trigger that creates a `profiles` row on signup.
--
-- Security rules: root AGENTS.md §5 and supabase/AGENTS.md §4.
-- A user may only read/write rows where user_id = auth.uid(); profiles is keyed
-- by id = auth.uid().
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_premium   boolean     not null default false,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- routines
-- ----------------------------------------------------------------------------
create table if not exists public.routines (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  name       text        not null,
  created_at timestamptz not null default now()
);

create index if not exists routines_user_id_idx on public.routines (user_id);

alter table public.routines enable row level security;

drop policy if exists "routines: all own" on public.routines;
create policy "routines: all own"
  on public.routines for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- exercises  (belong to a routine)
-- `order` is a reserved word, hence the double quotes.
-- ----------------------------------------------------------------------------
create table if not exists public.exercises (
  id           uuid primary key default gen_random_uuid(),
  routine_id   uuid    not null references public.routines (id) on delete cascade,
  user_id      uuid    not null references auth.users (id) on delete cascade,
  name         text    not null,
  target_sets  integer,
  target_reps  integer,
  "order"      integer not null default 0
);

create index if not exists exercises_routine_id_idx on public.exercises (routine_id);
create index if not exists exercises_user_id_idx on public.exercises (user_id);

alter table public.exercises enable row level security;

drop policy if exists "exercises: all own" on public.exercises;
create policy "exercises: all own"
  on public.exercises for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- workout_logs  (one row per logged set)
-- ----------------------------------------------------------------------------
create table if not exists public.workout_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users (id) on delete cascade,
  exercise_id  uuid        not null references public.exercises (id) on delete cascade,
  set_number   integer     not null,
  reps         integer     not null,
  weight       numeric     not null,
  done         boolean     not null default false,
  performed_at timestamptz not null default now()
);

create index if not exists workout_logs_user_id_idx on public.workout_logs (user_id);
create index if not exists workout_logs_exercise_id_idx on public.workout_logs (exercise_id);

alter table public.workout_logs enable row level security;

drop policy if exists "workout_logs: all own" on public.workout_logs;
create policy "workout_logs: all own"
  on public.workout_logs for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- prs  (personal records; auto-derived from workout_logs by the app)
-- ----------------------------------------------------------------------------
create table if not exists public.prs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users (id) on delete cascade,
  exercise_name text        not null,
  value         numeric     not null,
  unit          text        not null default 'kg' check (unit in ('kg', 'lb')),
  achieved_at   timestamptz not null default now()
);

create index if not exists prs_user_id_idx on public.prs (user_id);

alter table public.prs enable row level security;

drop policy if exists "prs: all own" on public.prs;
create policy "prs: all own"
  on public.prs for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- ai_usage  (server-side rate limiting for the DeepSeek substitution feature)
-- One row per user per day; the edge function upserts and increments `count`.
-- ----------------------------------------------------------------------------
create table if not exists public.ai_usage (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    not null references auth.users (id) on delete cascade,
  usage_date date    not null default current_date,
  count      integer not null default 0,
  unique (user_id, usage_date)
);

create index if not exists ai_usage_user_id_idx on public.ai_usage (user_id);

alter table public.ai_usage enable row level security;

-- The app may READ its own usage (to show "X left", cosmetic). Writes are done
-- by the edge function with the service role, which bypasses RLS — clients must
-- never increment their own counter (supabase/AGENTS.md §5).
drop policy if exists "ai_usage: select own" on public.ai_usage;
create policy "ai_usage: select own"
  on public.ai_usage for select
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Trigger: create a profiles row when a new auth user signs up.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
