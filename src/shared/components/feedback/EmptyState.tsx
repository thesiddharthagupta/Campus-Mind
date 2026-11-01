import { Search } from 'lucide-react';
export function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="empty-state"><span className="empty-icon"><Search size={20} /></span><strong>{title}</strong><p>{detail}</p></div>; }
