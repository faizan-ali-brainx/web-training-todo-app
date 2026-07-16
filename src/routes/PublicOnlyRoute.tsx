import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated } from '../features/auth/authSlice';

// Keeps already-logged-in users off the login/signup pages.
export function PublicOnlyRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) return <Navigate to="/todos" replace />;

  return <Outlet />;
}
