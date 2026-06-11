import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, isSupabaseConfigured } from './env';

/**
 * The single Supabase client for the whole app. All Supabase access goes through
 * `/services` — never import this directly into a component (AGENTS.md §8).
 *
 * Session is persisted on-device via AsyncStorage. We disable URL session
 * detection (that is a web concept; we use the `profit://` deep-link scheme).
 *
 * While Supabase is not yet configured (SETUP.md pending), `supabase` is `null`.
 * Call `requireSupabase()` from code paths that genuinely need the backend so the
 * failure is explicit instead of a cryptic crash.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and ' +
        'EXPO_PUBLIC_SUPABASE_ANON_KEY in .env (see SETUP.md).',
    );
  }
  return supabase;
}

export { isSupabaseConfigured };
