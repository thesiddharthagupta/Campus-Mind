import { supabase } from '../../../lib/supabaseClient';
import type { StudySession } from '../../../shared/types/common';

type StudySessionRow = {
  id: string;
  subject_id: string | null;
  duration_seconds: number;
  started_at: string;
  subject: { name: string } | { name: string }[] | null;
};

const one = <T,>(value: T | T[] | null): T | null => Array.isArray(value) ? value[0] ?? null : value;

function fromRow(row: StudySessionRow): StudySession {
  return {
    id: row.id,
    subjectId: row.subject_id,
    subject: one(row.subject)?.name ?? 'General study',
    durationSeconds: row.duration_seconds,
    startedAt: row.started_at,
  };
}

export async function listStudySessions(): Promise<StudySession[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('study_sessions')
    .select('id,subject_id,duration_seconds,started_at,subject:subjects(name)')
    .order('started_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => fromRow(row as StudySessionRow));
}

export async function createStudySession(session: Omit<StudySession, 'id'>): Promise<StudySession> {
  if (!supabase) throw new Error('Study tracking is not connected.');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Sign in to save your study session.');

  const { data, error } = await supabase.from('study_sessions').insert({
    user_id: user.id,
    subject_id: session.subjectId,
    duration_seconds: session.durationSeconds,
    started_at: session.startedAt,
  }).select('id,subject_id,duration_seconds,started_at,subject:subjects(name)').single();

  if (error) throw new Error(error.message);
  return fromRow(data as StudySessionRow);
}
