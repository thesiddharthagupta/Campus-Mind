import { ArrowRight, Flame, Clock3, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDuration } from '../../studySessions/utils/studyStats';

type FocusBannerProps = {
  currentStreak: number;
  thisWeekSeconds: number;
  goalPercent: number;
  activeDays: number;
};

export function FocusBanner({ currentStreak, thisWeekSeconds, goalPercent, activeDays }: FocusBannerProps) {
  const focusMessage = thisWeekSeconds > 0
    ? `You’ve studied on ${activeDays} ${activeDays === 1 ? 'day' : 'days'} this week. Keep your rhythm going.`
    : 'Start a focused session and your study time will appear here.';

  return (
    <section className="focus-banner">
      <div className="focus-shape shape-one" />
      <div className="focus-shape shape-two" />
      <div className="focus-copy">
        <span className="focus-kicker"><Sparkles size={14} /> YOUR WEEKLY FOCUS</span>
        <h2>{currentStreak ? 'You’re finding your rhythm.' : 'Make time for one small step.'}</h2>
        <p>{focusMessage}</p>
        <Link to="/progress">See your progress <ArrowRight size={15} /></Link>
      </div>

      <div className="focus-stats" aria-label="This week’s study statistics">
        <div className="focus-stat">
          <span className="stat-icon"><Flame size={16} /></span>
          <div>
            <strong>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</strong>
            <small>Current streak</small>
          </div>
        </div>
        <div className="focus-stat">
          <span className="stat-icon"><Clock3 size={16} /></span>
          <div>
            <strong>{formatDuration(thisWeekSeconds)}</strong>
            <small>Study time this week</small>
          </div>
        </div>
        <div className="focus-stat">
          <span className="stat-icon"><Target size={16} /></span>
          <div>
            <strong>{goalPercent}%</strong>
            <small>Weekly goal reached</small>
          </div>
        </div>
      </div>

      <div className="focus-ring" aria-label={`${currentStreak} day current streak`}>
        <span>{currentStreak}<small>DAY STREAK</small></span>
      </div>
    </section>
  );
}
