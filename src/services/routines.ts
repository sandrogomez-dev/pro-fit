import type { Exercise, Routine } from '@/types';

import { requireSupabase } from './supabase';

/**
 * Remote CRUD for routines and exercises. Pure Supabase access — no local state,
 * no optimistic logic (that lives in the store + sync engine). RLS scopes every
 * row to the owner, so these never need an explicit user_id filter on read.
 */

export async function fetchRoutines(): Promise<Routine[]> {
  const { data, error } = await requireSupabase()
    .from('routines')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await requireSupabase()
    .from('exercises')
    .select('*')
    .order('order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertRoutine(routine: Routine): Promise<void> {
  const { error } = await requireSupabase().from('routines').upsert(routine);
  if (error) throw error;
}

export async function deleteRoutine(id: string): Promise<void> {
  const { error } = await requireSupabase().from('routines').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertExercise(exercise: Exercise): Promise<void> {
  const { error } = await requireSupabase().from('exercises').upsert(exercise);
  if (error) throw error;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await requireSupabase().from('exercises').delete().eq('id', id);
  if (error) throw error;
}
