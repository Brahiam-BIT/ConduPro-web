import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  /** Salta a un selector / posición usando Lenis (o `window.scrollTo` si está apagado). */
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number; immediate?: boolean }) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: (target, opts) => {
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: opts?.immediate ? 'auto' : 'smooth' });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el && 'scrollIntoView' in el) {
      (el as HTMLElement).scrollIntoView({ behavior: opts?.immediate ? 'auto' : 'smooth', block: 'start' });
    }
  },
});

interface SmoothScrollProviderProps {
  children: ReactNode;
  /**
   * Si es `false`, no se activa Lenis y se cae al scroll nativo
   * (útil para zonas internas como el dashboard que ya usan scroll nativo).
   */
  enabled?: boolean;
}

/**
 * SmoothScrollProvider — activa el smooth-scroll global con Lenis y lo
 * conecta al ticker de GSAP para que `ScrollTrigger` quede sincronizado.
 *
 * Sólo debe envolver páginas públicas (landing, login, register).
 * Respeta `prefers-reduced-motion`.
 */
export function SmoothScrollProvider({ children, enabled = true }: SmoothScrollProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || reducedMotion) {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.2,
      smoothWheel: true,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled, reducedMotion]);

  const scrollTo: SmoothScrollContextValue['scrollTo'] = (target, opts) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target as never, { offset: opts?.offset ?? 0, immediate: opts?.immediate ?? false });
      return;
    }
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: opts?.immediate ? 'auto' : 'smooth' });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el && 'scrollIntoView' in el) {
      (el as HTMLElement).scrollIntoView({ behavior: opts?.immediate ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
