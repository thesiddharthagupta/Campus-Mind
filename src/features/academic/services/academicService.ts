import { supabase } from '../../../lib/supabaseClient';
import type { AcademicSubject } from '../types/academic.types';

const palettes = ['lavender', 'mint', 'peach', 'blue'];
const icons = ['database', 'braces', 'network', 'cpu'];
const one = <T,>(value: T | T[] | null): T | null => Array.isArray(value) ? value[0] ?? null : value;

export async function loadAcademicStructure(): Promise<{ subjects: AcademicSubject[]; completedTopicIds: string[] }> {
  if (!supabase) return { subjects: [], completedTopicIds: [] };
  const { data, error } = await supabase.from('subjects').select('id,name,code,description,modules(id,title,position,topics(id,title,position)),semester:semesters(label,number,program:programs(name,department:departments(name,university:universities(name))))').order('code');
  if (error) throw new Error(error.message);
  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError || !userResult.user) throw new Error('Sign in to load your academic structure.');
  const { data: progress, error: progressError } = await supabase.from('topic_progress').select('topic_id,is_completed').eq('user_id', userResult.user.id);
  if (progressError) throw new Error(progressError.message);
  const completedTopicIds = (progress ?? []).filter((entry) => entry.is_completed).map((entry) => entry.topic_id);
  const complete = new Set(completedTopicIds);

  const subjects: AcademicSubject[] = (data ?? []).map((row, index) => {
    const semester = one(row.semester as { label: string; number: number; program: unknown } | { label: string; number: number; program: unknown }[] | null);
    const program = one(semester?.program as { name: string; department: unknown } | { name: string; department: unknown }[] | null);
    const department = one(program?.department as { name: string; university: unknown } | { name: string; university: unknown }[] | null);
    const university = one(department?.university as { name: string } | { name: string }[] | null);
    const moduleItems = (row.modules ?? []).map((module) => ({
      id: module.id,
      title: module.title,
      position: module.position,
      topics: (module.topics ?? []).map((topic) => ({ id: topic.id, title: topic.title, position: topic.position })),
    })).sort((a, b) => a.position - b.position);
    const totalTopics = moduleItems.reduce((sum, module) => sum + module.topics.length, 0);
    const doneTopics = moduleItems.reduce((sum, module) => sum + module.topics.filter((topic) => complete.has(topic.id)).length, 0);
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description ?? '',
      modules: moduleItems.length,
      progress: totalTopics ? Math.round(doneTopics / totalTopics * 100) : 0,
      tint: palettes[index % palettes.length],
      icon: icons[index % icons.length],
      university: university?.name ?? 'University',
      department: department?.name ?? 'Department',
      program: program?.name ?? 'Program',
      semester: semester?.label ?? (semester?.number ? `Semester ${semester.number}` : 'Semester'),
      moduleItems,
    };
  });
  return { subjects, completedTopicIds };
}

export async function setTopicCompleted(topicId: string, isCompleted: boolean): Promise<void> {
  if (!supabase) return;
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Sign in to update your study progress.');
  const { error } = await supabase.from('topic_progress').upsert({ user_id: user.id, topic_id: topicId, is_completed: isCompleted }, { onConflict: 'user_id,topic_id' });
  if (error) throw new Error(error.message);
}
