import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import { createAccount, signInWithPassword, signOutUser } from '../services/authService';
import type { AppRole, AuthContextValue } from '../types/auth.types';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [role, setRole] = useState<AppRole>('student');
  const [roleLoadedFor, setRoleLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase || !user) {
      setRole('student');
      setRoleLoadedFor(null);
      return;
    }
    let mounted = true;
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        const loadedRole = data?.role;
        setRole(loadedRole === 'teacher' || loadedRole === 'moderator' || loadedRole === 'admin' ? loadedRole : 'student');
        setRoleLoadedFor(user.id);
      }, () => {
        if (mounted) {
          setRole('student');
          setRoleLoadedFor(user.id);
        }
      });
    return () => { mounted = false; };
  }, [user?.id]);

  const value = useMemo<AuthContextValue>(() => ({
    configured: isSupabaseConfigured,
    loading,
    role,
    roleLoading: Boolean(isSupabaseConfigured && user && roleLoadedFor !== user.id),
    user,
    signIn: signInWithPassword,
    signUp: createAccount,
    signOut: signOutUser,
  }), [loading, role, roleLoadedFor, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
