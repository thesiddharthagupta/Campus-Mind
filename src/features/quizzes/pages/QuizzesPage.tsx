import { useMemo, useState } from 'react';
import { Brain } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import { getStudyStats } from '../../studySessions/utils/studyStats';
import type { Quiz } from '../../../shared/types/common';
import { QuizCard } from '../components/QuizCard';
import { QuizSession } from '../components/QuizSession';
import { QuizResult } from '../components/QuizResult';

export function QuizzesPage() {
  const { quizzes, completeQuiz, quizzesLoading, quizzesError, studySessions } = useCampusData();
  const [active, setActive] = useState<Quiz | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const questions = useMemo(() => active?.items ?? [], [active]);
  const studyStreak = getStudyStats(studySessions).currentStreak;

  function handleStart(quiz: Quiz) {
    if (!quiz.items?.length) return;
    setActive(quiz);
    setStep(0);
    setAnswers({});
    setResult(null);
    setError('');
  }

  function handleAnswer(index: number) {
    const question = questions[step];
    if (question) {
      setAnswers((prev) => ({ ...prev, [question.id]: index }));
    }
  }

  async function handleFinish() {
    if (!active || !questions.length) return;
    setSubmitting(true);
    setError('');
    const submitted = await completeQuiz(active.id, answers);
    setSubmitting(false);
    if (submitted.error || submitted.score === null) {
      setError(submitted.error ?? 'Could not save your attempt.');
      return;
    }
    setResult(submitted.score);
  }

  if (active && result !== null) {
    return (
      <QuizResult
        quiz={active}
        score={result}
        totalQuestions={questions.length}
        onBack={() => setActive(null)}
        onRetry={() => handleStart(active)}
      />
    );
  }

  if (active) {
    return (
      <QuizSession
        quiz={active}
        questions={questions}
        step={step}
        answers={answers}
        onAnswer={handleAnswer}
        onNext={() => setStep((s) => s + 1)}
        onPrev={() => setStep((s) => s - 1)}
        onFinish={() => void handleFinish()}
        onCancel={() => setActive(null)}
        submitting={submitting}
        error={error}
      />
    );
  }

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div>
          <span className="eyebrow">A FEW MINUTES GO A LONG WAY</span>
          <h1>Practice</h1>
          <p className="page-subtitle">Short, focused quizzes to turn what you know into what you remember.</p>
        </div>
        <div className="practice-streak" aria-label={`${studyStreak} day study streak`}>
          <Brain size={17} />
          <span>{studyStreak ? `${studyStreak} day study streak` : 'Start your study streak'}</span>
        </div>
      </div>

      <div className="practice-banner">
        <div className="practice-banner-icon"><Brain size={22} /></div>
        <div>
          <span className="eyebrow">YOUR DAILY PRACTICE</span>
          <h2>One small session today?</h2>
          <p>Pick a topic and give yourself 10 focused minutes.</p>
        </div>
        <span className="practice-spark">✳</span>
      </div>

      <div className="section-heading compact quiz-list-heading">
        <div>
          <span className="eyebrow">READY WHEN YOU ARE</span>
          <h2>Quizzes for your courses</h2>
        </div>
        <span className="result-count">{quizzes.length} quizzes</span>
      </div>

      {quizzesError && <div className="inline-error" role="alert">{quizzesError}</div>}

      {quizzesLoading ? (
        <div className="materials-loading">
          <span className="loading-spinner" />Loading practice…
        </div>
      ) : (
        <div className="quiz-list">
          {quizzes.map((quiz, index) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              index={index}
              onStart={handleStart}
            />
          ))}
        </div>
      )}

      {!quizzesLoading && !quizzes.length && (
        <div className="empty-state">
          <span className="empty-icon"><Brain size={20} /></span>
          <strong>No published quizzes yet</strong>
          <p>Published practice quizzes for your subjects will appear here when they are added.</p>
        </div>
      )}
    </div>
  );
}
