import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FilePlus2, FolderOpen, Search, Tag } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import type { Note } from '../../../shared/types/common';

export function NotesPage() {
  const { notes, addNote, updateNote, subjects, notesLoading, notesSaving, notesError } = useCampusData();
  const [active, setActive] = useState<string>();
  const [mobileListVisible, setMobileListVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All notes');
  const [creating, setCreating] = useState(false);
  const filtered = useMemo(() => notes.filter((note) =>
    (filter === 'All notes' || note.subject === filter) &&
    `${note.title} ${note.content}`.toLowerCase().includes(query.toLowerCase())), [notes, filter, query]);
  const selected = notes.find((note) => note.id === active);

  useEffect(() => {
    if (!active && notes.length) setActive(notes[0].id);
    else if (active && !notes.some((note) => note.id === active)) setActive(notes[0]?.id);
  }, [notes, active]);

  async function create() {
    if (creating) return;
    setCreating(true);
    const note: Note = { id: crypto.randomUUID(), title: 'Untitled note', subject: subjects[0]?.name ?? 'Uncategorized', updatedAt: 'Just now', content: '', tags: [], color: 'lavender' };
    const result = await addNote(note);
    setCreating(false);
    if (result.note) setActive(result.note.id);
  }

  function save(key: 'title' | 'content', value: string) {
    if (selected) updateNote({ ...selected, [key]: value, updatedAt: 'Just now' });
  }

  return <div className="feature-page notes-page">
    <div className="feature-header"><div><span className="eyebrow">YOUR PERSONAL STUDY SPACE</span><h1>My notes</h1><p className="page-subtitle">Your thoughts, organized around the subjects you’re learning.</p></div><button className="button button-primary" onClick={() => void create()} disabled={creating}><FilePlus2 size={17}/>{creating ? 'Creating…' : 'New note'}</button></div>
    {notesError && <div className="inline-error" role="alert">{notesError}</div>}
    <div className={`notes-workspace ${selected ? 'note-open' : ''} ${mobileListVisible ? 'show-note-list' : ''}`}><aside className="notes-sidebar"><label className="notes-search"><Search size={15}/><input placeholder="Find a note..." value={query} onChange={(event) => setQuery(event.target.value)}/></label><div className="notes-filters"><button className={filter==='All notes'?'selected':''} onClick={() => setFilter('All notes')}><FolderOpen size={15}/> All notes <span>{notes.length}</span></button>{subjects.map((subject) => <button key={subject.id} className={filter===subject.name?'selected':''} onClick={() => setFilter(subject.name)}><span className={`note-dot ${subject.tint}`}/>{subject.name}</button>)}</div><div className="notes-list">{filtered.map((note) => <button key={note.id} className={`note-list-item ${active===note.id?'active':''}`} onClick={() => { setActive(note.id); setMobileListVisible(false); }}><span className={`note-dot ${note.color}`}/><span><strong>{note.title}</strong><small>{note.subject} · {note.updatedAt}</small></span></button>)}</div></aside>
      {notesLoading ? <div className="note-empty"><span className="loading-spinner"/>Loading your notes…</div> : selected ? <section className="note-editor"><div className="editor-toolbar"><button className="notes-back" onClick={() => setMobileListVisible(true)}><ArrowLeft size={15}/>All notes</button><span><span className={`saved-dot ${notesSaving?'saving':''}`}/>{notesSaving?'Saving…':'Saved to your account'}</span></div><div className="editor-fields"><div className="editor-subject"><span className="eyebrow">SUBJECT</span><select value={selected.subject} onChange={(event) => updateNote({ ...selected, subject: event.target.value })}>{subjects.map((subject) => <option key={subject.id}>{subject.name}</option>)}</select></div><input className="note-title-input" value={selected.title} onChange={(event) => save('title', event.target.value)} aria-label="Note title" placeholder="Give your note a title"/><div className="editor-meta"><span>Updated {selected.updatedAt}</span><span><Tag size={13}/>{selected.tags.length ? selected.tags.join(', ') : 'Add a tag'}</span></div><textarea className="note-content-input" value={selected.content} onChange={(event) => save('content', event.target.value)} placeholder="Start writing your thoughts…"/></div><div className="editor-footer"><span>Changes save automatically</span><span>{selected.content.trim().split(/\s+/).filter(Boolean).length} words</span></div></section> : <div className="note-empty">{notesLoading?'Loading your notes…':filtered.length===0&&notes.length?'No notes match this filter.':'Create a note to start your study space.'}</div>}
    </div>
  </div>;
}
