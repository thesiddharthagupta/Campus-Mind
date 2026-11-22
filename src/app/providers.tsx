import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Material, Note, Quiz, StudySession, Subject } from '../shared/types/common';
import type { AcademicSubject } from '../features/academic/types/academic.types';
import { AuthProvider } from '../features/auth/components/AuthProvider';
import { useAuth } from '../features/auth/hooks/useAuth';
import { listMaterials, setMaterialBookmark, uploadMaterial } from '../features/materials/services/materialService';
import { createNote, listNotes, saveNote as saveRemoteNote } from '../features/notes/services/notesService';
import { listQuizzes, submitQuizAttempt } from '../features/quizzes/services/quizService';
import { loadAcademicStructure, setTopicCompleted } from '../features/academic/services/academicService';
import { createStudySession, listStudySessions } from '../features/studySessions/services/studySessionService';

type CampusContextValue = {
  materials: Material[];
  notes: Note[];
  notesLoading: boolean;
  notesSaving: boolean;
  notesError: string | null;
  quizzes: Quiz[];
  quizzesLoading: boolean;
  quizzesError: string | null;
  studySessions: StudySession[];
  studySessionsLoading: boolean;
  studySessionsError: string | null;
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
  completeQuiz: (id: string, answers: Record<string, number>) => Promise<{ score: number | null; error: string | null }>;
  addStudySession: (session: Omit<StudySession, 'id'>) => Promise<{ error: string | null }>;
  toggleTopicCompletion: (topicId: string, completed: boolean) => Promise<{ error: string | null }>;
};
const CampusContext = createContext<CampusContextValue | null>(null);
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
  const { configured, user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [studySessionsLoading, setStudySessionsLoading] = useState(false);
  const [studySessionsError, setStudySessionsError] = useState<string | null>(null);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
  const [academicSubjects, setAcademicSubjects] = useState<AcademicSubject[]>([]);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicError, setAcademicError] = useState<string | null>(null);
  const noteSaveTimers = useRef(new Map<string, number>());
  const subjects: Subject[] = academicSubjects;
  useEffect(() => {
    if (!configured) return;
    setMaterials([]);
    setNotes([]);
    setQuizzes([]);
    setStudySessions([]);
    setMaterialsLoading(false);
    setNotesLoading(false);
    setQuizzesLoading(false);
    setStudySessionsLoading(false);
    setAcademicLoading(false);
    setAcademicSubjects([]);
    setStudySessionsError(null);
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
    setStudySessionsLoading(true);
    listStudySessions().then((items) => { if (mounted) { setStudySessions(items); setStudySessionsError(null); } })
      .catch((error: unknown) => { if (mounted) setStudySessionsError(error instanceof Error ? error.message : 'Could not load study sessions.'); })
      .finally(() => { if (mounted) setStudySessionsLoading(false); });
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
    materials, notes, quizzes, subjects, academicSubjects, completedTopicIds, academicLoading, academicError, materialsLoading, materialsError, notesLoading, notesSaving, notesError, quizzesLoading, quizzesError, studySessions, studySessionsLoading, studySessionsError,
    addMaterial: async (file, subject) => {
      try {
        if (!configured) throw new Error('Connect CampusMind to Supabase before uploading materials.');
        const item = await uploadMaterial(file, subject);
        setMaterials((previous) => [item, ...previous]);
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
        if (!configured) throw new Error('Connect CampusMind to Supabase before changing bookmarks.');
        await setMaterialBookmark(id, !current.bookmarked);
        setMaterials((previous) => previous.map((item) => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item));
        return { error: null };
      } catch (error) { return { error: error instanceof Error ? error.message : 'Bookmark could not be updated.' }; }
    },
    addNote: async (note) => {
      try {
        if (!configured) throw new Error('Connect CampusMind to Supabase before creating notes.');
        const savedNote = await createNote(note);
        setNotes((previous) => [savedNote, ...previous]);
        setNotesError(null);
        return { note: savedNote, error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'The note could not be created.';
        setNotesError(message);
        return { note: null, error: message };
      }
    },
    updateNote: (note) => {
      if (!configured) {
        setNotesError('Connect CampusMind to Supabase before editing notes.');
        return;
      }
      setNotes((previous) => previous.map((item) => item.id === note.id ? note : item));
      const priorTimer = noteSaveTimers.current.get(note.id);
      if (priorTimer) window.clearTimeout(priorTimer);
      setNotesSaving(true);
      const timer = window.setTimeout(() => {
        noteSaveTimers.current.delete(note.id);
        void saveRemoteNote(note).then(() => setNotesError(null)).catch((error: unknown) => setNotesError(error instanceof Error ? error.message : 'Could not save this note.')).finally(() => setNotesSaving(noteSaveTimers.current.size > 0));
      }, 650);
      noteSaveTimers.current.set(note.id, timer);
    },
    completeQuiz: async (id, answers) => {
      try {
        const score = await submitQuizAttempt(id, answers);
        setQuizzes((previous) => previous.map((item) => item.id === id ? { ...item, lastScore: score, attempts: item.attempts + 1 } : item));
        setQuizzesError(null);
        return { score, error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not save this quiz attempt.';
        setQuizzesError(message);
        return { score: null, error: message };
      }
    },
    addStudySession: async (session) => {
      try {
        if (!configured) throw new Error('Connect CampusMind to Supabase before saving study sessions.');
        const saved = await createStudySession(session);
        setStudySessions((previous) => {
          const next = [saved, ...previous].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
          return next;
        });
        setStudySessionsError(null);
        return { error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not save this study session.';
        setStudySessionsError(message);
        return { error: message };
      }
    },
    toggleTopicCompletion: async (topicId, completed) => {
      try {
        if (!configured) throw new Error('Connect CampusMind to Supabase before saving topic progress.');
        await setTopicCompleted(topicId, completed);
        const next = completed ? [...new Set([...completedTopicIds, topicId])] : completedTopicIds.filter((id) => id !== topicId);
        setCompletedTopicIds(next);
        setAcademicSubjects((current) => withCompletion(current, next));
        return { error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not update topic progress.';
        setAcademicError(message);
        return { error: message };
      }
    },
  }), [materials, materialsLoading, materialsError, notes, notesLoading, notesSaving, notesError, quizzes, quizzesLoading, quizzesError, studySessions, studySessionsLoading, studySessionsError, subjects, academicSubjects, completedTopicIds, academicLoading, academicError, configured]);
  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}
export function useCampusData() {
  const value = useContext(CampusContext);
  if (!value) throw new Error('useCampusData must be used inside AppProviders');
  return value;
}
