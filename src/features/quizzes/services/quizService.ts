import { supabase } from '../../../lib/supabaseClient';
import type { Quiz } from '../../../shared/types/common';

export async function listQuizzes(): Promise<Quiz[]> {
  if (!supabase) return [];
  const [{ data: rows, error }, { data: attempts, error: attemptsError }] = await Promise.all([
    supabase.from('quizzes').select('id,title,duration_minutes,difficulty,subject:subjects(name),quiz_questions(id,prompt,options,position)').eq('is_published', true).order('created_at', { ascending: false }),
    supabase.from('quiz_attempts').select('quiz_id,score,completed_at').order('completed_at', { ascending: false }),
  ]);
  if (error) throw new Error(error.message);
  if (attemptsError) throw new Error(attemptsError.message);
  const attemptsByQuiz = new Map<string, { count: number; lastScore?: number }>();
  for (const attempt of attempts ?? []) {
    const current = attemptsByQuiz.get(attempt.quiz_id) ?? { count: 0 };
    current.count += 1;
    if (current.lastScore === undefined) current.lastScore = Number(attempt.score);
    attemptsByQuiz.set(attempt.quiz_id, current);
  }
  return (rows ?? []).map((row) => {
    const relation = row.subject as { name: string } | { name: string }[] | null;
    const subject = Array.isArray(relation) ? relation[0]?.name : relation?.name;
    const questions = (row.quiz_questions ?? []).sort((a, b) => a.position - b.position).map((question) => ({ id: question.id, prompt: question.prompt, options: question.options as string[] }));
    const stats = attemptsByQuiz.get(row.id) ?? { count: 0 };
    const difficulty = row.difficulty === 'Easy' || row.difficulty === 'Hard' ? row.difficulty : 'Medium';
    return { id: row.id, title: row.title, subject: subject ?? 'Course practice', questions: questions.length, duration: row.duration_minutes, difficulty, attempts: stats.count, lastScore: stats.lastScore, items: questions };
  });
}

export async function submitQuizAttempt(quizId: string, answers: Record<string, number>): Promise<number> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.rpc('submit_quiz_attempt', { p_quiz_id: quizId, p_answers: answers });
  if (error) throw new Error(error.message);
  return Number(data);
}
