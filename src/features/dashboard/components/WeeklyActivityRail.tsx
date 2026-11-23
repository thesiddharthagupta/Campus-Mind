import { ArrowRight, ArrowUpRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDuration } from '../../studySessions/utils/studyStats';
import type { Note } from '../../../shared/types/common';

type WeeklyActivityRailProps = {
  loading: boolean;
  error: string | null;
  thisWeekSeconds: number;
  chartMaxHours: number;
  days: { key: string; label: string; seconds: number; isToday: boolean }[];
  notes: Note[];
  completedQuizzes: number;
};

export function WeeklyActivityRail({
  loading,
  error,
  thisWeekSeconds,
  chartMaxHours,
  days,
  notes,
  completedQuizzes,
}: WeeklyActivityRailProps) {
  return (
    <aside className="right-rail">
      <section className="week-card">
        <div className="rail-heading">
          <div>
            <span className="eyebrow">WEEKLY ACTIVITY</span>
            <h3>Your study rhythm</h3>
          </div>
        </div>

        {error && <div className="inline-error" role="alert">{error}</div>}

        <div className="week-chart">
          <div className="chart-y">
            <span>{chartMaxHours}h</span>
            <span>{Math.ceil((chartMaxHours * 2) / 3)}h</span>
            <span>{Math.ceil(chartMaxHours / 3)}h</span>
            <span>0</span>
          </div>
          <div className="chart-bars">
            {days.map((day) => (
              <div className={`chart-day ${day.isToday ? 'today' : ''}`} key={day.key}>
                <div className="chart-bar-wrap">
                  <span
                    className="chart-bar"
                    title={`${day.label}: ${formatDuration(day.seconds)}`}
                    style={{ height: `${Math.min(100, (day.seconds / (chartMaxHours * 3600)) * 100)}%` }}
                  />
                </div>
                <small>{day.label.slice(0, 1)}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-legend">
          <span><i /> {loading ? 'Loading study time…' : 'Tracked study time'}</span>
          <strong>{formatDuration(thisWeekSeconds)} <small>this week</small></strong>
        </div>
      </section>

      <section className="quick-card">
        <div className="quick-icon"><CalendarDays size={18} /></div>
        <div>
          <strong>Make a little time</strong>
          <p>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} and practice on {completedQuizzes} {completedQuizzes === 1 ? 'quiz' : 'quizzes'} are ready when you are.
          </p>
          <Link to="/notes">Open your notes <ArrowUpRight size={14} /></Link>
        </div>
      </section>

      <section className="notes-peek">
        <div className="rail-heading">
          <div>
            <span className="eyebrow">RECENT NOTES</span>
            <h3>Keep your thoughts close</h3>
          </div>
          <Link to="/notes" aria-label="View all notes"><ArrowUpRight size={17} /></Link>
        </div>
        {notes.slice(0, 2).map((note) => (
          <Link className="note-peek-row" to="/notes" key={note.id}>
            <span className={`note-dot ${note.color}`} />
            <span>
              <strong>{note.title}</strong>
              <small>{note.subject}</small>
            </span>
            <ArrowRight size={14} />
          </Link>
        ))}
      </section>
    </aside>
  );
}
