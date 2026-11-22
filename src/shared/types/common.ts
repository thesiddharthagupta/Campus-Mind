export type Material = { id: string; title: string; subject: string; kind: 'Lecture notes' | 'Past paper' | 'Study guide' | 'Reference'; author: string; date: string; size: string; color: string; bookmarked: boolean; pages: number; description: string; storagePath?: string };
export type Note = { id: string; title: string; subject: string; updatedAt: string; content: string; tags: string[]; color: string };
export type QuizQuestionData = { id: string; prompt: string; options: string[] };
export type Quiz = { id: string; title: string; subject: string; questions: number; duration: number; difficulty: 'Easy' | 'Medium' | 'Hard'; lastScore?: number; attempts: number; items?: QuizQuestionData[] };
export type Subject = { id: string; name: string; code: string; modules: number; progress: number; tint: string; icon: string };
export type StudySession = { id: string; subjectId: string | null; subject: string; durationSeconds: number; startedAt: string };
