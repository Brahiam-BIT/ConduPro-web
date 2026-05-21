import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';
import { BarChart3, CalendarCheck, TrendingUp, Users2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * ShowcaseSection — mockup del dashboard con parallax controlado por
 * `ScrollTrigger` (scrub: 1) y "floating cards" con métricas que flotan
 * encima usando keyframes CSS (`animate-float`).
 */
export function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const ease = 'none';
      // Parallax suave: el mockup sube ligeramente mientras se hace scroll.
      gsap.to(mockupRef.current, {
        y: -80,
        ease,
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
      className="relative isolate overflow-hidden bg-brand-dark py-32 sm:py-40"
    >
      {/* Glow lateral */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-[5] h-full w-[120vw] -translate-x-1/2 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(112,0,255,0.25) 0%, rgba(10,255,224,0.08) 35%, rgba(4,2,15,0) 70%)',
        }}
      />

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-mono-brand text-xs uppercase tracking-[0.4em] text-brand-primary">
            ✦ La plataforma en acción
          </p>
          <h2 className="font-hero text-4xl font-bold leading-[1.05] text-brand-light sm:text-5xl md:text-6xl">
            Un panel que <span className="text-gradient-dynamic">cuenta la historia.</span>
          </h2>
        </div>

        <div ref={mockupRef} className="relative">
          {/* Mockup del dashboard */}
          <div className="relative overflow-hidden rounded-3xl border border-brand-mid/60 bg-brand-surface shadow-[0_60px_120px_-30px_rgba(112,0,255,0.45)]">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-brand-mid/50 bg-brand-dark/40 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-rose-500/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <span className="font-mono-brand text-[10px] uppercase tracking-[0.3em] text-brand-light/40">
                ConduPro — Panel
              </span>
              <span className="font-mono-brand text-[10px] uppercase tracking-[0.3em] text-brand-light/40">
                {new Date().toLocaleDateString('es-CO', { dateStyle: 'medium' })}
              </span>
            </div>

            {/* Contenido mockup */}
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[220px_1fr]">
              {/* Sidebar */}
              <aside className="hidden flex-col gap-2 md:flex">
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
                      'rounded-xl px-3 py-2 text-sm transition-colors',
                      item.active
                        ? 'bg-gradient-dynamic-soft text-brand-light ring-1 ring-brand-primary/30'
                        : 'text-brand-light/55',
                    ].join(' ')}
                  >
                    {item.label}
                  </div>
                ))}
              </aside>

              {/* Main */}
              <div className="space-y-5">
                {/* KPI cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Clases', value: '324', delta: '+12%' },
                    { label: 'Ocupación', value: '87%', delta: '+4%' },
                    { label: 'Ingresos', value: '$24K', delta: '+9%' },
                    { label: 'Activos', value: '142', delta: '+18%' },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className="rounded-2xl border border-brand-mid/60 bg-brand-dark/50 p-4"
                    >
                      <p className="font-mono-brand text-[10px] uppercase tracking-[0.25em] text-brand-light/40">
                        {k.label}
                      </p>
                      <p className="mt-1.5 font-hero text-2xl font-semibold text-brand-light">{k.value}</p>
                      <p className="mt-1 text-[11px] text-brand-primary">{k.delta}</p>
                    </div>
                  ))}
                </div>

                {/* Chart mockup */}
                <div className="rounded-2xl border border-brand-mid/60 bg-brand-dark/40 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-hero text-sm font-semibold text-brand-light">Clases por día</p>
                    <span className="font-mono-brand text-[10px] uppercase tracking-[0.25em] text-brand-light/40">
                      Últimos 14 días
                    </span>
                  </div>
                  <svg viewBox="0 0 320 100" className="h-28 w-full">
                    <defs>
                      <linearGradient id="grad-line" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0AFFE0" />
                        <stop offset="100%" stopColor="#7000FF" />
                      </linearGradient>
                      <linearGradient id="grad-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0AFFE0" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0AFFE0" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,75 L25,60 L50,68 L75,40 L100,52 L125,30 L150,45 L175,25 L200,38 L225,20 L250,32 L275,12 L300,22 L320,8 L320,100 L0,100 Z"
                      fill="url(#grad-area)"
                    />
                    <path
                      d="M0,75 L25,60 L50,68 L75,40 L100,52 L125,30 L150,45 L175,25 L200,38 L225,20 L250,32 L275,12 L300,22 L320,8"
                      stroke="url(#grad-line)"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards encima del mockup */}
          <div className="pointer-events-none absolute -left-4 top-1/3 hidden -translate-y-1/2 md:block">
            <div className="animate-float rounded-2xl border border-brand-primary/30 bg-brand-surface/85 p-4 shadow-[0_24px_60px_-20px_rgba(10,255,224,0.5)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-brand-primary/15 text-brand-primary">
                  <CalendarCheck className="size-4" />
                </div>
                <div>
                  <p className="font-hero text-lg font-semibold text-brand-light">324</p>
                  <p className="text-[11px] text-brand-light/60">Clases este mes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-4 top-12 hidden md:block">
            <div className="animate-float-slow rounded-2xl border border-brand-secondary/40 bg-brand-surface/85 p-4 shadow-[0_24px_60px_-20px_rgba(112,0,255,0.5)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-brand-secondary/20 text-[#A675FF]">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <p className="font-hero text-lg font-semibold text-brand-light">98%</p>
                  <p className="text-[11px] text-brand-light/60">Puntualidad</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-2 bottom-10 hidden lg:block">
            <div className="animate-float rounded-2xl border border-brand-primary/30 bg-brand-surface/85 p-4 shadow-[0_24px_60px_-20px_rgba(10,255,224,0.45)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-brand-primary/15 text-brand-primary">
                  <Users2 className="size-4" />
                </div>
                <div>
                  <p className="font-hero text-lg font-semibold text-brand-light">142</p>
                  <p className="text-[11px] text-brand-light/60">Estudiantes activos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -left-2 bottom-16 hidden lg:block">
            <div className="animate-float-slow rounded-2xl border border-brand-secondary/40 bg-brand-surface/85 p-4 shadow-[0_24px_60px_-20px_rgba(112,0,255,0.5)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-brand-secondary/20 text-[#A675FF]">
                  <BarChart3 className="size-4" />
                </div>
                <div>
                  <p className="font-hero text-lg font-semibold text-brand-light">+24%</p>
                  <p className="text-[11px] text-brand-light/60">Ingresos vs ayer</p>
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
