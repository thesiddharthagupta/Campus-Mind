import { ArrowLeft, Tag } from 'lucide-react';
import type { Note, Subject } from '../../../shared/types/common';

type NoteEditorProps = {
  note: Note;
  subjects: Subject[];
  notesSaving: boolean;
  onUpdate: (note: Note) => void;
  onBack: () => void;
};

export function NoteEditor({ note, subjects, notesSaving, onUpdate, onBack }: NoteEditorProps) {
  function handleFieldChange(key: 'title' | 'content', value: string) {
    onUpdate({ ...note, [key]: value, updatedAt: 'Just now' });
  }

  const wordCount = note.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <section className="note-editor">
      <div className="editor-toolbar">
        <button className="notes-back" onClick={onBack}>
          <ArrowLeft size={15} />All notes
        </button>
        <span>
          <span className={`saved-dot ${notesSaving ? 'saving' : ''}`} />
          {notesSaving ? 'Saving…' : 'Saved to your account'}
        </span>
      </div>

      <div className="editor-fields">
        <div className="editor-subject">
          <span className="eyebrow">SUBJECT</span>
          <select
            value={note.subject}
            onChange={(e) => onUpdate({ ...note, subject: e.target.value })}
          >
            {subjects.map((subject) => (
              <option key={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>

        <input
          className="note-title-input"
          value={note.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          aria-label="Note title"
          placeholder="Give your note a title"
        />

        <div className="editor-meta">
          <span>Updated {note.updatedAt}</span>
          <span><Tag size={13} />{note.tags.length ? note.tags.join(', ') : 'Add a tag'}</span>
        </div>

        <textarea
          className="note-content-input"
          value={note.content}
          onChange={(e) => handleFieldChange('content', e.target.value)}
          placeholder="Start writing your thoughts…"
        />
      </div>

      <div className="editor-footer">
        <span>Changes save automatically</span>
        <span>{wordCount} words</span>
      </div>
    </section>
  );
}
