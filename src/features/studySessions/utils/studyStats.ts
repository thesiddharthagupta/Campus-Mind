import type { StudySession } from '../../../shared/types/common';

export const WEEKLY_STUDY_GOAL_SECONDS = 11 * 60 * 60;

export type StudyDay = {
  date: Date;
  key: string;
  label: string;
  seconds: number;
  isToday: boolean;
};

export type StudyStats = {
  days: StudyDay[];
  thisWeekSeconds: number;
  previousWeekSeconds: number;
  activeDays: number;
  currentStreak: number;
  bestStreak: number;
  goalPercent: number;
  chartMaxHours: number;
};

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayStart(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function weekStart(date: Date) {
  const result = dayStart(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((dayStart(a).getTime() - dayStart(b).getTime()) / 86400000);
}

function getBestStreak(sessions: StudySession[]) {
  const keys = [...new Set(sessions.map((session) => dateKey(new Date(session.startedAt))))].sort();
  let best = 0;
  let current = 0;
  let previous: Date | null = null;
  for (const key of keys) {
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    current = previous && daysBetween(date, previous) === 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = date;
  }
  return best;
}

export function getStudyStats(sessions: StudySession[], now = new Date()): StudyStats {
  const currentWeekStart = weekStart(now);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const nextWeekStart = new Date(currentWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const daySeconds = new Map<string, number>();
  let thisWeekSeconds = 0;
  let previousWeekSeconds = 0;

  for (const session of sessions) {
    const date = new Date(session.startedAt);
    const key = dateKey(date);
    daySeconds.set(key, (daySeconds.get(key) ?? 0) + session.durationSeconds);
    if (date >= currentWeekStart && date < nextWeekStart) {
      thisWeekSeconds += session.durationSeconds;
    } else if (date >= previousWeekStart && date < currentWeekStart) {
      previousWeekSeconds += session.durationSeconds;
    }
  }

  const todayKey = dateKey(now);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);
    const key = dateKey(date);
    return {
      date,
      key,
      label: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
      seconds: daySeconds.get(key) ?? 0,
      isToday: key === todayKey,
    };
  });

  let cursor = dayStart(now);
  if (!daySeconds.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let currentStreak = 0;
  while (daySeconds.has(dateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const maxHours = Math.max(0, ...days.map((day) => day.seconds / 3600));
  return {
    days,
    thisWeekSeconds,
    previousWeekSeconds,
    activeDays: days.filter((day) => day.seconds > 0).length,
    currentStreak,
    bestStreak: getBestStreak(sessions),
    goalPercent: Math.min(100, Math.round(thisWeekSeconds / WEEKLY_STUDY_GOAL_SECONDS * 100)),
    chartMaxHours: Math.max(3, Math.ceil(maxHours / 3) * 3),
  };
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  if (totalSeconds > 0 && minutes === 0) return 'Less than 1m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

export function formatStudyChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 'No sessions yet' : 'First tracked week';
  const change = Math.round((current - previous) / previous * 100);
  if (change === 0) return 'Same as last week';
  return `${change > 0 ? '+' : ''}${change}% vs last week`;
}
