import { useEffect, useState } from 'react';
import { Check, ExternalLink, FileText, Flag, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { getMaterialPreviewUrl } from '../../materials/services/materialService';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { performModerationAction, loadModerationQueue, type ModerationAction, type ModerationMaterial, type ModerationQueue, type ModerationReport } from '../services/moderationService';

const emptyQueue: ModerationQueue = { materials: [], reports: [] };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function sizeLabel(bytes: number | null) {
  if (!bytes) return 'File size unavailable';
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function resourceLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

export function ModerationPage() {
  const [queue, setQueue] = useState<ModerationQueue>(emptyQueue);
  const [tab, setTab] = useState<'materials' | 'reports'>('materials');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');

  async function refresh(showSpinner = true) {
    if (showSpinner) setRefreshing(true);
    setError('');
    try {
      setQueue(await loadModerationQueue());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the review queue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void refresh(false); }, []);

  async function act(key: string, action: ModerationAction, materialId?: string, reportId?: string) {
    setBusyKey(key);
    setError('');
    try {
      await performModerationAction(action, materialId, reportId);
      await refresh(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not complete this review action.');
    } finally {
      setBusyKey('');
    }
  }

  async function openPreview(storagePath: string | null) {
    if (!storagePath) return;
    const preview = window.open('about:blank', '_blank');
    if (!preview) {
      setError('Allow pop-ups to open the private file preview.');
      return;
    }
    preview.opener = null;
    try {
      preview.location.href = await getMaterialPreviewUrl(storagePath);
    } catch (cause) {
      preview.close();
      setError(cause instanceof Error ? cause.message : 'Could not open this material.');
    }
  }

  const activeCount = tab === 'materials' ? queue.materials.length : queue.reports.length;

  return <div className="feature-page moderation-page">
    <div className="feature-header"><div><span className="eyebrow">COMMUNITY REVIEW</span><h1>Review queue</h1><p className="page-subtitle">Check new study materials and reports from students.</p></div><button className="button" onClick={() => void refresh()} disabled={refreshing}><RefreshCw size={15} className={refreshing ? 'spinning' : ''} />Refresh queue</button></div>
    <div className="moderation-trust"><ShieldCheck size={17} /><span>Review actions are recorded for accountability.</span></div>
    {error && <div className="inline-error" role="alert">{error}</div>}
    <div className="moderation-tabs" role="tablist" aria-label="Review queue types">
      <button role="tab" aria-selected={tab === 'materials'} className={tab === 'materials' ? 'selected' : ''} onClick={() => setTab('materials')}><FileText size={16} />Pending materials <span>{queue.materials.length}</span></button>
      <button role="tab" aria-selected={tab === 'reports'} className={tab === 'reports' ? 'selected' : ''} onClick={() => setTab('reports')}><Flag size={16} />Reports <span>{queue.reports.length}</span></button>
    </div>
    <div className="moderation-list-heading"><span>{tab === 'materials' ? 'Uploads awaiting review' : 'Reports awaiting review'}</span><span>{activeCount} {activeCount === 1 ? 'item' : 'items'}</span></div>
    {loading ? <div className="materials-loading"><span className="loading-spinner" />Loading the review queue…</div> : tab === 'materials' ? queue.materials.length ? <div className="moderation-list">{queue.materials.map((item) => <MaterialReviewCard key={item.id} item={item} busy={busyKey === item.id} onPreview={() => void openPreview(item.storagePath)} onAction={(action) => void act(item.id, action, item.id)} />)}</div> : <EmptyState title="No materials need review" detail="New uploads awaiting approval will appear here." /> : queue.reports.length ? <div className="moderation-list">{queue.reports.map((report) => <ReportReviewCard key={report.id} report={report} busy={busyKey === report.id} onPreview={() => void openPreview(report.material.storagePath)} onAction={(action) => void act(report.id, action, report.materialId, report.id)} onRemove={() => void act(report.id, 'remove_material', report.materialId, report.id)} />)}</div> : <EmptyState title="No open reports" detail="Reports submitted by students will appear here." />}
  </div>;
}

function MaterialReviewCard({ item, busy, onPreview, onAction }: { item: ModerationMaterial; busy: boolean; onPreview: () => void; onAction: (action: ModerationAction) => void }) {
  return <article className="moderation-card">
    <div className="moderation-card-main"><div className="moderation-card-icon"><FileText size={19} /></div><div className="moderation-card-copy"><div className="moderation-tags"><span>{item.subject}</span><span>{resourceLabel(item.resourceType)}</span></div><h2>{item.title}</h2><p>{item.description}</p><small>Submitted {dateLabel(item.createdAt)} · {sizeLabel(item.byteSize)}</small></div></div>
    <div className="moderation-card-actions">{item.storagePath && <button className="button" onClick={onPreview}><ExternalLink size={14} />Preview file</button>}<button className="button moderation-reject" disabled={busy} onClick={() => onAction('reject_material')}>{busy ? 'Saving…' : 'Reject'}</button><button className="button button-primary" disabled={busy} onClick={() => onAction('approve_material')}><Check size={14} />{busy ? 'Saving…' : 'Approve'}</button></div>
  </article>;
}

function ReportReviewCard({ report, busy, onPreview, onAction, onRemove }: { report: ModerationReport; busy: boolean; onPreview: () => void; onAction: (action: ModerationAction) => void; onRemove: () => void }) {
  const canRemove = report.material.status === 'pending' || report.material.status === 'published';
  return <article className="moderation-card report-review-card">
    <div className="moderation-card-main"><div className="moderation-card-icon report-review-icon"><Flag size={19} /></div><div className="moderation-card-copy"><div className="moderation-tags"><span>{report.material.subject}</span><span>{report.status === 'reviewing' ? 'In review' : 'Open report'}</span></div><h2>{report.material.title}</h2><p className="report-reason">{report.reason}</p>{report.details && <p>{report.details}</p>}<small>Reported {dateLabel(report.createdAt)} · {resourceLabel(report.material.resourceType)}</small></div></div>
    <div className="moderation-card-actions">{report.material.storagePath && <button className="button" onClick={onPreview}><ExternalLink size={14} />Preview file</button>}<button className="button" disabled={busy} onClick={() => onAction('dismiss_report')}><X size={14} />{busy ? 'Saving…' : 'Dismiss'}</button><button className="button" disabled={busy} onClick={() => onAction('resolve_report')}>{busy ? 'Saving…' : 'Resolve report'}</button>{canRemove && <button className="button moderation-reject" disabled={busy} onClick={onRemove}>Remove material</button>}</div>
  </article>;
}
