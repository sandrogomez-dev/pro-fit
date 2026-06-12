/**
 * Domain types mirroring the Supabase schema (see /supabase/AGENTS.md §3).
 *
 * These are hand-written for now. Once migrations exist, this file can be
 * replaced/augmented by Supabase's generated types
 * (`supabase gen types typescript`). Keep the shapes in sync with the migrations.
 */

export type Unit = 'kg' | 'lb';

export interface Profile {
  id: string; // = auth.users.id
  display_name: string | null;
  is_premium: boolean;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  /** Guided-circuit settings. work/rest in seconds (null = use defaults). */
  work_seconds: number | null;
  rest_seconds: number | null;
  rounds: number;
}

export interface Exercise {
  id: string;
  routine_id: string;
  user_id: string;
  name: string;
  target_sets: number | null;
  target_reps: number | null;
  order: number;
  /** Optional timed work phase, in seconds. null = untimed set. */
  work_seconds: number | null;
  /** Rest phase after a set, in seconds. null = use the app default. */
  rest_seconds: number | null;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  done: boolean;
  performed_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  value: number;
  unit: Unit;
  achieved_at: string;
}

export interface AiUsage {
  id: string;
  user_id: string;
  usage_date: string; // YYYY-MM-DD
  count: number;
}
