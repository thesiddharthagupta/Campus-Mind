import { BookOpen, Brain, ChartNoAxesColumnIncreasing, FileText, GraduationCap, LayoutDashboard, LifeBuoy, PanelLeftClose, PanelLeftOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
const primary = [{ to: '/', label: 'Overview', icon: LayoutDashboard }, { to: '/academic', label: 'My subjects', icon: GraduationCap }, { to: '/materials', label: 'Study library', icon: BookOpen }, { to: '/notes', label: 'My notes', icon: FileText }, { to: '/practice', label: 'Practice', icon: Brain }, { to: '/progress', label: 'Progress', icon: ChartNoAxesColumnIncreasing }];
export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, role } = useAuth();
  const displayName=(user?.user_metadata?.display_name as string|undefined)||user?.email?.split('@')[0]||'Student';
  const initials=displayName.split(/\s+/).slice(0,2).map(part=>part[0]?.toUpperCase()).join('');
  return <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <div className="brand"><span className="brand-mark"><GraduationCap size={19} /></span>{!collapsed && <><span className="brand-name">campusmind</span><button className="collapse-button" onClick={onToggle} aria-label="Collapse sidebar"><PanelLeftClose size={17} /></button></>}</div>
    {collapsed && <button className="collapse-button collapsed-toggle" onClick={onToggle} aria-label="Expand sidebar"><PanelLeftOpen size={17} /></button>}
    <div className="workspace-label">{!collapsed && 'WORKSPACE'}</div>
    <nav className="nav-list" aria-label="Main navigation">{primary.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} title={collapsed ? label : undefined} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{!collapsed && label}</span>{to === '/materials' && !collapsed && <span className="nav-count">5</span>}</NavLink>)}{(role === 'moderator' || role === 'admin') && <NavLink to="/moderation" title={collapsed ? 'Review queue' : undefined} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><ShieldCheck size={18} /><span>{!collapsed && 'Review queue'}</span></NavLink>}</nav>
    <div className="sidebar-spacer" />
    {!collapsed && <div className="upgrade-card"><span className="upgrade-icon"><Sparkles size={15} /></span><strong>Keep your momentum</strong><p>See how you’re progressing across your courses.</p><Link to="/progress">View your progress <span>↗</span></Link><div className="upgrade-orb" /></div>}
    <div className="nav-list sidebar-bottom"><NavLink to="/reports" title={collapsed ? 'Help & reports' : undefined} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><LifeBuoy size={18} /><span>{!collapsed && 'Help & reports'}</span></NavLink></div>
    {!collapsed && <div className="profile-mini"><div className="avatar">{initials||'AS'}</div><div className="profile-copy"><strong>{displayName}</strong><span>{user?.email??'Computer Science · Year 2'}</span></div></div>}
  </aside>;
}
