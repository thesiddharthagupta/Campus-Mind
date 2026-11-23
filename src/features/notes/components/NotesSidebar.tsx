import { FolderOpen, Search } from 'lucide-react';
import type { Note, Subject } from '../../../shared/types/common';

type NotesSidebarProps = {
  notes: Note[];
  activeId?: string;
  onSelectNote: (id: string) => void;
  subjects: Subject[];
  filter: string;
  onFilterChange: (filter: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  totalNotesCount: number;
};

export function NotesSidebar({
  notes,
  activeId,
  onSelectNote,
  subjects,
  filter,
  onFilterChange,
  query,
  onQueryChange,
  totalNotesCount,
}: NotesSidebarProps) {
  return (
    <aside className="notes-sidebar">
      <label className="notes-search">
        <Search size={15} />
        <input
          placeholder="Find a note..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      <div className="notes-filters">
        <button
          className={filter === 'All notes' ? 'selected' : ''}
          onClick={() => onFilterChange('All notes')}
        >
          <FolderOpen size={15} /> All notes <span>{totalNotesCount}</span>
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            className={filter === subject.name ? 'selected' : ''}
            onClick={() => onFilterChange(subject.name)}
          >
            <span className={`note-dot ${subject.tint}`} />
            {subject.name}
          </button>
        ))}
      </div>

      <div className="notes-list">
        {notes.map((note) => (
          <button
            key={note.id}
            className={`note-list-item ${activeId === note.id ? 'active' : ''}`}
            onClick={() => onSelectNote(note.id)}
          >
            <span className={`note-dot ${note.color}`} />
            <span>
              <strong>{note.title}</strong>
              <small>{note.subject} · {note.updatedAt}</small>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
