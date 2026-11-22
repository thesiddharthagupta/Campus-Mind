import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

export function ModeratorRoute() {
  const { role, roleLoading } = useAuth();
  if (roleLoading) return <div className="auth-loading"><span className="loading-spinner" /><p>Checking review access…</p></div>;
  if (role !== 'moderator' && role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
