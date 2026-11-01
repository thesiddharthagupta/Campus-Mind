import type { User } from '@supabase/supabase-js';

export type AuthContextValue = {
  configured: boolean;
  demoMode: boolean;
  loading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null; confirmationRequired: boolean }>;
  signOut: () => Promise<void>;
};
