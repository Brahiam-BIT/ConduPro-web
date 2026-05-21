import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const BRAND_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface PageTransitionProps {
  children: ReactNode;
  /** Si se desea forzar una key distinta para el `AnimatePresence`. */
  routeKey?: string;
}

/**
 * PageTransition — anima la entrada/salida de páginas públicas usando
 * Framer Motion. Usa el `pathname` como `key` para detectar el cambio
 * de ruta.
 *
 *   initial: { opacity: 0, y: 20 }
 *   animate: { opacity: 1, y: 0  } -- 0.5s
 *   exit:    { opacity: 0, y:-20 } -- 0.3s
 *
 * Para la transición login→dashboard usar adicionalmente `useWipeOverlay`.
 */
export function PageTransition({ children, routeKey }: PageTransitionProps) {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const key = routeKey ?? location.pathname;

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: BRAND_EASE } }}
        exit={{ opacity: 0, y: -20, transition: { duration: 0.3, ease: BRAND_EASE } }}
        style={{ minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────
 * Wipe overlay — overlay negro full-screen para transiciones
 * fuertes (login → dashboard).
 *
 * Uso:
 *   1) Renderizar <WipeOverlayProvider> alto en el árbol (lo monta el router).
 *   2) En el handler post-login, llamar useWipeOverlay().play({ onComplete }).
 *
 * La animación es controlada por GSAP:
 *   - Fase A (entrada): clipPath top→100vh, 0.5s ease-brand
 *   - onComplete dispara navigate()
 *   - Fase B (salida):  clipPath 100vh→0vh, 0.55s ease-brand
 * ───────────────────────────────────────────────────────── */

interface WipeOverlayContextValue {
  play: (opts: { onComplete?: () => void }) => void;
}

const WipeOverlayContext = createContext<WipeOverlayContextValue | null>(null);

export function WipeOverlayProvider({ children }: { children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const play = useCallback<WipeOverlayContextValue['play']>(
    ({ onComplete }) => {
      const el = overlayRef.current;
      if (!el || reduced) {
        onComplete?.();
        return;
      }

      // Reset
      gsap.set(el, {
        display: 'block',
        clipPath: 'inset(0% 0% 100% 0%)',
        backgroundColor: '#04020F',
      });

      const tl = gsap.timeline({
        defaults: { ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      });
      tl.to(el, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.5,
        onComplete: () => {
          onComplete?.();
        },
      });
      tl.to(
        el,
        {
          clipPath: 'inset(100% 0% 0% 0%)',
          duration: 0.55,
          delay: 0.1,
          onComplete: () => {
            gsap.set(el, { display: 'none' });
          },
        },
      );
    },
    [reduced],
  );

  return (
    <WipeOverlayContext.Provider value={{ play }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'none',
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, #04020F 0%, #0D0A1E 50%, #04020F 100%)',
        }}
      />
    </WipeOverlayContext.Provider>
  );
}

export function useWipeOverlay(): WipeOverlayContextValue {
  const ctx = useContext(WipeOverlayContext);
  if (!ctx) {
    // Fallback no-op cuando se usa fuera del provider (no romper SSR/tests).
    return {
      play: ({ onComplete }) => {
        onComplete?.();
      },
    };
  }
  return ctx;
}

export default PageTransition;
