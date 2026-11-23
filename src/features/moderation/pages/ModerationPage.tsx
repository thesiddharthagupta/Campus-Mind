import { useEffect, useState } from 'react';
import { FileText, Flag, RefreshCw } from 'lucide-react';
import { getMaterialPreviewUrl } from '../../materials/services/materialService';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import {
  performModerationAction,
  loadModerationQueue,
  type ModerationAction,
  type ModerationQueue,
} from '../services/moderationService';
import { PendingMaterialItem } from '../components/PendingMaterialItem';
import { ModerationReportItem } from '../components/ModerationReportItem';

const emptyQueue: ModerationQueue = { materials: [], reports: [] };

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
      const url = await getMaterialPreviewUrl(storagePath);
      preview.location.href = url;
    } catch (cause) {
      preview.close();
      setError(cause instanceof Error ? cause.message : 'Could not open preview.');
    }
  }

  const pendingCount = queue.materials.length;
  const reportsCount = queue.reports.length;

  return (
    <div className="feature-page moderation-page">
      <div className="feature-header">
        <div>
          <span className="eyebrow">COMMUNITY TRUST & SAFETY</span>
          <h1>Review queue</h1>
          <p className="page-subtitle">Inspect pending study resources and resolve community flags.</p>
        </div>
        <button
          className="button button-ghost"
          onClick={() => void refresh(true)}
          disabled={refreshing || loading}
        >
          <RefreshCw size={15} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh queue'}
        </button>
      </div>

      <div className="moderation-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'materials'}
          className={`mod-tab ${tab === 'materials' ? 'active' : ''}`}
          onClick={() => setTab('materials')}
        >
          <FileText size={16} /> Pending uploads <span>{pendingCount}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'reports'}
          className={`mod-tab ${tab === 'reports' ? 'active' : ''}`}
          onClick={() => setTab('reports')}
        >
          <Flag size={16} /> Reports <span>{reportsCount}</span>
        </button>
      </div>

      {error && <div className="inline-error" role="alert">{error}</div>}

      {loading ? (
        <div className="materials-loading">
          <span className="loading-spinner" />Loading review queue…
        </div>
      ) : tab === 'materials' ? (
        pendingCount === 0 ? (
          <EmptyState
            title="The upload queue is all clear"
            detail="When students share notes, study guides, or past papers, they will appear here for review before publishing."
          />
        ) : (
          <div className="moderation-list">
            {queue.materials.map((item) => (
              <PendingMaterialItem
                key={item.id}
                item={item}
                isBusy={busyKey === `approve-${item.id}` || busyKey === `reject-${item.id}`}
                onAction={(k, a, mId) => act(k, a, mId)}
                onPreview={openPreview}
              />
            ))}
          </div>
        )
      ) : reportsCount === 0 ? (
        <EmptyState
          title="No open reports"
          detail="Community reports on inaccurate, copyrighted, or inappropriate materials will appear here for review."
        />
      ) : (
        <div className="moderation-list">
          {queue.reports.map((report) => (
            <ModerationReportItem
              key={report.id}
              report={report}
              isBusy={busyKey === `remove-${report.id}` || busyKey === `resolve-${report.id}` || busyKey === `dismiss-${report.id}`}
              onAction={(k, a, mId, rId) => act(k, a, mId, rId)}
              onPreview={openPreview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
