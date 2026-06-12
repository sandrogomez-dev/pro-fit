-- ============================================================================
-- 0002 — Per-exercise work/rest durations (seconds).
-- Lets each exercise carry an optional timed "work" phase and a "rest" phase,
-- driving the interval timer (AGENTS.md §13). Both nullable; null = unset.
-- Idempotent. RLS already enforced on the table by 0001.
-- ============================================================================

alter table public.exercises add column if not exists work_seconds integer;
alter table public.exercises add column if not exists rest_seconds integer;
