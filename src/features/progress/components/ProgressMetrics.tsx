import { Clock3, Flame, Target, TrendingUp } from 'lucide-react';
import { formatDuration } from '../../studySessions/utils/studyStats';

type ProgressMetricsProps = {
  loading: boolean;
  thisWeekSeconds: number;
  studyChange: string;
  currentStreak: number;
  bestStreak: number;
  averageScore: number;
  totalAttempts: number;
  goalPercent: number;
  goalHours: number;
};

export function ProgressMetrics({
  loading,
  thisWeekSeconds,
  studyChange,
  currentStreak,
  bestStreak,
  averageScore,
  totalAttempts,
  goalPercent,
  goalHours,
}: ProgressMetricsProps) {
  return (
    <div className="metric-grid">
      <div className="metric-card">
        <span className="metric-icon mint"><Clock3 size={18} /></span>
        <span className="eyebrow">STUDY TIME</span>
        <strong>{loading ? 'Loading…' : formatDuration(thisWeekSeconds)}</strong>
        <small><TrendingUp size={13} /> {studyChange}</small>
      </div>

      <div className="metric-card">
        <span className="metric-icon peach"><Flame size={18} /></span>
        <span className="eyebrow">CURRENT STREAK</span>
        <strong>{loading ? 'Loading…' : `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`}</strong>
        <small>Best streak: {loading ? '—' : `${bestStreak} ${bestStreak === 1 ? 'day' : 'days'}`}</small>
      </div>

      <div className="metric-card">
        <span className="metric-icon lavender"><Target size={18} /></span>
        <span className="eyebrow">QUIZ AVERAGE</span>
        <strong>{averageScore}%</strong>
        <small>{totalAttempts} practice {totalAttempts === 1 ? 'attempt' : 'attempts'}</small>
      </div>

      <div className="metric-card">
        <span className="metric-icon blue"><TrendingUp size={18} /></span>
        <span className="eyebrow">WEEKLY GOAL</span>
        <strong>{loading ? 'Loading…' : `${goalPercent}%`}</strong>
        <small>{formatDuration(thisWeekSeconds)} of {goalHours} hours</small>
      </div>
    </div>
  );
}
