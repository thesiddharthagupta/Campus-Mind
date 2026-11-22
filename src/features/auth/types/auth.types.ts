import type { User } from '@supabase/supabase-js';

export type AppRole = 'student' | 'teacher' | 'moderator' | 'admin';

export type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  role: AppRole;
  roleLoading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null; confirmationRequired: boolean }>;
  signOut: () => Promise<void>;
};
