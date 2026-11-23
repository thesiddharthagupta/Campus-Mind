import { useMemo, useState } from 'react';
import { Filter, Plus, Search, X } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import { getMaterialPreviewUrl } from '../services/materialService';
import { Button } from '../../../shared/components/ui/Button';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { MaterialCard } from '../components/MaterialCard';
import { UploadMaterialDialog } from '../components/UploadMaterialDialog';

export function MaterialsPage() {
  const { materials, subjects, addMaterial, toggleBookmark, materialsLoading, materialsError } = useCampusData();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All subjects');
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState('');

  const shown = useMemo(() => materials.filter((item) =>
    (subject === 'All subjects' || item.subject === subject) &&
    `${item.title} ${item.subject} ${item.kind}`.toLowerCase().includes(query.toLowerCase())),
    [materials, subject, query]
  );

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

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div>
          <span className="eyebrow">FIND YOUR NEXT STUDY SESSION</span>
          <h1>Study library</h1>
          <p className="page-subtitle">A shared shelf of helpful material, organized around your courses.</p>
        </div>
        <Button variant="primary" onClick={() => setUploading(true)}>
          <Plus size={17} /> Add material
        </Button>
      </div>

      <div className="library-toolbar">
        <label className="library-search">
          <Search size={17} />
          <input
            placeholder="Search notes, topics, subjects..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </label>
        <label className="filter-select">
          <Filter size={16} />
          <select value={subject} onChange={(event) => setSubject(event.target.value)}>
            <option>All subjects</option>
            {subjects.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <span className="result-count">{shown.length} resources</span>
      </div>

      {actionError && <div className="inline-error" role="alert">{actionError}</div>}
      {materialsError && <div className="inline-error" role="alert">{materialsError}</div>}

      {materialsLoading ? (
        <div className="materials-loading">
          <span className="loading-spinner" />Loading your study library…
        </div>
      ) : (
        <div className="material-grid">
          {shown.map((item) => (
            <MaterialCard
              key={item.id}
              material={item}
              onBookmark={handleBookmark}
              onOpen={openMaterial}
            />
          ))}
        </div>
      )}

      {!materialsLoading && !shown.length && (
        <EmptyState title="No materials found" detail="Try another search or choose a different subject." />
      )}

      <UploadMaterialDialog
        open={uploading}
        onClose={() => setUploading(false)}
        subjects={subjects}
        initialSubject={subject === 'All subjects' ? undefined : subject}
        onUpload={addMaterial}
      />
    </div>
  );
}
