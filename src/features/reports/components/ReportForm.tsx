import { useState, type FormEvent } from 'react';
import type { Material } from '../../../shared/types/common';

type ReportFormProps = {
  materials: Material[];
  onSubmit: (materialId: string, reason: string, details: string) => Promise<void>;
  submitting: boolean;
  error?: string;
};

export function ReportForm({ materials, onSubmit, submitting, error }: ReportFormProps) {
  const [materialId, setMaterialId] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(materialId, reason, details);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <label>
        Resource
        <select
          required
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
        >
          <option value="" disabled>Select a material</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} · {m.subject}
            </option>
          ))}
        </select>
      </label>

      <label>
        Reason
        <select
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="" disabled>Choose a reason</option>
          <option>Copyright or ownership concern</option>
          <option>Inaccurate or misleading content</option>
          <option>Inappropriate material</option>
          <option>Spam or duplicate</option>
          <option>Other</option>
        </select>
      </label>

      <label>
        Additional details
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Share context that may help us review this report."
          rows={4}
        />
      </label>

      {error && <p className="auth-error" role="alert">{error}</p>}

      <button
        className="button button-primary"
        type="submit"
        disabled={submitting || !materials.length}
      >
        {submitting ? 'Sending…' : 'Send report'}
      </button>

      {!materials.length && (
        <span className="report-hint">Add or browse a material before submitting a report.</span>
      )}
    </form>
  );
}
