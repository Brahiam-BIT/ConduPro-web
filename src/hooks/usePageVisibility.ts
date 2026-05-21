import { useEffect, useState } from 'react';

/**
 * Suscribe al `visibilitychange` del documento. Devuelve `true` cuando la
 * pestaña está visible y `false` cuando pasa a background.
 *
 * Se usa para pausar el render-loop de Three.js (frameloop "demand") y
 * timelines pesadas cuando el usuario sale de la pestaña.
 */
export function usePageVisibility(): boolean {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.visibilityState !== 'hidden';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return visible;
}
