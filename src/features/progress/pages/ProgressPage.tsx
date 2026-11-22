import { ArrowUpRight, Clock3, Flame, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../../app/providers';
import { ProgressBar } from '../../../shared/components/ui/ProgressBar';
import { formatDuration, formatStudyChange, getStudyStats, WEEKLY_STUDY_GOAL_SECONDS } from '../../studySessions/utils/studyStats';

export function ProgressPage() {
  const { subjects, academicSubjects, quizzes, studySessions, studySessionsError, studySessionsLoading } = useCampusData();
  const attempts = quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0);
  const scoredQuizzes = quizzes.filter((quiz) => quiz.lastScore !== undefined);
  const averageScore = scoredQuizzes.length
    ? Math.round(scoredQuizzes.reduce((sum, quiz) => sum + (quiz.lastScore ?? 0), 0) / scoredQuizzes.length)
    : 0;
  const stats = getStudyStats(studySessions);
  const studyChange = formatStudyChange(stats.thisWeekSeconds, stats.previousWeekSeconds);
  const goalHours = WEEKLY_STUDY_GOAL_SECONDS / 3600;

  return <div className="feature-page">
    <div className="feature-header"><div><span className="eyebrow">NOTICE HOW FAR YOU’VE COME</span><h1>Your progress</h1><p className="page-subtitle">A clear picture of your learning, one study session at a time.</p></div><span className="semester-pill"><Clock3 size={14} /> This week</span></div>
    {studySessionsError && <div className="inline-error" role="alert">{studySessionsError}</div>}
    <div className="metric-grid">
      <div className="metric-card"><span className="metric-icon mint"><Clock3 size={18} /></span><span className="eyebrow">STUDY TIME</span><strong>{studySessionsLoading ? 'Loading…' : formatDuration(stats.thisWeekSeconds)}</strong><small><TrendingUp size={13} /> {studyChange}</small></div>
      <div className="metric-card"><span className="metric-icon peach"><Flame size={18} /></span><span className="eyebrow">CURRENT STREAK</span><strong>{studySessionsLoading ? 'Loading…' : `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`}</strong><small>Best streak: {studySessionsLoading ? '—' : `${stats.bestStreak} ${stats.bestStreak === 1 ? 'day' : 'days'}`}</small></div>
      <div className="metric-card"><span className="metric-icon lavender"><Target size={18} /></span><span className="eyebrow">QUIZ AVERAGE</span><strong>{averageScore}%</strong><small>{attempts} practice {attempts === 1 ? 'attempt' : 'attempts'}</small></div>
      <div className="metric-card"><span className="metric-icon blue"><TrendingUp size={18} /></span><span className="eyebrow">WEEKLY GOAL</span><strong>{studySessionsLoading ? 'Loading…' : `${stats.goalPercent}%`}</strong><small>{formatDuration(stats.thisWeekSeconds)} of {goalHours} hours</small></div>
    </div>
    <div className="progress-layout">
      <section className="progress-section-card">
        <div className="section-heading compact"><div><span className="eyebrow">{academicSubjects[0]?.semester.toUpperCase() ?? 'YOUR COURSES'}</span><h2>Subject progress</h2></div><Link className="text-link" to="/academic">View syllabus <ArrowUpRight size={15} /></Link></div>
        <div className="progress-subject-list">{subjects.map((subject) => <div className="progress-subject" key={subject.id}><span className={`mini-subject-icon ${subject.tint}`}>{subject.code.split(' ')[1]}</span><div className="progress-subject-main"><div><strong>{subject.name}</strong><span>{subject.progress}%</span></div><ProgressBar value={subject.progress} /><small>{Math.round(subject.modules * subject.progress / 100)} of {subject.modules} modules completed</small></div></div>)}</div>
      </section>
      <aside className="progress-side-card"><span className="eyebrow">YOUR WEEK</span><h3>{studySessionsLoading ? 'Loading your week…' : stats.activeDays ? 'Steady beats perfect.' : 'Start with one session.'}</h3><p>{studySessionsLoading ? 'Your saved study sessions will appear here.' : stats.activeDays ? `You’ve tracked study time on ${stats.activeDays} ${stats.activeDays === 1 ? 'day' : 'days'} this week.` : 'Start a study session from your overview page. Your time will appear here as you go.'}</p><div className="weekly-days">{stats.days.map((day) => <div className={`weekly-day ${day.seconds > 0 ? 'studied' : ''} ${day.isToday ? 'current' : ''}`} key={day.key}><span>{day.label.slice(0, 1)}</span><i>{day.seconds > 0 ? '✓' : ''}</i></div>)}</div><div className="goal-foot"><span>Weekly study goal</span><strong>{formatDuration(stats.thisWeekSeconds)} / {goalHours} hrs</strong></div><ProgressBar value={stats.goalPercent} /></aside>
    </div>
  </div>;
}
