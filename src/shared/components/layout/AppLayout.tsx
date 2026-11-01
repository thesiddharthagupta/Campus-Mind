import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SearchOverlay } from '../../components/search/SearchOverlay';
export function AppLayout() { const [collapsed, setCollapsed] = useState(false); const [searchOpen, setSearchOpen] = useState(false); return <div className="app-shell"><Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} /><div className="main-column"><Topbar onSearch={() => setSearchOpen(true)} /><main className="page-content"><Outlet /></main><footer className="app-footer"><span>© {new Date().getFullYear()} CampusMind</span><span>Developed by <a href="https://www.linkedin.com/in/thesiddharthgupta/" target="_blank" rel="noopener noreferrer">Siddharth Gupta</a></span></footer></div>{searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}</div>; }
