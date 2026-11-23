import { Brain, Clock3, Play } from 'lucide-react';
import type { Quiz } from '../../../shared/types/common';

type QuizCardProps = {
  quiz: Quiz;
  index: number;
  onStart: (quiz: Quiz) => void;
};

export function QuizCard({ quiz, index, onStart }: QuizCardProps) {
  const initials = quiz.subject.split(' ').map((p) => p[0]).join('');
  const hasQuestions = Boolean(quiz.items?.length);

  return (
    <article className="quiz-card">
      <div className={`quiz-art art-${index % 4}`}>
        <Brain size={22} />
        <span>{initials}</span>
      </div>
      <div className="quiz-card-copy">
        <span className="eyebrow">{quiz.subject.toUpperCase()}</span>
        <h3>{quiz.title}</h3>
        <div className="quiz-meta">
          <span><Clock3 size={14} />{quiz.duration} min</span>
          <span>{quiz.questions} questions</span>
          <span className={`difficulty ${quiz.difficulty.toLowerCase()}`}>{quiz.difficulty}</span>
        </div>
      </div>
      <div className="quiz-last-score">
        {quiz.lastScore !== undefined ? (
          <><strong>{quiz.lastScore}%</strong><small>Last score</small></>
        ) : (
          <><strong>—</strong><small>Not started</small></>
        )}
      </div>
      <button
        className="button button-primary quiz-start"
        disabled={!hasQuestions}
        onClick={() => onStart(quiz)}
      >
        <Play size={14} fill="currentColor" /> {hasQuestions ? 'Start' : 'Unavailable'}
      </button>
    </article>
  );
}
