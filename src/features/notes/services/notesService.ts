import { supabase } from '../../../lib/supabaseClient';
import type { Note } from '../../../shared/types/common';

const dateLabel = (value: string) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const colors = ['lavender', 'mint', 'peach', 'blue'];

export async function listNotes(): Promise<Note[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('notes').select('id,title,content,tags,updated_at,subject:subjects(name)').order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row, index) => {
    const relation = row.subject as { name: string } | { name: string }[] | null;
    const subject = Array.isArray(relation) ? relation[0]?.name : relation?.name;
    return { id: row.id, title: row.title, subject: subject ?? 'Uncategorized', updatedAt: dateLabel(row.updated_at), content: row.content, tags: row.tags ?? [], color: colors[index % colors.length] };
  });
}

async function findSubjectId(subjectName: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('subjects').select('id').eq('name', subjectName).limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

export async function createNote(note: Note): Promise<Note> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Sign in before creating a note.');
  const subjectId = await findSubjectId(note.subject);
  const { data, error } = await supabase.from('notes').insert({ owner_id: user.id, subject_id: subjectId, title: note.title, content: note.content, tags: note.tags, is_public: false }).select('id,updated_at').single();
  if (error) throw new Error(error.message);
  return { ...note, id: data.id, updatedAt: dateLabel(data.updated_at) };
}

export async function saveNote(note: Note): Promise<void> {
  if (!supabase) return;
  const subjectId = await findSubjectId(note.subject);
  const { error } = await supabase.from('notes').update({ title: note.title, content: note.content, tags: note.tags, subject_id: subjectId }).eq('id', note.id);
  if (error) throw new Error(error.message);
}

export async function deleteNote(noteId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw new Error(error.message);
}
