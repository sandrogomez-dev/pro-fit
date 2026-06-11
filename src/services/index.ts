/**
 * Services layer — the ONLY place the app talks to Supabase, edge functions or
 * device persistence. Features and components consume these, never the SDKs
 * directly (AGENTS.md §8).
 */
export { supabase, requireSupabase, isSupabaseConfigured } from './supabase';
export { env } from './env';
