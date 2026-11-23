import { ArrowLeft, ArrowRight, Check, Clock3 } from 'lucide-react';
import type { Quiz, QuizQuestionData } from '../../../shared/types/common';

type QuizSessionProps = {
  quiz: Quiz;
  questions: QuizQuestionData[];
  step: number;
  answers: Record<string, number>;
  onAnswer: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  onCancel: () => void;
  submitting: boolean;
  error?: string;
};

export function QuizSession({
  quiz,
  questions,
  step,
  answers,
  onAnswer,
  onNext,
  onPrev,
  onFinish,
  onCancel,
  submitting,
  error,
}: QuizSessionProps) {
  const question = questions[step];
  const progressPercent = Math.round(((step + 1) / questions.length) * 100);
  const isLastQuestion = step === questions.length - 1;
  const isAnswered = question && answers[question.id] !== undefined;
  const allAnswered = Object.keys(answers).length >= questions.length;

  return (
    <div className="quiz-session">
      <button className="back-link" onClick={onCancel}>
        <ArrowLeft size={16} /> All practice
      </button>

      <div className="quiz-session-head">
        <div>
          <span className="eyebrow">{quiz.subject.toUpperCase()}</span>
          <h1>{quiz.title}</h1>
        </div>
        <div className="quiz-timer">
          <Clock3 size={16} />{quiz.duration} min
        </div>
      </div>

      <div className="quiz-progress-label">
        <span>QUESTION {step + 1} OF {questions.length}</span>
        <span>{progressPercent}%</span>
      </div>
      <div className="quiz-progress-track">
        <span style={{ width: `${progressPercent}%` }} />
      </div>

      <section className="question-card">
        <span className="eyebrow">CHOOSE ONE ANSWER</span>
        <h2>{question?.prompt}</h2>
        <div className="answer-list">
          {question?.options.map((option, index) => (
            <button
              key={option}
              onClick={() => onAnswer(index)}
              className={`answer-option ${answers[question.id] === index ? 'chosen' : ''}`}
            >
              <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
              {option}
              {answers[question.id] === index && <Check size={17} />}
            </button>
          ))}
        </div>
      </section>

      {error && <div className="inline-error" role="alert">{error}</div>}

      <div className="quiz-nav">
        <button
          className="button button-ghost"
          disabled={step === 0 || submitting}
          onClick={onPrev}
        >
          <ArrowLeft size={16} /> Previous
        </button>

        {isLastQuestion ? (
          <button
            className="button button-primary"
            disabled={!allAnswered || submitting}
            onClick={onFinish}
          >
            {submitting ? 'Saving…' : 'Finish practice'} <Check size={16} />
          </button>
        ) : (
          <button
            className="button button-primary"
            disabled={!isAnswered || submitting}
            onClick={onNext}
          >
            Next question <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
