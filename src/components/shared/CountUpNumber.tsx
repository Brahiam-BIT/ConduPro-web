import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';

export interface CountUpNumberProps {
  /** Valor final al que debe llegar el contador. */
  value: number;
  /** Duración de la animación en segundos (default 1.5). */
  duration?: number;
  /** Decimales a mantener mientras anima (default 0). */
  decimals?: number;
  /** Prefijo antes del número (ej. "$"). */
  prefix?: string;
  /** Sufijo después del número (ej. "+", "%", "h"). */
  suffix?: string;
  /**
   * Si true (default), espera a que el elemento entre al viewport para animar.
   * Útil para count-ups en dashboards que no siempre están a la vista.
   */
  whenInView?: boolean;
  /** Localización para `Intl.NumberFormat`. Default `es-CO`. */
  locale?: string;
  className?: string;
}

function formatNumber(value: number, decimals: number, locale: string) {
  if (decimals === 0) return Math.round(value).toLocaleString(locale);
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * CountUpNumber — anima un número desde 0 hasta `value` con GSAP cuando
 * entra al viewport (por defecto). Respeta `prefers-reduced-motion`
 * mostrando el valor final sin animación.
 *
 * Pensado para métricas del dashboard: ligero, sin dependencias extra de
 * librerías de "counter" — usa la timeline de GSAP que ya está en bundle.
 */
export function CountUpNumber({
  value,
  duration = 1.5,
  decimals = 0,
  prefix,
  suffix,
  whenInView = true,
  locale = 'es-CO',
  className,
}: CountUpNumberProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4, skip: !whenInView });
  const lastTargetRef = useRef<number>(reduced ? value : 0);

  useEffect(() => {
    if (whenInView && !inView) return;
    if (reduced) {
      setDisplay(value);
      lastTargetRef.current = value;
      return;
    }
    const from = lastTargetRef.current;
    const obj = { v: from };
    const tween = gsap.to(obj, {
      v: value,
      duration,
      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      onUpdate: () => setDisplay(obj.v),
      onComplete: () => setDisplay(value),
    });
    lastTargetRef.current = value;
    return () => {
      tween.kill();
    };
  }, [value, duration, reduced, inView, whenInView]);

  return (
    <span ref={whenInView ? ref : undefined} className={className}>
      {prefix ?? ''}
      {formatNumber(display, decimals, locale)}
      {suffix ?? ''}
    </span>
  );
}

export default CountUpNumber;
