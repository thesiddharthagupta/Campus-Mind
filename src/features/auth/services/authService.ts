import { supabase } from '../../../lib/supabaseClient';

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { error: 'Supabase is not configured yet.' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function createAccount(name: string, email: string, password: string) {
  if (!supabase) return { error: 'Supabase is not configured yet.', confirmationRequired: false };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name }, emailRedirectTo: window.location.origin },
  });
  return { error: error?.message ?? null, confirmationRequired: !error && !data.session };
}

export async function signOutUser() {
  if (supabase) await supabase.auth.signOut();
}
