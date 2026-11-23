import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { SubjectMenu } from '../components/SubjectMenu';
import { SubjectHero } from '../components/SubjectHero';
import { ModuleList } from '../components/ModuleList';

export function AcademicPage() {
  const { academicSubjects, completedTopicIds, toggleTopicCompletion, academicLoading, academicError, materials } = useCampusData();
  const [selected, setSelected] = useState('');
  const current = academicSubjects.find((subject) => subject.id === selected) ?? academicSubjects[0];
  const resourceCount = current ? materials.filter((material) => material.subject === current.name).length : 0;
  const completedTopicsCount = current
    ? completedTopicIds.filter((id) => current.moduleItems.some((m) => m.topics.some((t) => t.id === id))).length
    : 0;

  if (academicLoading) {
    return (
      <div className="feature-page">
        <div className="feature-header">
          <div>
            <span className="eyebrow">YOUR COURSE MAP</span>
            <h1>My subjects</h1>
            <p className="page-subtitle">Follow your learning from the big picture down to each topic.</p>
          </div>
        </div>
        <div className="materials-loading">
          <span className="loading-spinner" />Loading your academic structure…
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="feature-page">
        <div className="feature-header">
          <div>
            <span className="eyebrow">YOUR COURSE MAP</span>
            <h1>My subjects</h1>
            <p className="page-subtitle">Follow your learning from the big picture down to each topic.</p>
          </div>
        </div>
        {academicError && <div className="inline-error" role="alert">{academicError}</div>}
        <EmptyState
          title="No subjects are set up yet"
          detail="Add universities, programs, semesters, and subjects to the academic database to build your course map."
        />
      </div>
    );
  }

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div>
          <span className="eyebrow">YOUR COURSE MAP</span>
          <h1>My subjects</h1>
          <p className="page-subtitle">Follow your learning from the big picture down to each topic.</p>
        </div>
        <div className="semester-pill">
          <span className="semester-dot" />{current.semester} <ChevronDown size={15} />
        </div>
      </div>

      {academicError && <div className="inline-error" role="alert">{academicError}</div>}

      <div className="academic-layout">
        <SubjectMenu
          subjects={academicSubjects}
          selectedId={current.id}
          onSelect={setSelected}
          department={current.department}
          program={current.program}
        />

        <section className="subject-detail">
          <SubjectHero
            subject={current}
            completedTopicsCount={completedTopicsCount}
            resourceCount={resourceCount}
          />

          <div className="module-heading">
            <div>
              <span className="eyebrow">COURSE CONTENT</span>
              <h3>Modules & topics</h3>
            </div>
            <span className="sort-label">Syllabus order ↓</span>
          </div>

          <ModuleList
            modules={current.moduleItems}
            completedTopicIds={completedTopicIds}
            onToggleTopic={toggleTopicCompletion}
          />
        </section>
      </div>
    </div>
  );
}
