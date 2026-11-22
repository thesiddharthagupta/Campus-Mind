import { useMemo, useRef, useState } from 'react';
import { Bookmark, FileText, Filter, Plus, Search, UploadCloud, X } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import { getMaterialPreviewUrl } from '../services/materialService';
import { Button } from '../../../shared/components/ui/Button';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';

export function MaterialsPage() {
  const { materials, subjects, addMaterial, toggleBookmark, materialsLoading, materialsError } = useCampusData();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All subjects');
  const [uploading, setUploading] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const shown = useMemo(() => materials.filter((item) =>
    (subject === 'All subjects' || item.subject === subject) &&
    `${item.title} ${item.subject} ${item.kind}`.toLowerCase().includes(query.toLowerCase())), [materials, subject, query]);

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploadBusy(true);
    setActionError('');
    const chosenSubject = subject === 'All subjects' ? 'Database Systems' : subject;
    const result = await addMaterial(file, chosenSubject);
    setUploadBusy(false);
    if (result.error) setActionError(result.error);
    else setUploading(false);
    if (input.current) input.current.value = '';
  }

  async function handleBookmark(id: string) {
    setActionError('');
    const result = await toggleBookmark(id);
    if (result.error) setActionError(result.error);
  }

  async function openMaterial(storagePath?: string) {
    if (!storagePath) return;
    const preview = window.open('about:blank', '_blank');
    if (!preview) {
      setActionError('Allow pop-ups to open the private file preview.');
      return;
    }
    preview.opener = null;
    try {
      const url = await getMaterialPreviewUrl(storagePath);
      preview.location.href = url;
    } catch (error) {
      preview.close();
      setActionError(error instanceof Error ? error.message : 'Could not open this material.');
    }
  }

  return <div className="feature-page">
    <div className="feature-header"><div><span className="eyebrow">FIND YOUR NEXT STUDY SESSION</span><h1>Study library</h1><p className="page-subtitle">A shared shelf of helpful material, organized around your courses.</p></div><Button variant="primary" onClick={() => setUploading(true)}><Plus size={17}/> Add material</Button></div>
    <div className="library-toolbar"><label className="library-search"><Search size={17}/><input placeholder="Search notes, topics, subjects..." value={query} onChange={(event) => setQuery(event.target.value)}/>{query&&<button onClick={() => setQuery('')} aria-label="Clear search"><X size={15}/></button>}</label><label className="filter-select"><Filter size={16}/><select value={subject} onChange={(event) => setSubject(event.target.value)}><option>All subjects</option>{subjects.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><span className="result-count">{shown.length} resources</span></div>
    {actionError && <div className="inline-error" role="alert">{actionError}</div>}
    {materialsError && <div className="inline-error" role="alert">{materialsError}</div>}
    {materialsLoading ? <div className="materials-loading"><span className="loading-spinner"/>Loading your study library…</div> : <div className="material-grid">{shown.map((item) => <article className="material-card" key={item.id}><div className={`material-cover ${item.color}`}><div className="cover-decoration"/><span className="cover-type">{item.kind}</span><FileText size={31}/><button className={`bookmark-control ${item.bookmarked?'saved':''}`} aria-label={item.bookmarked?'Remove bookmark':'Bookmark material'} onClick={() => void handleBookmark(item.id)}><Bookmark size={16} fill={item.bookmarked?'currentColor':'none'}/></button></div><div className="material-copy"><span className="material-subject">{item.subject}</span><h3>{item.title}</h3><p>{item.description}</p><div className="material-meta"><span>{item.author}</span><span>{item.pages} pages · {item.size}</span></div>{item.storagePath&&<button className="material-open-button" onClick={() => void openMaterial(item.storagePath)}>Open file ↗</button>}</div></article>)}</div>}
    {!materialsLoading && !shown.length && <EmptyState title="No materials found" detail="Try another search or choose a different subject."/>}
    {uploading && <div className="overlay-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setUploading(false)}><div className="dialog"><button className="dialog-close" onClick={() => setUploading(false)} aria-label="Close"><X size={18}/></button><span className="eyebrow">GROW THE STUDY LIBRARY</span><h2>Share a resource</h2><p>Add a file for moderator review. It will be stored privately until it is approved.</p><label className="upload-subject">Subject<select value={subject==='All subjects'?(subjects[0]?.name ?? ''):subject} onChange={(event) => setSubject(event.target.value)} required disabled={!subjects.length}>{subjects.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><button className="drop-zone" onClick={() => input.current?.click()} disabled={uploadBusy||!subjects.length}><UploadCloud size={24}/><strong>{uploadBusy?'Uploading securely…':'Choose a file to upload'}</strong><span>PDF, image, or document · up to 25 MB</span></button><input ref={input} hidden type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx" onChange={(event) => void handleUpload(event.target.files?.[0])}/>{actionError && <div className="inline-error" role="alert">{actionError}</div>}<div className="dialog-note"><span>ⓘ</span>Uploaded files remain private while pending moderation.</div><Button onClick={() => input.current?.click()} variant="primary" className="dialog-action" disabled={uploadBusy||!subjects.length}><UploadCloud size={16}/>{uploadBusy?'Uploading…':'Choose file'}</Button></div></div>}
  </div>;
}
