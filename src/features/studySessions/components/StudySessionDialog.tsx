import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Check, Clock3, Pause, Play, X } from 'lucide-react';
import type { StudySession, Subject } from '../../../shared/types/common';
import { formatDuration } from '../utils/studyStats';

type StudySessionDialogProps = {
  subjects: Subject[];
  onClose: () => void;
  onSave: (session: Omit<StudySession, 'id'>) => Promise<{ error: string | null }>;
};

const focusGoals = [25, 45, 60];

function clockLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function StudySessionDialog({ subjects, onClose, onSave }: StudySessionDialogProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [goalMinutes, setGoalMinutes] = useState(25);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedDuration, setSavedDuration] = useState<number | null>(null);
  const segmentStartedAt = useRef<number | null>(null);
  const accumulatedSeconds = useRef(0);
  const subject = subjects.find((item) => item.id === subjectId);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      if (segmentStartedAt.current === null) return;
      setElapsedSeconds(accumulatedSeconds.current + Math.floor((Date.now() - segmentStartedAt.current) / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, [running]);

  function closeIfConfirmed() {
    if (startedAt !== null && savedDuration === null && !window.confirm('Discard this unsaved study session?')) return;
    onClose();
  }

  function handleBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) closeIfConfirmed();
  }

  function startOrResume() {
    const now = Date.now();
    if (startedAt === null) {
      setStartedAt(now);
      accumulatedSeconds.current = 0;
      setElapsedSeconds(0);
    }
    segmentStartedAt.current = now;
    setError('');
    setRunning(true);
  }

  function pause() {
    if (segmentStartedAt.current !== null) {
      accumulatedSeconds.current += Math.floor((Date.now() - segmentStartedAt.current) / 1000);
      segmentStartedAt.current = null;
      setElapsedSeconds(accumulatedSeconds.current);
    }
    setRunning(false);
  }

  async function finish() {
    if (startedAt === null) return;
    const finalSeconds = running && segmentStartedAt.current !== null
      ? accumulatedSeconds.current + Math.floor((Date.now() - segmentStartedAt.current) / 1000)
      : elapsedSeconds;
    if (finalSeconds < 1) {
      setError('Study for at least a few seconds before saving your session.');
      return;
    }

    setRunning(false);
    segmentStartedAt.current = null;
    accumulatedSeconds.current = finalSeconds;
    setElapsedSeconds(finalSeconds);
    setSaving(true);
    setError('');
    const result = await onSave({
      subjectId: subjectId || null,
      subject: subject?.name ?? 'General study',
      durationSeconds: finalSeconds,
      startedAt: new Date(startedAt).toISOString(),
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setStartedAt(null);
    setSavedDuration(finalSeconds);
  }

  const goalReached = elapsedSeconds >= goalMinutes * 60;

  return <div className="overlay-backdrop study-session-backdrop" onMouseDown={handleBackdrop}>
    <section className="dialog study-session-dialog" role="dialog" aria-modal="true" aria-labelledby="study-session-title">
      <button className="dialog-close" onClick={closeIfConfirmed} aria-label="Close study session"><X size={18} /></button>
      {savedDuration !== null ? <div className="study-session-success">
        <span className="study-session-success-icon"><Check size={22} /></span>
        <span className="eyebrow">SESSION SAVED</span>
        <h2 id="study-session-title">Nice work.</h2>
        <p>You studied {formatDuration(savedDuration)}{subject ? ` on ${subject.name}` : ''}. Your progress is updated.</p>
        <button className="button button-primary" onClick={onClose}>Done</button>
      </div> : <>
        <span className="eyebrow">MAKE A LITTLE PROGRESS</span>
        <h2 id="study-session-title">Study session</h2>
        <p>Choose a course and focus for a while. Your actual study time is saved when you finish.</p>
        {startedAt === null && <>
          <label className="study-session-subject">Subject
            <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
              <option value="">General study</option>
              {subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div className="focus-goal-picker" aria-label="Focus goal">
            <span>Focus goal</span>
            <div>{focusGoals.map((minutes) => <button key={minutes} type="button" className={goalMinutes === minutes ? 'selected' : ''} aria-pressed={goalMinutes === minutes} onClick={() => setGoalMinutes(minutes)}>{minutes} min</button>)}</div>
          </div>
        </>}
        <div className={`study-timer ${goalReached ? 'goal-reached' : ''}`}>
          <span className="study-timer-icon"><Clock3 size={18} /></span>
          <strong aria-live="off">{clockLabel(elapsedSeconds)}</strong>
          <span>{goalReached ? 'Focus goal reached · keep going or finish' : `${goalMinutes} minute focus goal`}</span>
        </div>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <div className="study-session-actions">
          {running ? <button className="button" onClick={pause}><Pause size={15} /> Pause</button> : <button className="button button-primary" onClick={startOrResume}><Play size={15} fill="currentColor" />{startedAt === null ? 'Start session' : 'Resume session'}</button>}
          {startedAt !== null && <button className="button" onClick={() => void finish()} disabled={saving || elapsedSeconds < 1}>{saving ? 'Saving…' : 'Finish and save'}</button>}
        </div>
      </>}
    </section>
  </div>;
}
