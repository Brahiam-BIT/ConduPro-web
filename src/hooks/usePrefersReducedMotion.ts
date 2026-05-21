import { useEffect, useState } from 'react';

/**
 * Devuelve `true` si el usuario tiene activado `prefers-reduced-motion: reduce`
 * en su sistema, escuchando cambios en vivo.
 *
 * Útil para apagar animaciones, post-processing y loops de partículas
 * pesados respetando accesibilidad.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  return reduced;
}
