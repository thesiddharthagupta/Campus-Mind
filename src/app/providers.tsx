import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { demoAcademicStructure, demoCompletedTopicIds, demoMaterials, demoNotes, demoQuizzes } from '../features/dashboard/data/demoData';
import type { Material, Note, Quiz, Subject } from '../shared/types/common';
import type { AcademicSubject } from '../features/academic/types/academic.types';
import { AuthProvider } from '../features/auth/components/AuthProvider';
import { useAuth } from '../features/auth/hooks/useAuth';
import { listMaterials, setMaterialBookmark, uploadMaterial } from '../features/materials/services/materialService';
import { createNote, listNotes, saveNote as saveRemoteNote } from '../features/notes/services/notesService';
import { listQuizzes, submitQuizAttempt } from '../features/quizzes/services/quizService';
import { loadAcademicStructure, setTopicCompleted } from '../features/academic/services/academicService';

type CampusContextValue = {
  materials: Material[];
  notes: Note[];
  notesLoading: boolean;
  notesSaving: boolean;
  notesError: string | null;
  quizzes: Quiz[];
  quizzesLoading: boolean;
  quizzesError: string | null;
  subjects: Subject[];
  academicSubjects: AcademicSubject[];
  completedTopicIds: string[];
  academicLoading: boolean;
  academicError: string | null;
  materialsLoading: boolean;
  materialsError: string | null;
  addMaterial: (file: File, subject: string) => Promise<{ error: string | null }>;
  toggleBookmark: (id: string) => Promise<{ error: string | null }>;
  addNote: (note: Note) => Promise<{ note: Note | null; error: string | null }>;
  updateNote: (note: Note) => void;
  completeQuiz: (id: string, answers: Record<string, number>, localScore: number) => Promise<{ score: number | null; error: string | null }>;
  toggleTopicCompletion: (topicId: string, completed: boolean) => Promise<{ error: string | null }>;
};
const CampusContext = createContext<CampusContextValue | null>(null);
const readStored = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
};
function withCompletion(subjects: AcademicSubject[], completedIds: string[]) {
  const completed = new Set(completedIds);
  return subjects.map((subject) => {
    const topics = subject.moduleItems.flatMap((module) => module.topics);
    return { ...subject, progress: topics.length ? Math.round(topics.filter((topic) => completed.has(topic.id)).length / topics.length * 100) : 0 };
  });
}
export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider><CampusDataProvider>{children}</CampusDataProvider></AuthProvider>;
}

function CampusDataProvider({ children }: { children: ReactNode }) {
  const { configured, demoMode, user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>(() => demoMode ? readStored('cm-materials', demoMaterials) : []);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>(() => demoMode ? readStored('cm-notes', demoNotes) : []);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => demoMode ? readStored('cm-quizzes', demoQuizzes) : []);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(() => demoMode ? readStored('cm-topic-progress', demoCompletedTopicIds) : []);
  const [academicSubjects, setAcademicSubjects] = useState<AcademicSubject[]>(() => demoMode ? withCompletion(demoAcademicStructure, readStored('cm-topic-progress', demoCompletedTopicIds)) : []);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicError, setAcademicError] = useState<string | null>(null);
  const noteSaveTimers = useRef(new Map<string, number>());
  const subjects: Subject[] = academicSubjects;
  const persist = <T,>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value));
  useEffect(() => {
    if (!configured) return;
    setMaterials([]);
    setNotes([]);
    setQuizzes([]);
    setMaterialsLoading(false);
    setNotesLoading(false);
    setQuizzesLoading(false);
    setAcademicLoading(false);
    setAcademicSubjects([]);
    setCompletedTopicIds([]);
    if (!user) return;
    let mounted = true;
    setMaterialsLoading(true);
    setNotesLoading(true);
    listMaterials().then((items) => { if (mounted) { setMaterials(items); setMaterialsError(null); } })
      .catch((error: unknown) => { if (mounted) setMaterialsError(error instanceof Error ? error.message : 'Could not load materials.'); })
      .finally(() => { if (mounted) setMaterialsLoading(false); });
    listNotes().then((items) => { if (mounted) { setNotes(items); setNotesError(null); } })
      .catch((error: unknown) => { if (mounted) setNotesError(error instanceof Error ? error.message : 'Could not load notes.'); })
      .finally(() => { if (mounted) setNotesLoading(false); });
    setQuizzesLoading(true);
    listQuizzes().then((items) => { if (mounted) { setQuizzes(items); setQuizzesError(null); } })
      .catch((error: unknown) => { if (mounted) setQuizzesError(error instanceof Error ? error.message : 'Could not load quizzes.'); })
      .finally(() => { if (mounted) setQuizzesLoading(false); });
    setAcademicLoading(true);
    loadAcademicStructure().then((result) => {
      if (mounted) {
        setCompletedTopicIds(result.completedTopicIds);
        setAcademicSubjects(withCompletion(result.subjects, result.completedTopicIds));
        setAcademicError(null);
      }
    }).catch((error: unknown) => { if (mounted) setAcademicError(error instanceof Error ? error.message : 'Could not load academic courses.'); })
      .finally(() => { if (mounted) setAcademicLoading(false); });
    return () => {
      mounted = false;
      noteSaveTimers.current.forEach((timer) => window.clearTimeout(timer));
      noteSaveTimers.current.clear();
    };
  }, [configured, user?.id]);
  const value = useMemo<CampusContextValue>(() => ({
    materials, notes, quizzes, subjects, academicSubjects, completedTopicIds, academicLoading, academicError, materialsLoading, materialsError, notesLoading, notesSaving, notesError, quizzesLoading, quizzesError,
    addMaterial: async (file, subject) => {
      try {
        const item = configured
          ? await uploadMaterial(file, subject)
          : { id: crypto.randomUUID(), title: file.name.replace(/\.[^.]+$/, ''), subject, kind: 'Lecture notes' as const, author: 'Arjun Sharma', date: 'Just now', size: `${Math.max(1, Math.round(file.size / 1024))} KB`, color: 'blue', bookmarked: false, pages: 1, description: 'Your uploaded study material.' };
        setMaterials((previous) => { const next = [item, ...previous]; if (demoMode) persist('cm-materials', next); return next; });
        setMaterialsError(null);
        return { error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'The material could not be uploaded.';
        setMaterialsError(message);
        return { error: message };
      }
    },
    toggleBookmark: async (id) => {
      try {
        const current = materials.find((item) => item.id === id);
        if (!current) return { error: 'This material is no longer available.' };
        if (configured) await setMaterialBookmark(id, !current.bookmarked);
        setMaterials((previous) => { const next = previous.map((item) => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item); if (demoMode) persist('cm-materials', next); return next; });
        return { error: null };
      } catch (error) { return { error: error instanceof Error ? error.message : 'Bookmark could not be updated.' }; }
    },
    addNote: async (note) => {
      try {
        const savedNote = configured ? await createNote(note) : note;
        setNotes((previous) => { const next = [savedNote, ...previous]; if (demoMode) persist('cm-notes', next); return next; });
        setNotesError(null);
        return { note: savedNote, error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'The note could not be created.';
        setNotesError(message);
        return { note: null, error: message };
      }
    },
    updateNote: (note) => {
      setNotes((previous) => { const next = previous.map((item) => item.id === note.id ? note : item); if (demoMode) persist('cm-notes', next); return next; });
      if (configured) {
        const priorTimer = noteSaveTimers.current.get(note.id);
        if (priorTimer) window.clearTimeout(priorTimer);
        setNotesSaving(true);
        const timer = window.setTimeout(() => {
          noteSaveTimers.current.delete(note.id);
          void saveRemoteNote(note).then(() => setNotesError(null)).catch((error: unknown) => setNotesError(error instanceof Error ? error.message : 'Could not save this note.')).finally(() => setNotesSaving(noteSaveTimers.current.size > 0));
        }, 650);
        noteSaveTimers.current.set(note.id, timer);
      }
    },
    completeQuiz: async (id, answers, localScore) => {
      try {
        const score = configured ? await submitQuizAttempt(id, answers) : localScore;
        setQuizzes((previous) => { const next = previous.map((item) => item.id === id ? { ...item, lastScore: score, attempts: item.attempts + 1 } : item); if (demoMode) persist('cm-quizzes', next); return next; });
        setQuizzesError(null);
        return { score, error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not save this quiz attempt.';
        setQuizzesError(message);
        return { score: null, error: message };
      }
    },
    toggleTopicCompletion: async (topicId, completed) => {
      try {
        if (configured) await setTopicCompleted(topicId, completed);
        const next = completed ? [...new Set([...completedTopicIds, topicId])] : completedTopicIds.filter((id) => id !== topicId);
        setCompletedTopicIds(next);
        setAcademicSubjects((current) => withCompletion(current, next));
        if (demoMode) persist('cm-topic-progress', next);
        return { error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not update topic progress.';
        setAcademicError(message);
        return { error: message };
      }
    },
  }), [materials, materialsLoading, materialsError, notes, notesLoading, notesSaving, notesError, quizzes, quizzesLoading, quizzesError, subjects, academicSubjects, completedTopicIds, academicLoading, academicError, configured, demoMode]);
  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}
export function useCampusData() {
  const value = useContext(CampusContext);
  if (!value) throw new Error('useCampusData must be used inside AppProviders');
  return value;
}
