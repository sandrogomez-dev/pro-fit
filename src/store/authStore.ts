import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { authService, isSupabaseConfigured, profileService } from '@/services';
import type { Profile } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** Convenience flag for premium gating (AGENTS.md §12). */
  isPremium: boolean;
  /**
   * Restore the session from storage and subscribe to auth changes.
   * Call once on app start. Returns an unsubscribe function.
   */
  initialize: () => () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  function applySession(session: Session | null): void {
    set({
      session,
      user: session?.user ?? null,
      status: session ? 'authenticated' : 'unauthenticated',
    });
    if (session) {
      // Fire-and-forget: the profile fills in the premium flag shortly after auth.
      void get().refreshProfile();
    } else {
      set({ profile: null, isPremium: false });
    }
  }

  return {
    status: 'loading',
    session: null,
    user: null,
    profile: null,
    isPremium: false,

    initialize: () => {
      if (!isSupabaseConfigured) {
        set({ status: 'unauthenticated' });
        return () => {};
      }

      authService
        .getCurrentSession()
        .then(applySession)
        .catch(() => set({ status: 'unauthenticated' }));

      return authService.onAuthStateChange(applySession);
    },

    refreshProfile: async () => {
      const userId = get().user?.id;
      if (!userId) return;
      try {
        const profile = await profileService.fetchMyProfile(userId);
        set({ profile, isPremium: profile?.is_premium ?? false });
      } catch {
        // Non-fatal: keep going as free until the next refresh.
      }
    },

    signOut: async () => {
      await authService.signOut();
      applySession(null);
    },
  };
});
