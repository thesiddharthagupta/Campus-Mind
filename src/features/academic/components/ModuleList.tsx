import { ArrowRight, ChevronDown } from 'lucide-react';
import type { AcademicSubject } from '../types/academic.types';

type ModuleListProps = {
  modules: AcademicSubject['moduleItems'];
  completedTopicIds: string[];
  onToggleTopic: (topicId: string, completed: boolean) => void;
};

export function ModuleList({ modules, completedTopicIds, onToggleTopic }: ModuleListProps) {
  return (
    <div className="module-list">
      {modules.map((module, moduleIndex) => {
        const completedCount = module.topics.filter((topic) => completedTopicIds.includes(topic.id)).length;
        const allComplete = module.topics.length > 0 && completedCount === module.topics.length;
        return (
          <details className="module-item" key={module.id} open={moduleIndex === 0}>
            <summary>
              <span className={`module-number ${allComplete ? 'complete' : ''}`}>
                {allComplete ? '✓' : String(module.position).padStart(2, '0')}
              </span>
              <span><strong>Module {module.position}</strong><small>{module.title}</small></span>
              <span className="module-topics">{module.topics.length} topics{allComplete ? ' · completed' : ''}</span>
              <ChevronDown size={17} />
            </summary>
            <div className="topic-list">
              {module.topics.map((topic) => {
                const complete = completedTopicIds.includes(topic.id);
                return (
                  <button
                    className="topic-row"
                    key={topic.id}
                    onClick={() => void onToggleTopic(topic.id, !complete)}
                    aria-pressed={complete}
                  >
                    <span className={`topic-check ${complete ? 'checked' : ''}`}>{complete ? '✓' : ''}</span>
                    <span>{topic.title}</span>
                    <ArrowRight size={14} />
                  </button>
                );
              })}
              {!module.topics.length && <p className="topic-empty">Topics will appear here when the syllabus is added.</p>}
            </div>
          </details>
        );
      })}
    </div>
  );
}
