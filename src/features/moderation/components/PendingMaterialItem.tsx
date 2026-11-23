import { Check, ExternalLink, FileText, X } from 'lucide-react';
import type { ModerationAction, ModerationMaterial } from '../types/moderation.types';

type PendingMaterialItemProps = {
  item: ModerationMaterial;
  isBusy: boolean;
  onAction: (key: string, action: ModerationAction, materialId: string) => Promise<void>;
  onPreview: (storagePath: string | null) => void;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function sizeLabel(bytes: number | null) {
  if (!bytes) return 'File size unavailable';
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function resourceLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function PendingMaterialItem({ item, isBusy, onAction, onPreview }: PendingMaterialItemProps) {
  return (
    <article className="moderation-item" key={item.id}>
      <div className="moderation-item-main">
        <div className="moderation-item-head">
          <span className="cover-type">{resourceLabel(item.resourceType)}</span>
          <span className="material-subject">{item.subject}</span>
          <span className="moderation-date">{dateLabel(item.createdAt)}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="moderation-meta">
          <span><FileText size={14} /> {sizeLabel(item.byteSize)}</span>
          <span>Status: <strong>{item.status}</strong></span>
        </div>
      </div>
      <div className="moderation-actions">
        <button
          className="button button-ghost"
          disabled={!item.storagePath || isBusy}
          onClick={() => onPreview(item.storagePath)}
        >
          <ExternalLink size={15} /> Preview
        </button>
        <button
          className="button button-secondary"
          disabled={isBusy}
          onClick={() => void onAction(`reject-${item.id}`, 'reject_material', item.id)}
        >
          <X size={15} /> Reject
        </button>
        <button
          className="button button-primary"
          disabled={isBusy}
          onClick={() => void onAction(`approve-${item.id}`, 'approve_material', item.id)}
        >
          <Check size={15} /> Approve
        </button>
      </div>
    </article>
  );
}
