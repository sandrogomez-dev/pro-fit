/**
 * Reads and validates public (EXPO_PUBLIC_*) environment variables.
 *
 * Supabase is not set up yet, so missing values must NOT crash the app — they
 * just leave the backend unconfigured. `isSupabaseConfigured` lets the UI/services
 * degrade gracefully until the human completes SETUP.md.
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const env = {
  supabaseUrl,
  supabaseAnonKey,
} as const;

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
