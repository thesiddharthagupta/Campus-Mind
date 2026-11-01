import { useState, type FormEvent } from 'react';
import { CheckCircle2, Flag, ShieldCheck } from 'lucide-react';
import { useCampusData } from '../../../app/providers';
import { useAuth } from '../../auth/hooks/useAuth';
import { submitContentReport } from '../services/reportService';

export function ReportsPage() {
  const { materials } = useCampusData();
  const { demoMode } = useAuth();
  const [sent, setSent] = useState(false);
  const [materialId, setMaterialId] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSending(true);
    try {
      if (!demoMode) await submitContentReport(materialId, reason, details);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your report could not be submitted.');
    } finally { setSending(false); }
  }

  return <div className="feature-page"><div className="feature-header"><div><span className="eyebrow">HELP KEEP CAMPUSMIND USEFUL</span><h1>Help & reports</h1><p className="page-subtitle">Let us know when something needs attention.</p></div><span className="trust-badge"><ShieldCheck size={16}/> Community care</span></div><div className="report-layout"><section className="report-card"><span className="report-icon"><Flag size={20}/></span><h2>Report a resource</h2><p>Tell us about material that may be inaccurate, inappropriate, or shared without permission.</p>{sent?<div className="report-success"><CheckCircle2 size={20}/><strong>Thanks for letting us know.</strong><span>{demoMode?'This report was recorded in the demo.':'Your report was sent to the moderation queue.'}</span><button onClick={()=>{setSent(false);setMaterialId('');setReason('');setDetails('');}}>Submit another report</button></div>:<form onSubmit={(event)=>void handleSubmit(event)}><label>Resource<select required value={materialId} onChange={(event)=>setMaterialId(event.target.value)}><option value="" disabled>Select a material</option>{materials.map((material)=><option key={material.id} value={material.id}>{material.title} · {material.subject}</option>)}</select></label><label>Reason<select required value={reason} onChange={(event)=>setReason(event.target.value)}><option value="" disabled>Choose a reason</option><option>Copyright or ownership concern</option><option>Inaccurate or misleading content</option><option>Inappropriate material</option><option>Spam or duplicate</option><option>Other</option></select></label><label>Additional details<textarea value={details} onChange={(event)=>setDetails(event.target.value)} placeholder="Share context that may help us review this report." rows={4}/></label>{error&&<p className="auth-error" role="alert">{error}</p>}<button className="button button-primary" type="submit" disabled={sending||!materials.length}>{sending?'Sending…':'Send report'}</button>{!materials.length&&<span className="report-hint">Add or browse a material before submitting a report.</span>}</form>}</section><aside className="report-info"><div className="report-info-icon"><ShieldCheck size={19}/></div><h3>Reports are reviewed with care.</h3><p>CampusMind aims to make learning resources helpful, respectful, and properly attributed.</p><ul><li>Reports are reviewed by a moderator.</li><li>We may temporarily restrict material while reviewing it.</li><li>False reports can delay support for real concerns.</li></ul>{demoMode&&<span className="demo-callout">Demo mode · Reports are not sent to a moderation service yet.</span>}</aside></div></div>;
}
