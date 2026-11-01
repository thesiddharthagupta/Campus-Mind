import { ArrowRight, ArrowUpRight, BookOpen, Brain, CalendarDays, Clock3, Flame, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../../app/providers';
import { useAuth } from '../../auth/hooks/useAuth';
import { SubjectCard } from '../components/SubjectCard';
import { ActivityCard } from '../components/ActivityCard';

const sampleActivity = [
  ['M', 68], ['T', 42], ['W', 86], ['T', 57], ['F', 28], ['S', 8], ['S', 0],
] as const;

export function DashboardPage() {
  const { subjects, notes, materials, quizzes } = useCampusData();
  const { demoMode, user } = useAuth();
  const completedQuizzes = quizzes.filter((quiz) => quiz.attempts > 0).length;
  const displayName = (user?.user_metadata?.display_name as string | undefined)
    || user?.email?.split('@')[0]
    || 'Arjun Sharma';
  const firstName = displayName.trim().split(/\s+/)[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase();
  const activityLabel = demoMode ? 'DEMO WEEKLY SNAPSHOT' : 'SAMPLE WEEKLY SNAPSHOT';

  return <div className="dashboard-page">
    <div className="welcome-row">
      <div>
        <div className="eyebrow"><span className="eyebrow-dot" /> {today}</div>
        <h1>{greeting}, {firstName} <span className="wave">✳</span></h1>
        <p className="page-subtitle">A new day to make progress. Here’s your learning at a glance.</p>
      </div>
      <Link className="button button-primary" to="/practice"><Brain size={17} /> Start a quiz</Link>
    </div>

    <section className="focus-banner">
      <div className="focus-shape shape-one" />
      <div className="focus-shape shape-two" />
      <div className="focus-copy">
        <span className="focus-kicker"><Sparkles size={14} /> {activityLabel}</span>
        <h2>You’re finding your rhythm.</h2>
        <p>This is an example of the weekly study summary CampusMind will show.</p>
        <Link to="/progress">See your progress <ArrowRight size={15} /></Link>
      </div>
      <div className="focus-stats" aria-label="Example weekly study statistics">
        <div className="focus-stat"><span className="stat-icon"><Flame size={16} /></span><div><strong>4 days</strong><small>Example streak</small></div></div>
        <div className="focus-stat"><span className="stat-icon"><Clock3 size={16} /></span><div><strong>8.5 hrs</strong><small>Example study time</small></div></div>
        <div className="focus-stat"><span className="stat-icon"><Target size={16} /></span><div><strong>76%</strong><small>Example weekly goal</small></div></div>
      </div>
      <div className="focus-ring" aria-label="Example 4 day streak"><span>4<small>DAY STREAK</small></span></div>
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
          <div className="rail-heading"><div><span className="eyebrow">{activityLabel}</span><h3>Your study rhythm</h3></div></div>
          <div className="week-chart"><div className="chart-y"><span>3h</span><span>2h</span><span>1h</span><span>0</span></div><div className="chart-bars">{sampleActivity.map(([day, height], index) => <div className="chart-day" key={`${day}-${index}`}><div className="chart-bar-wrap"><span className="chart-bar" style={{ height: `${height}%` }} /></div><small>{day}</small></div>)}</div></div>
          <div className="chart-legend"><span><i /> Example study time</span><strong>8h 30m <small>sample total</small></strong></div>
        </section>
        <section className="quick-card"><div className="quick-icon"><CalendarDays size={18} /></div><div><strong>Make a little time</strong><p>You have notes and have practiced on {completedQuizzes} {completedQuizzes === 1 ? 'quiz' : 'quizzes'}.</p><Link to="/notes">Open your notes <ArrowUpRight size={14} /></Link></div></section>
        <section className="notes-peek"><div className="rail-heading"><div><span className="eyebrow">RECENT NOTES</span><h3>Keep your thoughts close</h3></div><Link to="/notes" aria-label="View all notes"><ArrowUpRight size={17} /></Link></div>{notes.slice(0, 2).map((note) => <Link className="note-peek-row" to="/notes" key={note.id}><span className={`note-dot ${note.color}`} /><span><strong>{note.title}</strong><small>{note.subject}</small></span><ArrowRight size={14} /></Link>)}</section>
      </aside>
    </div>
    <div className="dashboard-footer"><span><BookOpen size={14} /> CampusMind · Your academic workspace</span><span>Small steps, steady progress.</span></div>
  </div>;
}
