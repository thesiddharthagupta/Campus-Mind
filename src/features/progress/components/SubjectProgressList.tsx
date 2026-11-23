import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProgressBar } from '../../../shared/components/ui/ProgressBar';
import type { Subject } from '../../../shared/types/common';

type SubjectProgressListProps = {
  semesterLabel: string;
  subjects: Subject[];
};

export function SubjectProgressList({ semesterLabel, subjects }: SubjectProgressListProps) {
  return (
    <section className="progress-section-card">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">{semesterLabel}</span>
          <h2>Subject progress</h2>
        </div>
        <Link className="text-link" to="/academic">
          View syllabus <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="progress-subject-list">
        {subjects.map((subject) => (
          <div className="progress-subject" key={subject.id}>
            <span className={`mini-subject-icon ${subject.tint}`}>{subject.code.split(' ')[1]}</span>
            <div className="progress-subject-main">
              <div>
                <strong>{subject.name}</strong>
                <span>{subject.progress}%</span>
              </div>
              <ProgressBar value={subject.progress} />
              <small>
                {Math.round((subject.modules * subject.progress) / 100)} of {subject.modules} modules completed
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
