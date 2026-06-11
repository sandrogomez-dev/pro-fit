import type { Profile } from '@/types';

import { requireSupabase } from './supabase';

/**
 * Profile service. The `profiles` row is created by a DB trigger on signup
 * (supabase/AGENTS.md §2); here we only read it. `is_premium` gates premium
 * features (AGENTS.md §12) and is toggled manually for testing in the MVP.
 */
export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
