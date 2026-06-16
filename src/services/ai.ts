import { requireSupabase } from './supabase';

export interface Alternative {
  name: string;
  equipment: string;
  why: string;
}

export interface SubstituteResult {
  alternatives: Alternative[];
  remaining: number;
}

export type SwapReason = 'equipment_busy' | 'no_equipment' | 'too_hard' | 'too_easy';

export interface SubstituteInput {
  exercise: string;
  equipment?: string;
  reason?: SwapReason;
}

/**
 * Ask the `deepseek-substitute` edge function for 3 alternatives. The key, rate
 * limit (5/day) and validation all live server-side; this only sends a non-personal
 * payload and surfaces friendly errors (AGENTS.md §5).
 */
export async function suggestSubstitutes(input: SubstituteInput): Promise<SubstituteResult> {
  const { data, error } = await requireSupabase().functions.invoke<SubstituteResult>(
    'deepseek-substitute',
    { body: input },
  );

  if (error) {
    let message = 'Could not get suggestions. Try again later.';
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === 'function') {
      try {
        const payload = (await context.json()) as { error?: string };
        if (context.status === 429) message = "You've hit today's AI limit (5/day).";
        else if (payload?.error) message = payload.error;
      } catch {
        // keep the generic message
      }
    }
    throw new Error(message);
  }

  if (!data) throw new Error('Could not get suggestions. Try again later.');
  return data;
}
