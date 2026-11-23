import { useRef, useState, type ChangeEvent } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import type { Subject } from '../../../shared/types/common';

type UploadMaterialDialogProps = {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubject?: string;
  onUpload: (file: File, subjectName: string) => Promise<{ error: string | null }>;
};

export function UploadMaterialDialog({ open, onClose, subjects, initialSubject, onUpload }: UploadMaterialDialogProps) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || subjects[0]?.name || 'Database Systems');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    setError('');
    const result = await onUpload(file, selectedSubject);
    setUploadBusy(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="overlay-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog">
        <button className="dialog-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <span className="eyebrow">GROW THE STUDY LIBRARY</span>
        <h2>Share a resource</h2>
        <p>Add a file for moderator review. It will be stored privately until it is approved.</p>

        <label className="upload-subject">
          Subject
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
            disabled={!subjects.length || uploadBusy}
          >
            {subjects.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
        </label>

        <button
          className="drop-zone"
          onClick={() => inputRef.current?.click()}
          disabled={uploadBusy || !subjects.length}
        >
          <UploadCloud size={24} />
          <strong>{uploadBusy ? 'Uploading securely…' : 'Choose a file to upload'}</strong>
          <span>PDF, image, or document · up to 25 MB</span>
        </button>

        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
          onChange={(e) => void handleFileChange(e)}
        />

        {error && <div className="inline-error" role="alert">{error}</div>}

        <div className="dialog-note">
          <span>ⓘ</span>Uploaded files remain private while pending moderation.
        </div>

        <Button
          onClick={() => inputRef.current?.click()}
          variant="primary"
          className="dialog-action"
          disabled={uploadBusy || !subjects.length}
        >
          <UploadCloud size={16} />
          {uploadBusy ? 'Uploading…' : 'Choose file'}
        </Button>
      </div>
    </div>
  );
}
