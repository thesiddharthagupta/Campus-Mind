import { Check, RotateCcw } from 'lucide-react';
import type { Quiz } from '../../../shared/types/common';

type QuizResultProps = {
  quiz: Quiz;
  score: number;
  totalQuestions: number;
  onBack: () => void;
  onRetry: () => void;
};

export function QuizResult({ quiz, score, totalQuestions, onBack, onRetry }: QuizResultProps) {
  return (
    <div className="quiz-result">
      <div className="result-check">
        <Check size={25} />
      </div>
      <span className="eyebrow">PRACTICE COMPLETE</span>
      <h1>Nice work.</h1>
      <p>You’ve finished {quiz.title}. Every attempt builds a little more confidence.</p>

      <div className="score-card">
        <span>Your score</span>
        <strong>{score}<small>%</small></strong>
        <div className="score-track">
          <i style={{ width: `${score}%` }} />
        </div>
        <small>{totalQuestions} questions · {quiz.subject}</small>
      </div>

      <button className="button button-primary" onClick={onBack}>
        Back to practice
      </button>
      <button className="button button-ghost" onClick={onRetry}>
        <RotateCcw size={15} /> Try again
      </button>
    </div>
  );
}
