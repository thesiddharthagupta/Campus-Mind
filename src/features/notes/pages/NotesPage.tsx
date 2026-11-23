import { useEffect, useMemo, useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import type { Note } from '../../../shared/types/common';
import { NotesSidebar } from '../components/NotesSidebar';
import { NoteEditor } from '../components/NoteEditor';

export function NotesPage() {
  const { notes, addNote, updateNote, subjects, notesLoading, notesSaving, notesError } = useCampusData();
  const [active, setActive] = useState<string>();
  const [mobileListVisible, setMobileListVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All notes');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => notes.filter((note) =>
    (filter === 'All notes' || note.subject === filter) &&
    `${note.title} ${note.content}`.toLowerCase().includes(query.toLowerCase())),
    [notes, filter, query]
  );
  const selected = notes.find((note) => note.id === active);

  useEffect(() => {
    if (!active && notes.length) setActive(notes[0].id);
    else if (active && !notes.some((note) => note.id === active)) setActive(notes[0]?.id);
  }, [notes, active]);

  async function create() {
    if (creating) return;
    setCreating(true);
    const note: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled note',
      subject: subjects[0]?.name ?? 'Uncategorized',
      updatedAt: 'Just now',
      content: '',
      tags: [],
      color: 'lavender',
    };
    const result = await addNote(note);
    setCreating(false);
    if (result.note) setActive(result.note.id);
  }

  return (
    <div className="feature-page notes-page">
      <div className="feature-header">
        <div>
          <span className="eyebrow">YOUR PERSONAL STUDY SPACE</span>
          <h1>My notes</h1>
          <p className="page-subtitle">Your thoughts, organized around the subjects you’re learning.</p>
        </div>
        <button className="button button-primary" onClick={() => void create()} disabled={creating}>
          <FilePlus2 size={17} />{creating ? 'Creating…' : 'New note'}
        </button>
      </div>

      {notesError && <div className="inline-error" role="alert">{notesError}</div>}

      <div className={`notes-workspace ${selected ? 'note-open' : ''} ${mobileListVisible ? 'show-note-list' : ''}`}>
        <NotesSidebar
          notes={filtered}
          activeId={active}
          onSelectNote={(id) => { setActive(id); setMobileListVisible(false); }}
          subjects={subjects}
          filter={filter}
          onFilterChange={setFilter}
          query={query}
          onQueryChange={setQuery}
          totalNotesCount={notes.length}
        />

        {notesLoading ? (
          <div className="note-empty">
            <span className="loading-spinner" />Loading your notes…
          </div>
        ) : selected ? (
          <NoteEditor
            note={selected}
            subjects={subjects}
            notesSaving={notesSaving}
            onUpdate={updateNote}
            onBack={() => setMobileListVisible(true)}
          />
        ) : (
          <div className="note-empty">
            {notesLoading ? 'Loading your notes…' : filtered.length === 0 && notes.length ? 'No notes match this filter.' : 'Create a note to start your study space.'}
          </div>
        )}
      </div>
    </div>
  );
}
