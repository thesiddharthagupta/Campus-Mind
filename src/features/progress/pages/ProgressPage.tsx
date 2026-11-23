import { Clock3 } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import { formatStudyChange, getStudyStats, WEEKLY_STUDY_GOAL_SECONDS } from '../../studySessions/utils/studyStats';
import { ProgressMetrics } from '../components/ProgressMetrics';
import { SubjectProgressList } from '../components/SubjectProgressList';
import { WeeklyStudySummary } from '../components/WeeklyStudySummary';

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
  const semesterLabel = academicSubjects[0]?.semester.toUpperCase() ?? 'YOUR COURSES';

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div>
          <span className="eyebrow">NOTICE HOW FAR YOU’VE COME</span>
          <h1>Your progress</h1>
          <p className="page-subtitle">A clear picture of your learning, one study session at a time.</p>
        </div>
        <span className="semester-pill">
          <Clock3 size={14} /> This week
        </span>
      </div>

      {studySessionsError && <div className="inline-error" role="alert">{studySessionsError}</div>}

      <ProgressMetrics
        loading={studySessionsLoading}
        thisWeekSeconds={stats.thisWeekSeconds}
        studyChange={studyChange}
        currentStreak={stats.currentStreak}
        bestStreak={stats.bestStreak}
        averageScore={averageScore}
        totalAttempts={attempts}
        goalPercent={stats.goalPercent}
        goalHours={goalHours}
      />

      <div className="progress-layout">
        <SubjectProgressList
          semesterLabel={semesterLabel}
          subjects={subjects}
        />

        <WeeklyStudySummary
          loading={studySessionsLoading}
          activeDays={stats.activeDays}
          days={stats.days}
          thisWeekSeconds={stats.thisWeekSeconds}
          goalHours={goalHours}
          goalPercent={stats.goalPercent}
        />
      </div>
    </div>
  );
}
