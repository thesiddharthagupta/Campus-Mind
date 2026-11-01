import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

export function ProtectedRoute() {
  const { configured, loading, user } = useAuth();
  const location = useLocation();
  if (configured && loading) return <div className="auth-loading"><span className="loading-spinner"/><p>Preparing your study space…</p></div>;
  if (configured && !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
