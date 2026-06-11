import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { authService, isSupabaseConfigured } from '@/services';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /**
   * Restore the session from storage and subscribe to auth changes.
   * Call once on app start. Returns an unsubscribe function.
   */
  initialize: () => () => void;
  signOut: () => Promise<void>;
}

function applySession(
  set: (partial: Partial<AuthState>) => void,
  session: Session | null,
): void {
  set({
    session,
    user: session?.user ?? null,
    status: session ? 'authenticated' : 'unauthenticated',
  });
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  user: null,

  initialize: () => {
    // No backend configured yet → nothing to restore, just unblock the UI.
    if (!isSupabaseConfigured) {
      set({ status: 'unauthenticated' });
      return () => {};
    }

    authService
      .getCurrentSession()
      .then((session) => applySession(set, session))
      .catch(() => set({ status: 'unauthenticated' }));

    return authService.onAuthStateChange((session) => applySession(set, session));
  },

  signOut: async () => {
    await authService.signOut();
    // onAuthStateChange will also fire, but set eagerly for a snappy UI.
    applySession(set, null);
  },
}));
