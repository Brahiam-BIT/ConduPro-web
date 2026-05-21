import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/providers/ToastProvider';

const SESSION_KEY = 'condupro:welcome-toast:shown';

/**
 * useWelcomeToast — dispara un toast de bienvenida una única vez por sesión
 * cuando el usuario está autenticado.
 *
 * Implementación:
 *  - Marca en `sessionStorage` que ya se mostró el toast en esta sesión.
 *  - Si el storage está limpio (por ejemplo, recién hubo login o se abrió
 *    una pestaña nueva), muestra "Bienvenido, {firstName} 👋".
 *  - Idempotente entre re-renders gracias a un `useRef` interno.
 *
 * Diseñado para montarse en el `AppShell` (root del dashboard autenticado).
 */
export function useWelcomeToast() {
  const { user } = useAuth();
  const toast = useToast();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (!user?.firstName) return;
    if (typeof window === 'undefined') return;
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === '1') return;
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // sessionStorage puede no estar disponible (modo incógnito estricto);
      // en ese caso seguimos: el `fired.current` evita múltiples disparos.
    }
    fired.current = true;
    toast.success(`Bienvenido, ${user.firstName} 👋`, 'Buena ruta hoy.');
  }, [user, toast]);
}
