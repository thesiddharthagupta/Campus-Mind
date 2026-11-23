import { BookOpen } from 'lucide-react';
import { ProgressBar } from '../../../shared/components/ui/ProgressBar';
import type { AcademicSubject } from '../types/academic.types';

type SubjectHeroProps = {
  subject: AcademicSubject;
  completedTopicsCount: number;
  resourceCount: number;
};

export function SubjectHero({ subject, completedTopicsCount, resourceCount }: SubjectHeroProps) {
  return (
    <>
      <div className={`detail-hero ${subject.tint}`}>
        <div>
          <span className="eyebrow">{subject.university} · {subject.semester}</span>
          <h2>{subject.name}</h2>
          <p>{subject.description || `${subject.program} · ${subject.code}`}</p>
        </div>
        <span className="hero-course-icon"><BookOpen size={28} /></span>
      </div>

      <div className="course-progress">
        <div>
          <div>
            <span className="eyebrow">YOUR COURSE PROGRESS</span>
            <strong>{subject.progress}%</strong>
          </div>
          <ProgressBar value={subject.progress} />
          <small>{completedTopicsCount} topics completed across {subject.modules} modules</small>
        </div>
        <div className="course-resources">
          <strong>{resourceCount}</strong>
          <span>resources</span>
        </div>
      </div>
    </>
  );
}
