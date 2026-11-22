import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Brain, Check, Clock3, Play, RotateCcw } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import { getStudyStats } from '../../studySessions/utils/studyStats';
import type { Quiz } from '../../../shared/types/common';

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

  function start(quiz: Quiz) {
    if (!quiz.items?.length) return;
    setActive(quiz);
    setStep(0);
    setAnswers({});
    setResult(null);
    setError('');
  }

  function answer(index: number) {
    const question = questions[step];
    if (question) setAnswers((previous) => ({ ...previous, [question.id]: index }));
  }

  async function finish() {
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

  if (active && result !== null) return <div className="quiz-result"><div className="result-check"><Check size={25}/></div><span className="eyebrow">PRACTICE COMPLETE</span><h1>Nice work.</h1><p>You’ve finished {active.title}. Every attempt builds a little more confidence.</p><div className="score-card"><span>Your score</span><strong>{result}<small>%</small></strong><div className="score-track"><i style={{ width: `${result}%` }}/></div><small>{questions.length} questions · {active.subject}</small></div><button className="button button-primary" onClick={() => setActive(null)}>Back to practice</button><button className="button button-ghost" onClick={() => start(active)}><RotateCcw size={15}/> Try again</button></div>;

  if (active) {
    const question = questions[step];
    return <div className="quiz-session"><button className="back-link" onClick={() => setActive(null)}><ArrowLeft size={16}/> All practice</button><div className="quiz-session-head"><div><span className="eyebrow">{active.subject.toUpperCase()}</span><h1>{active.title}</h1></div><div className="quiz-timer"><Clock3 size={16}/>{active.duration} min</div></div><div className="quiz-progress-label"><span>QUESTION {step + 1} OF {questions.length}</span><span>{Math.round((step + 1) / questions.length * 100)}%</span></div><div className="quiz-progress-track"><span style={{ width: `${(step + 1) / questions.length * 100}%` }}/></div><section className="question-card"><span className="eyebrow">CHOOSE ONE ANSWER</span><h2>{question?.prompt}</h2><div className="answer-list">{question?.options.map((option, index) => <button key={option} onClick={() => answer(index)} className={`answer-option ${answers[question.id] === index ? 'chosen' : ''}`}><span className="answer-letter">{String.fromCharCode(65 + index)}</span>{option}{answers[question.id] === index && <Check size={17}/>}</button>)}</div></section>{error && <div className="inline-error" role="alert">{error}</div>}<div className="quiz-nav"><button className="button button-ghost" disabled={step === 0 || submitting} onClick={() => setStep(step - 1)}><ArrowLeft size={16}/> Previous</button>{step < questions.length - 1 ? <button className="button button-primary" disabled={answers[question?.id] === undefined || submitting} onClick={() => setStep(step + 1)}>Next question <ArrowRight size={16}/></button> : <button className="button button-primary" disabled={Object.keys(answers).length < questions.length || submitting} onClick={() => void finish()}>{submitting ? 'Saving…' : 'Finish practice'} <Check size={16}/></button>}</div></div>;
  }

  return <div className="feature-page"><div className="feature-header"><div><span className="eyebrow">A FEW MINUTES GO A LONG WAY</span><h1>Practice</h1><p className="page-subtitle">Short, focused quizzes to turn what you know into what you remember.</p></div><div className="practice-streak" aria-label={`${studyStreak} day study streak`}><Brain size={17}/><span>{studyStreak ? `${studyStreak} day study streak` : 'Start your study streak'}</span></div></div><div className="practice-banner"><div className="practice-banner-icon"><Brain size={22}/></div><div><span className="eyebrow">YOUR DAILY PRACTICE</span><h2>One small session today?</h2><p>Pick a topic and give yourself 10 focused minutes.</p></div><span className="practice-spark">✳</span></div><div className="section-heading compact quiz-list-heading"><div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Quizzes for your courses</h2></div><span className="result-count">{quizzes.length} quizzes</span></div>{quizzesError && <div className="inline-error" role="alert">{quizzesError}</div>}{quizzesLoading ? <div className="materials-loading"><span className="loading-spinner"/>Loading practice…</div> : <div className="quiz-list">{quizzes.map((quiz, index) => <article className="quiz-card" key={quiz.id}><div className={`quiz-art art-${index % 4}`}><Brain size={22}/><span>{quiz.subject.split(' ').map((part) => part[0]).join('')}</span></div><div className="quiz-card-copy"><span className="eyebrow">{quiz.subject.toUpperCase()}</span><h3>{quiz.title}</h3><div className="quiz-meta"><span><Clock3 size={14}/>{quiz.duration} min</span><span>{quiz.questions} questions</span><span className={`difficulty ${quiz.difficulty.toLowerCase()}`}>{quiz.difficulty}</span></div></div><div className="quiz-last-score">{quiz.lastScore !== undefined ? <><strong>{quiz.lastScore}%</strong><small>Last score</small></> : <><strong>—</strong><small>Not started</small></>}</div><button className="button button-primary quiz-start" disabled={!quiz.items?.length} onClick={() => start(quiz)}><Play size={14} fill="currentColor"/> {quiz.items?.length ? 'Start' : 'Unavailable'}</button></article>)}</div>}{!quizzesLoading && !quizzes.length && <div className="empty-state"><span className="empty-icon"><Brain size={20}/></span><strong>No published quizzes yet</strong><p>Published practice quizzes for your subjects will appear here when they are added.</p></div>}</div>;
}
