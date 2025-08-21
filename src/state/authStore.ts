import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { getRedirectTo, supabase } from '../lib/supabase';

enum AuthStatus {
  Idle = 'idle',
  Loading = 'loading',
  SignedIn = 'signedIn',
  SignedOut = 'signedOut',
}

interface AuthState {
  session: Session | null;
  status: AuthStatus;
  init: () => Promise<void>;
  setSession: (session: Session | null) => void;
  loginWithEmail: (email: string) => Promise<{ error: any } | null>;
  loginWithPhone: (phone: string) => Promise<{ error: any } | null>;
  verifyPhoneOtp: ({ phone, token }: { phone: string; token: string }) => Promise<{ error: any } | null>;
  logout: () => Promise<{ error: any } | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  status: AuthStatus.Idle,
  setSession: (session) => set({ session, status: session ? AuthStatus.SignedIn : AuthStatus.SignedOut }),
  init: async () => {
    set({ status: AuthStatus.Loading });
    const { data } = await supabase.auth.getSession();
    get().setSession(data.session);

    supabase.auth.onAuthStateChange((_event, session) => {
      get().setSession(session);
    });
  },
  loginWithEmail: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectTo(),
      },
    });
    return { error };
  },
  loginWithPhone: async (phone) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { error };
  },
  verifyPhoneOtp: async ({ phone, token }) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { error };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
}));
