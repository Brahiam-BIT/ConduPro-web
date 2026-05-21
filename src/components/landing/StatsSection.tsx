import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import gsap from 'gsap';
import { useReducedMotion } from 'framer-motion';

interface Stat {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
}

const STATS: Stat[] = [
  { target: 200, suffix: '+', label: 'Usuarios activos' },
  { target: 99.5, suffix: '%', decimals: 1, label: 'Disponibilidad' },
  { target: 800, prefix: '< ', suffix: 'ms', label: 'Tiempo de respuesta' },
  { target: 3, label: 'Roles integrados' },
];

function formatNumber(value: number, decimals = 0) {
  if (decimals === 0) return Math.round(value).toLocaleString('es-CO');
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** StatsSection — 4 números grandes con count-up. Sin colores, sólo tipografía. */
export function StatsSection() {
  return (
    <section
      id="stats"
      className="border-y border-border bg-bg-primary py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-12 px-6 sm:px-10 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatItem key={s.label} stat={s} />
        ))}
      </div>
    </section>
  );
}

function StatItem({ stat }: { stat: Stat }) {
  const [value, setValue] = useState(0);
  const reduced = useReducedMotion();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    if (reduced) {
      setValue(stat.target);
      return;
    }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: stat.target,
      duration: 1.4,
      ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
      onUpdate: () => setValue(obj.v),
      onComplete: () => setValue(stat.target),
    });
    return () => {
      tween.kill();
    };
  }, [inView, reduced, stat.target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-5xl font-semibold tracking-tight text-text-primary sm:text-6xl md:text-7xl">
        {stat.prefix ?? ''}
        {formatNumber(value, stat.decimals ?? 0)}
        {stat.suffix ?? ''}
      </p>
      <p className="mt-3 text-sm font-medium text-text-secondary">{stat.label}</p>
    </div>
  );
}

export default StatsSection;
