import { ProgressBar } from '../../../shared/components/ui/ProgressBar';
import { formatDuration } from '../../studySessions/utils/studyStats';

type WeeklyStudySummaryProps = {
  loading: boolean;
  activeDays: number;
  days: { key: string; label: string; seconds: number; isToday: boolean }[];
  thisWeekSeconds: number;
  goalHours: number;
  goalPercent: number;
};

export function WeeklyStudySummary({
  loading,
  activeDays,
  days,
  thisWeekSeconds,
  goalHours,
  goalPercent,
}: WeeklyStudySummaryProps) {
  return (
    <aside className="progress-side-card">
      <span className="eyebrow">YOUR WEEK</span>
      <h3>{loading ? 'Loading your week…' : activeDays ? 'Steady beats perfect.' : 'Start with one session.'}</h3>
      <p>
        {loading
          ? 'Your saved study sessions will appear here.'
          : activeDays
          ? `You’ve tracked study time on ${activeDays} ${activeDays === 1 ? 'day' : 'days'} this week.`
          : 'Start a study session from your overview page. Your time will appear here as you go.'}
      </p>

      <div className="weekly-days">
        {days.map((day) => (
          <div className={`weekly-day ${day.seconds > 0 ? 'studied' : ''} ${day.isToday ? 'current' : ''}`} key={day.key}>
            <span>{day.label.slice(0, 1)}</span>
            <i>{day.seconds > 0 ? '✓' : ''}</i>
          </div>
        ))}
      </div>

      <div className="goal-foot">
        <span>Weekly study goal</span>
        <strong>{formatDuration(thisWeekSeconds)} / {goalHours} hrs</strong>
      </div>
      <ProgressBar value={goalPercent} />
    </aside>
  );
}
