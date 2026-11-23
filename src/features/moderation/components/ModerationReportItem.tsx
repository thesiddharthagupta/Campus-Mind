import { Check, ExternalLink, Flag, X } from 'lucide-react';
import type { ModerationAction, ModerationReport } from '../types/moderation.types';

type ModerationReportItemProps = {
  report: ModerationReport;
  isBusy: boolean;
  onAction: (key: string, action: ModerationAction, materialId?: string, reportId?: string) => Promise<void>;
  onPreview: (storagePath: string | null) => void;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function ModerationReportItem({ report, isBusy, onAction, onPreview }: ModerationReportItemProps) {
  return (
    <article className="moderation-item report" key={report.id}>
      <div className="moderation-item-main">
        <div className="moderation-item-head">
          <span className="report-badge"><Flag size={13} /> {report.reason}</span>
          <span className="material-subject">{report.material.subject}</span>
          <span className="moderation-date">{dateLabel(report.createdAt)}</span>
        </div>
        <h3>{report.material.title}</h3>
        <p>{report.details || 'No additional details submitted with this report.'}</p>
        <div className="moderation-meta">
          <span>Material status: <strong>{report.material.status}</strong></span>
        </div>
      </div>
      <div className="moderation-actions">
        <button
          className="button button-ghost"
          disabled={!report.material.storagePath || isBusy}
          onClick={() => onPreview(report.material.storagePath)}
        >
          <ExternalLink size={15} /> Preview material
        </button>
        <button
          className="button button-secondary"
          disabled={isBusy}
          onClick={() => void onAction(`dismiss-${report.id}`, 'dismiss_report', undefined, report.id)}
        >
          <X size={15} /> Dismiss
        </button>
        <button
          className="button button-secondary"
          disabled={isBusy}
          onClick={() => void onAction(`resolve-${report.id}`, 'resolve_report', undefined, report.id)}
        >
          <Check size={15} /> Mark resolved
        </button>
        <button
          className="button button-primary danger"
          disabled={isBusy}
          onClick={() => void onAction(`remove-${report.id}`, 'remove_material', report.material.id, report.id)}
        >
          Remove material
        </button>
      </div>
    </article>
  );
}
