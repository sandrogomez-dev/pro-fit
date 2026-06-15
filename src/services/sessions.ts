import type { WorkoutSession } from '@/types';

import { requireSupabase } from './supabase';

/**
 * Remote CRUD for workout sessions (the training history). Pure Supabase access;
 * optimistic/offline logic lives in the store + generic sync engine.
 */

export async function fetchSessions(): Promise<WorkoutSession[]> {
  const { data, error } = await requireSupabase()
    .from('workout_sessions')
    .select('*')
    .order('started_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertSession(session: WorkoutSession): Promise<void> {
  const { error } = await requireSupabase().from('workout_sessions').upsert(session);
  if (error) throw error;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await requireSupabase().from('workout_sessions').delete().eq('id', id);
  if (error) throw error;
}
