import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { useAppSelector } from '../app/hooks';
import { selectAuthStatus, selectIsAuthenticated } from '../features/auth/authSlice';

// Layout route guarding every nested route: shows a spinner while the session
// is still being checked, redirects to /login if unauthenticated, otherwise
// renders the matched child route via <Outlet />.
export function ProtectedRoute() {
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (status === 'loading') return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
