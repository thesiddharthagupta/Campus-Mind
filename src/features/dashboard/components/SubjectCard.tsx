import { ArrowUpRight, Braces, Cpu, Database, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Subject } from '../../../shared/types/common';
import { ProgressBar } from '../../../shared/components/ui/ProgressBar';
const icons = { database: Database, braces: Braces, network: Network, cpu: Cpu } as const;
export function SubjectCard({ subject }: { subject: Subject }) { const Icon = icons[subject.icon as keyof typeof icons] ?? Database; return <Link className="subject-card" to="/academic" aria-label={`Open ${subject.name}, ${subject.progress}% complete`}><div className="subject-top"><span className={`subject-icon ${subject.tint}`}><Icon size={19}/></span><span className="subject-more" aria-hidden="true"><ArrowUpRight size={16}/></span></div><span className="subject-code">{subject.code} <i>·</i> {subject.modules} modules</span><h3>{subject.name}</h3><div className="subject-progress-label"><span>Course progress</span><strong>{subject.progress}%</strong></div><ProgressBar value={subject.progress} color={subject.tint === 'mint' ? '#55a58c' : subject.tint === 'peach' ? '#d89468' : subject.tint === 'blue' ? '#7494ca' : '#8775d5'}/></Link>; }
