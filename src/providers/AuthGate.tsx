import type { ReactNode } from 'react';
import { AuthBootScreen } from '@/components/auth/AuthBootScreen';
import { useAuth } from '@/hooks/useAuth';

/**
 * Bloquea el render del router hasta que el refresh silencioso termine.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <AuthBootScreen />;
  }

  return <>{children}</>;
}
