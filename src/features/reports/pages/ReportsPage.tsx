import { useState } from 'react';
import { CheckCircle2, Flag, ShieldCheck } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import { submitContentReport } from '../services/reportService';
import { ReportForm } from '../components/ReportForm';

export function ReportsPage() {
  const { materials } = useCampusData();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleReportSubmit(materialId: string, reason: string, details: string) {
    setError('');
    setSending(true);
    try {
      await submitContentReport(materialId, reason, details);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your report could not be submitted.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="feature-page">
      <div className="feature-header">
        <div>
          <span className="eyebrow">HELP KEEP CAMPUSMIND USEFUL</span>
          <h1>Help & reports</h1>
          <p className="page-subtitle">Let us know when something needs attention.</p>
        </div>
        <span className="trust-badge"><ShieldCheck size={16} /> Community care</span>
      </div>

      <div className="report-layout">
        <section className="report-card">
          <span className="report-icon"><Flag size={20} /></span>
          <h2>Report a resource</h2>
          <p>Tell us about material that may be inaccurate, inappropriate, or shared without permission.</p>

          {sent ? (
            <div className="report-success">
              <CheckCircle2 size={20} />
              <strong>Thanks for letting us know.</strong>
              <span>Your report was sent to the moderation queue.</span>
              <button onClick={() => setSent(false)}>Submit another report</button>
            </div>
          ) : (
            <ReportForm
              materials={materials}
              onSubmit={handleReportSubmit}
              submitting={sending}
              error={error}
            />
          )}
        </section>

        <aside className="report-info">
          <div className="report-info-icon"><ShieldCheck size={19} /></div>
          <h3>Reports are reviewed with care.</h3>
          <p>CampusMind aims to make learning resources helpful, respectful, and properly attributed.</p>
          <ul>
            <li>Reports are reviewed by a moderator.</li>
            <li>We may temporarily restrict material while reviewing it.</li>
            <li>False reports can delay support for real concerns.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
