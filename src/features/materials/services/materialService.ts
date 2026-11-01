import { supabase } from '../../../lib/supabaseClient';
import type { Material } from '../../../shared/types/common';

const BUCKET = 'study-materials';
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const acceptedTypes = new Set(['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
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
  if (!acceptedTypes.has(file.type)) throw new Error('This file type is not supported. Choose a PDF, PNG, JPG, DOC, DOCX, or TXT file.');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Sign in before uploading a resource.');
  const { data: subject, error: subjectError } = await supabase.from('subjects').select('id').eq('name', subjectName).limit(1).maybeSingle();
  if (subjectError) throw new Error(subjectError.message);
  if (!subject) throw new Error(`The subject “${subjectName}” is not in the connected academic structure yet.`);
  const safeName = file.name.normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(-100) || 'study-resource';
  const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  const { data: row, error: insertError } = await supabase.from('materials').insert({ owner_id: user.id, subject_id: subject.id, title: file.name.replace(/\.[^.]+$/, ''), description: '', resource_type: 'notes', storage_path: storagePath, mime_type: file.type, byte_size: file.size, status: 'pending' }).select('id,title,description,resource_type,storage_path,byte_size,created_at').single();
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(insertError.message);
  }
  return { id: row.id, title: row.title, subject: subjectName, kind: kindFrom(row.resource_type), author: 'You', date: dateLabel(row.created_at), size: humanSize(file.size), color: 'blue', bookmarked: false, pages: 1, description: row.description || 'Uploaded for moderator review.', storagePath: row.storage_path };
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
