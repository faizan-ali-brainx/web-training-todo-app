import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { useAppSelector } from '../app/hooks';
import { selectAuthStatus, selectIsAuthenticated } from '../features/auth/authSlice';

export function ProtectedRoute() {
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (status === 'loading') return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
