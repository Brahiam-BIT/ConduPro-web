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
  { target: 800, prefix: '<', suffix: 'ms', label: 'Tiempo de respuesta' },
  { target: 3, label: 'Roles integrados' },
];

function formatNumber(value: number, decimals = 0) {
  if (decimals === 0) return Math.round(value).toLocaleString('es-CO');
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** StatsSection — métricas alineadas en grid simétrico, sin saltos al animar. */
export function StatsSection() {
  return (
    <section
      id="stats"
      className="border-y border-border bg-bg-primary py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-14 sm:gap-x-10 sm:gap-y-16 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0">
          {STATS.map((s) => (
            <li key={s.label}>
              <StatItem stat={s} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StatItem({ stat }: { stat: Stat }) {
  const [value, setValue] = useState(0);
  const reduced = useReducedMotion();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.35 });
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

  const formatted = formatNumber(value, stat.decimals ?? 0);

  return (
    <article
      ref={ref}
      className="flex h-full flex-col items-center justify-center text-center"
    >
      {/* Altura fija + tabular-nums evita que los números “bailen” al contar */}
      <p
        className="flex min-h-[3.25rem] items-baseline justify-center whitespace-nowrap font-semibold tabular-nums tracking-tight text-text-primary sm:min-h-[3.75rem] md:min-h-[4.25rem]"
        style={{ fontSize: 'clamp(2.25rem, 5vw, 4.5rem)', lineHeight: 1 }}
      >
        {stat.prefix ? (
          <span className="mr-1 text-[0.65em] font-medium text-text-secondary">
            {stat.prefix}
          </span>
        ) : null}
        <span>{formatted}</span>
        {stat.suffix ? (
          <span className="ml-0.5 text-[0.85em] font-semibold">{stat.suffix}</span>
        ) : null}
      </p>
      <p className="mt-4 max-w-[11rem] text-sm font-medium leading-snug text-text-secondary">
        {stat.label}
      </p>
    </article>
  );
}

export default StatsSection;
