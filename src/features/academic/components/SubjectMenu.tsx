import { Braces, Cpu, Database, Network } from 'lucide-react';
import type { AcademicSubject } from '../types/academic.types';

const icons = [Database, Braces, Network, Cpu];

type SubjectMenuProps = {
  subjects: AcademicSubject[];
  selectedId: string;
  onSelect: (id: string) => void;
  department: string;
  program: string;
};

export function SubjectMenu({ subjects, selectedId, onSelect, department, program }: SubjectMenuProps) {
  return (
    <aside className="subject-menu">
      <span className="menu-heading">{department.toUpperCase()} · {program.toUpperCase()}</span>
      {subjects.map((subject, index) => {
        const Icon = icons[index % icons.length];
        return (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className={`subject-menu-item ${subject.id === selectedId ? 'selected' : ''}`}
          >
            <span className={`mini-subject-icon ${subject.tint}`}><Icon size={16} /></span>
            <span><strong>{subject.name}</strong><small>{subject.code}</small></span>
            <span className="menu-chevron">›</span>
          </button>
        );
      })}
    </aside>
  );
}
