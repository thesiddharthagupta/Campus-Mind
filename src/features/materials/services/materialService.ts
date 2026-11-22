import { supabase } from '../../../lib/supabaseClient';
import type { Material } from '../../../shared/types/common';

const BUCKET = 'study-materials';
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const kindFrom = (value: string): Material['kind'] => value === 'past_paper' ? 'Past paper' : value === 'study_guide' ? 'Study guide' : value === 'reference' ? 'Reference' : 'Lecture notes';
const resourceTypeFrom = (value: Material['kind']) => value === 'Past paper' ? 'past_paper' : value === 'Study guide' ? 'study_guide' : value === 'Reference' ? 'reference' : 'notes';
const humanSize = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const dateLabel = (value: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
const palette = ['lavender', 'mint', 'peach', 'blue'];

export async function listMaterials(): Promise<Material[]> {
  if (!supabase) return [];
  const [{ data: rows, error }, { data: bookmarkRows }] = await Promise.all([
    supabase.from('materials').select('id,title,description,resource_type,storage_path,byte_size,created_at,subject:subjects(name),owner:profiles(display_name)').order('created_at', { ascending: false }),
    supabase.from('bookmarks').select('material_id'),
  ]);
  if (error) throw new Error(error.message);
  const bookmarked = new Set((bookmarkRows ?? []).map((row) => row.material_id));
  return (rows ?? []).map((row, index) => {
    const relation = row.subject as { name: string } | { name: string }[] | null;
    const owner = row.owner as { display_name: string } | { display_name: string }[] | null;
    const subject = Array.isArray(relation) ? relation[0]?.name : relation?.name;
    const author = Array.isArray(owner) ? owner[0]?.display_name : owner?.display_name;
    return { id: row.id, title: row.title, subject: subject ?? 'Course material', kind: kindFrom(row.resource_type), author: author || 'CampusMind student', date: dateLabel(row.created_at), size: row.byte_size ? humanSize(row.byte_size) : 'File', color: palette[index % palette.length], bookmarked: bookmarked.has(row.id), pages: 1, description: row.description || 'Shared study material.', storagePath: row.storage_path ?? undefined };
  });
}

export async function uploadMaterial(file: File, subjectName: string): Promise<Material> {
  if (!supabase) throw new Error('Supabase is not configured.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Choose a file smaller than 25 MB.');
  const { data: subject, error: subjectError } = await supabase.from('subjects').select('id').eq('name', subjectName).limit(1).maybeSingle();
  if (subjectError) throw new Error(subjectError.message);
  if (!subject) throw new Error(`The subject “${subjectName}” is not in the connected academic structure yet.`);
  const form = new FormData();
  form.set('file', file);
  form.set('subjectId', subject.id);
  const { data, error } = await supabase.functions.invoke<{
    id: string;
    title: string;
    description: string;
    resource_type: string;
    storage_path: string;
    byte_size: number;
    created_at: string;
  }>('upload-material', { body: form });
  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const body = await context.json() as { error?: string };
        if (body.error) message = body.error;
      } catch { /* Keep the SDK's error message when the response isn't JSON. */ }
    }
    throw new Error(message);
  }
  if (!data) throw new Error('The upload service returned no material.');
  return { id: data.id, title: data.title, subject: subjectName, kind: kindFrom(data.resource_type), author: 'You', date: dateLabel(data.created_at), size: humanSize(data.byte_size), color: 'blue', bookmarked: false, pages: 1, description: data.description || 'Uploaded for moderator review.', storagePath: data.storage_path };
}

export async function setMaterialBookmark(materialId: string, bookmarked: boolean): Promise<void> {
  if (!supabase) return;
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Sign in to save bookmarks.');
  const result = bookmarked
    ? await supabase.from('bookmarks').upsert({ user_id: user.id, material_id: materialId })
    : await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('material_id', materialId);
  if (result.error) throw new Error(result.error.message);
}

export async function getMaterialPreviewUrl(storagePath: string): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 5);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export { resourceTypeFrom };
