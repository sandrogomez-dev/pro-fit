import type { WorkoutLog } from '@/types';

import { requireSupabase } from './supabase';

/**
 * Remote CRUD for workout logs (one row per logged set). Pure Supabase access —
 * optimistic/offline logic lives in the store + generic sync engine. RLS scopes
 * rows to the owner.
 */

export async function fetchWorkoutLogs(): Promise<WorkoutLog[]> {
  const { data, error } = await requireSupabase()
    .from('workout_logs')
    .select('*')
    .order('performed_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertWorkoutLog(log: WorkoutLog): Promise<void> {
  const { error } = await requireSupabase().from('workout_logs').upsert(log);
  if (error) throw error;
}

export async function deleteWorkoutLog(id: string): Promise<void> {
  const { error } = await requireSupabase().from('workout_logs').delete().eq('id', id);
  if (error) throw error;
}
