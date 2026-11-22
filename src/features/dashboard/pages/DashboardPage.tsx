import { useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Clock3, Flame, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../../app/providers';
import { useAuth } from '../../auth/hooks/useAuth';
import { StudySessionDialog } from '../../studySessions/components/StudySessionDialog';
import { formatDuration, getStudyStats } from '../../studySessions/utils/studyStats';
import { SubjectCard } from '../components/SubjectCard';
import { ActivityCard } from '../components/ActivityCard';

export function DashboardPage() {
  const { subjects, notes, materials, quizzes, studySessions, studySessionsError, studySessionsLoading, addStudySession } = useCampusData();
  const { user } = useAuth();
  const [sessionOpen, setSessionOpen] = useState(false);
  const completedQuizzes = quizzes.filter((quiz) => quiz.attempts > 0).length;
  const displayName = (user?.user_metadata?.display_name as string | undefined)
    || user?.email?.split('@')[0]
    || 'Student';
  const firstName = displayName.trim().split(/\s+/)[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase();
  const stats = getStudyStats(studySessions);
  const focusMessage = stats.thisWeekSeconds > 0
    ? `You’ve studied on ${stats.activeDays} ${stats.activeDays === 1 ? 'day' : 'days'} this week. Keep your rhythm going.`
    : 'Start a focused session and your study time will appear here.';

  return <div className="dashboard-page">
    <div className="welcome-row">
      <div>
        <div className="eyebrow"><span className="eyebrow-dot" /> {today}</div>
        <h1>{greeting}, {firstName} <span className="wave">✳</span></h1>
        <p className="page-subtitle">A new day to make progress. Here’s your learning at a glance.</p>
      </div>
      <button className="button button-primary" onClick={() => setSessionOpen(true)}><Clock3 size={17} /> Start a study session</button>
    </div>

    <section className="focus-banner">
      <div className="focus-shape shape-one" />
      <div className="focus-shape shape-two" />
      <div className="focus-copy">
        <span className="focus-kicker"><Sparkles size={14} /> YOUR WEEKLY FOCUS</span>
        <h2>{stats.currentStreak ? 'You’re finding your rhythm.' : 'Make time for one small step.'}</h2>
        <p>{focusMessage}</p>
        <Link to="/progress">See your progress <ArrowRight size={15} /></Link>
      </div>
      <div className="focus-stats" aria-label="This week’s study statistics">
        <div className="focus-stat"><span className="stat-icon"><Flame size={16} /></span><div><strong>{stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}</strong><small>Current streak</small></div></div>
        <div className="focus-stat"><span className="stat-icon"><Clock3 size={16} /></span><div><strong>{formatDuration(stats.thisWeekSeconds)}</strong><small>Study time this week</small></div></div>
        <div className="focus-stat"><span className="stat-icon"><Target size={16} /></span><div><strong>{stats.goalPercent}%</strong><small>Weekly goal reached</small></div></div>
      </div>
      <div className="focus-ring" aria-label={`${stats.currentStreak} day current streak`}><span>{stats.currentStreak}<small>DAY STREAK</small></span></div>
    </section>

    <div className="section-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Your subjects</h2></div><Link className="text-link" to="/academic">All subjects <ArrowRight size={15} /></Link></div>
    <section className="subject-grid">{subjects.map((subject) => <SubjectCard subject={subject} key={subject.id} />)}</section>

    <div className="dashboard-lower">
      <section className="recent-panel">
        <div className="section-heading compact"><div><span className="eyebrow">YOUR STUDY SPACE</span><h2>Recently opened</h2></div><Link className="text-link" to="/materials">View library <ArrowRight size={15} /></Link></div>
        <div className="recent-list">{materials.slice(0, 3).map((item) => <ActivityCard key={item.id} material={item} />)}</div>
      </section>
      <aside className="right-rail">
        <section className="week-card">
          <div className="rail-heading"><div><span className="eyebrow">WEEKLY ACTIVITY</span><h3>Your study rhythm</h3></div></div>
          {studySessionsError && <div className="inline-error" role="alert">{studySessionsError}</div>}
          <div className="week-chart"><div className="chart-y"><span>{stats.chartMaxHours}h</span><span>{Math.ceil(stats.chartMaxHours * 2 / 3)}h</span><span>{Math.ceil(stats.chartMaxHours / 3)}h</span><span>0</span></div><div className="chart-bars">{stats.days.map((day) => <div className={`chart-day ${day.isToday ? 'today' : ''}`} key={day.key}><div className="chart-bar-wrap"><span className="chart-bar" title={`${day.label}: ${formatDuration(day.seconds)}`} style={{ height: `${Math.min(100, day.seconds / (stats.chartMaxHours * 3600) * 100)}%` }} /></div><small>{day.label.slice(0, 1)}</small></div>)}</div></div>
          <div className="chart-legend"><span><i /> {studySessionsLoading ? 'Loading study time…' : 'Tracked study time'}</span><strong>{formatDuration(stats.thisWeekSeconds)} <small>this week</small></strong></div>
        </section>
        <section className="quick-card"><div className="quick-icon"><CalendarDays size={18} /></div><div><strong>Make a little time</strong><p>{notes.length} {notes.length === 1 ? 'note' : 'notes'} and practice on {completedQuizzes} {completedQuizzes === 1 ? 'quiz' : 'quizzes'} are ready when you are.</p><Link to="/notes">Open your notes <ArrowUpRight size={14} /></Link></div></section>
        <section className="notes-peek"><div className="rail-heading"><div><span className="eyebrow">RECENT NOTES</span><h3>Keep your thoughts close</h3></div><Link to="/notes" aria-label="View all notes"><ArrowUpRight size={17} /></Link></div>{notes.slice(0, 2).map((note) => <Link className="note-peek-row" to="/notes" key={note.id}><span className={`note-dot ${note.color}`} /><span><strong>{note.title}</strong><small>{note.subject}</small></span><ArrowRight size={14} /></Link>)}</section>
      </aside>
    </div>
    <div className="dashboard-footer"><span><BookOpen size={14} /> CampusMind · Your academic workspace</span><span>Small steps, steady progress.</span></div>
    {sessionOpen && <StudySessionDialog subjects={subjects} onClose={() => setSessionOpen(false)} onSave={addStudySession} />}
  </div>;
}
