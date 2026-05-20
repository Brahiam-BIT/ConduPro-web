import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_DEFAULT_ROUTE } from '@/constants/routes';
import type { Role } from '@/constants/roles';

/**
 * Rutas públicas (login/register).
 * Si el usuario ya está autenticado, redirige a su dashboard según rol.
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_DEFAULT_ROUTE[user.role as Role]} replace />;
  }

  return <>{children}</>;
}
