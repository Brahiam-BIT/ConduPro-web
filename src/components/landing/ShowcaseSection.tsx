import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * ShowcaseSection — mockup minimalista del dashboard sobre fondo blanco.
 * Parallax muy sutil (translateY -40) controlado por ScrollTrigger.
 */
export function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.to(mockupRef.current, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="bg-bg-secondary py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            La plataforma en acción
          </p>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Un panel que cuenta la historia.
          </h2>
        </div>

        <div ref={mockupRef}>
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-lg">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-border bg-bg-secondary px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#FF3B30]/70" />
                <span className="size-2.5 rounded-full bg-[#FF9500]/70" />
                <span className="size-2.5 rounded-full bg-[#34C759]/70" />
              </div>
              <span className="text-xs font-medium text-text-tertiary">
                ConduPro — Panel
              </span>
              <span className="text-xs text-text-tertiary">
                {new Date().toLocaleDateString('es-CO', { dateStyle: 'medium' })}
              </span>
            </div>

            {/* Contenido mockup */}
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[220px_1fr]">
              <aside className="hidden flex-col gap-1 md:flex">
                {[
                  { label: 'Dashboard', active: true },
                  { label: 'Clases', active: false },
                  { label: 'Estudiantes', active: false },
                  { label: 'Instructores', active: false },
                  { label: 'Reportes', active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={[
                      'rounded-lg px-3 py-2 text-sm transition-colors',
                      item.active
                        ? 'bg-accent/10 font-medium text-accent'
                        : 'text-text-secondary',
                    ].join(' ')}
                  >
                    {item.label}
                  </div>
                ))}
              </aside>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Clases', value: '324', delta: '+12%' },
                    { label: 'Ocupación', value: '87%', delta: '+4%' },
                    { label: 'Ingresos', value: '$24K', delta: '+9%' },
                    { label: 'Activos', value: '142', delta: '+18%' },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className="rounded-xl border border-border bg-white p-4"
                    >
                      <p className="text-xs font-medium text-text-secondary">{k.label}</p>
                      <p className="mt-1.5 text-2xl font-semibold text-text-primary">{k.value}</p>
                      <p className="mt-1 text-xs font-medium text-accent">{k.delta}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-primary">Clases por día</p>
                    <span className="text-xs text-text-secondary">Últimos 14 días</span>
                  </div>
                  <svg viewBox="0 0 320 100" className="h-28 w-full">
                    <defs>
                      <linearGradient id="grad-area-light" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0071E3" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0071E3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,75 L25,60 L50,68 L75,40 L100,52 L125,30 L150,45 L175,25 L200,38 L225,20 L250,32 L275,12 L300,22 L320,8 L320,100 L0,100 Z"
                      fill="url(#grad-area-light)"
                    />
                    <path
                      d="M0,75 L25,60 L50,68 L75,40 L100,52 L125,30 L150,45 L175,25 L200,38 L225,20 L250,32 L275,12 L300,22 L320,8"
                      stroke="#0071E3"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShowcaseSection;
