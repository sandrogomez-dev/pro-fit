import type { Session } from '@supabase/supabase-js';

import { requireSupabase } from './supabase';

/**
 * Auth service — the only place the app calls Supabase Auth (AGENTS.md §8).
 * Email/password for the MVP; Google sign-in lands later (SETUP.md).
 *
 * On signup the `display_name` is passed as user metadata; the `handle_new_user`
 * DB trigger reads it to create the matching `profiles` row (supabase/AGENTS.md §2).
 */

export interface SignUpResult {
  /**
   * True when the project has email confirmation ON and no session was created —
   * the user must click the link in their inbox before they can sign in.
   */
  needsEmailConfirmation: boolean;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<SignUpResult> {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: displayName ? { data: { display_name: displayName } } : undefined,
  });
  if (error) throw error;
  return { needsEmailConfirmation: data.session === null };
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Subscribe to auth state changes. Returns an unsubscribe function.
 */
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const {
    data: { subscription },
  } = requireSupabase().auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}
