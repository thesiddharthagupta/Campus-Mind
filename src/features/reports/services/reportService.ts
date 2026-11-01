import { supabase } from '../../../lib/supabaseClient';

export async function submitContentReport(materialId: string, reason: string, details: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Sign in before submitting a report.');
  const { error } = await supabase.from('reports').insert({ reporter_id: user.id, material_id: materialId, reason, details });
  if (error) throw new Error(error.message);
}
