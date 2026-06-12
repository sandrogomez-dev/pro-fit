-- ============================================================================
-- 0003 — Routine-level circuit settings.
-- A routine can run as a guided circuit timer: a work duration, a rest duration
-- and a number of rounds (AGENTS.md §13, extended). All optional; rounds defaults
-- to 1. Idempotent. RLS already enforced on routines by 0001.
-- ============================================================================

alter table public.routines add column if not exists work_seconds integer;
alter table public.routines add column if not exists rest_seconds integer;
alter table public.routines add column if not exists rounds integer not null default 1;
