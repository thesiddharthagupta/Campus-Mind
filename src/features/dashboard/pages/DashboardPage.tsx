import { useState } from 'react';
import { ArrowRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../../app/providers';
import { useAuth } from '../../auth/hooks/useAuth';
import { StudySessionDialog } from '../../studySessions/components/StudySessionDialog';
import { getStudyStats } from '../../studySessions/utils/studyStats';
import { SubjectCard } from '../components/SubjectCard';
import { ActivityCard } from '../components/ActivityCard';
import { FocusBanner } from '../components/FocusBanner';
import { WeeklyActivityRail } from '../components/WeeklyActivityRail';

export function DashboardPage() {
  const {
    subjects,
    notes,
    materials,
    quizzes,
    studySessions,
    studySessionsError,
    studySessionsLoading,
    addStudySession,
  } = useCampusData();
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

  return (
    <div className="dashboard-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> {today}</div>
          <h1>{greeting}, {firstName} <span className="wave">✳</span></h1>
          <p className="page-subtitle">A new day to make progress. Here’s your learning at a glance.</p>
        </div>
        <button className="button button-primary" onClick={() => setSessionOpen(true)}>
          <Clock3 size={17} /> Start a study session
        </button>
      </div>

      <FocusBanner
        currentStreak={stats.currentStreak}
        thisWeekSeconds={stats.thisWeekSeconds}
        goalPercent={stats.goalPercent}
        activeDays={stats.activeDays}
      />

      <div className="section-heading">
        <div>
          <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
          <h2>Your subjects</h2>
        </div>
        <Link className="text-link" to="/academic">
          All subjects <ArrowRight size={15} />
        </Link>
      </div>

      <section className="subject-grid">
        {subjects.map((subject) => (
          <SubjectCard subject={subject} key={subject.id} />
        ))}
      </section>

      <div className="dashboard-lower">
        <section className="recent-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">YOUR STUDY SPACE</span>
              <h2>Recently opened</h2>
            </div>
            <Link className="text-link" to="/materials">
              View library <ArrowRight size={15} />
            </Link>
          </div>
          <div className="recent-list">
            {materials.slice(0, 3).map((item) => (
              <ActivityCard key={item.id} material={item} />
            ))}
          </div>
        </section>

        <WeeklyActivityRail
          loading={studySessionsLoading}
          error={studySessionsError}
          thisWeekSeconds={stats.thisWeekSeconds}
          chartMaxHours={stats.chartMaxHours}
          days={stats.days}
          notes={notes}
          completedQuizzes={completedQuizzes}
        />
      </div>

      {sessionOpen && (
        <StudySessionDialog
          subjects={subjects}
          onClose={() => setSessionOpen(false)}
          onSave={addStudySession}
        />
      )}
    </div>
  );
}
