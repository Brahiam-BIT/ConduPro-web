import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/constants/roles';
import { ROLE_DEFAULT_ROUTE, ROUTES } from '@/constants/routes';

/**
 * Role-based guard.
 * - If the user's role isn't in `allow`, redirect them to /unauthorized or to
 *   their own default route, depending on `redirectTo`.
 */
export function RoleRoute({
  allow,
  redirectTo = 'default',
  children,
}: {
  allow: Role[];
  redirectTo?: 'unauthorized' | 'default';
  children: ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!allow.includes(user.role)) {
    if (redirectTo === 'default') {
      return <Navigate to={ROLE_DEFAULT_ROUTE[user.role]} replace />;
    }
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }
  return <>{children}</>;
}
