import { Suspense, lazy, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useSmoothScroll } from '@/providers/SmoothScrollProvider';
import { ROUTES } from '@/constants/routes';

const HeroScene = lazy(() => import('@/components/three/HeroScene'));

function SceneFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-gradient-dynamic-radial"
      style={{ background: 'radial-gradient(circle at 30% 30%, #7000FF22, transparent 60%), #04020F' }}
    />
  );
}

/**
 * Componente helper que envuelve un texto en spans por letra para animarlas
 * con stagger via GSAP, conservando el flujo de inline y los espacios.
 */
function SplitLetters({
  text,
  className,
  letterClassName = '',
  gradient = false,
}: {
  text: string;
  className?: string;
  letterClassName?: string;
  gradient?: boolean;
}) {
  return (
    <span className={className}>
      {text.split('').map((ch, i) =>
        ch === ' ' ? (
          <span key={i} aria-hidden className="inline-block">
            &nbsp;
          </span>
        ) : (
          <span
            key={i}
            aria-hidden
            className={[
              'split-letter inline-block translate-y-[1em] opacity-0',
              gradient ? 'text-gradient-dynamic' : '',
              letterClassName,
            ].join(' ')}
          >
            {ch}
          </span>
        ),
      )}
      <span className="sr-only">{text}</span>
    </span>
  );
}

/**
 * HeroSection — primera vista de la landing (100vh).
 *
 * Composición:
 *  - Canvas R3F a fondo completo (`HeroScene`).
 *  - Overlay HTML con chip, heading split-letter (GSAP), subtítulo, CTAs.
 *  - Indicador "scroll down" con bounce animado.
 */
export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollTo } = useSmoothScroll();

  useGSAP(
    () => {
      const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

      if (reduced) {
        gsap.set(['.split-letter', subRef.current, chipRef.current, ctaRef.current, arrowRef.current], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease } });
      tl.from(chipRef.current, { opacity: 0, y: 14, duration: 0.6 }, 0)
        .to(
          '.split-letter',
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.03 },
          0.15,
        )
        .from(subRef.current, { opacity: 0, y: 16, duration: 0.5 }, 0.55)
        .from(ctaRef.current, { opacity: 0, y: 16, duration: 0.5 }, 0.7)
        .from(arrowRef.current, { opacity: 0, y: -12, duration: 0.5 }, 0.95);
    },
    { scope: containerRef, dependencies: [reduced] },
  );

  // Mantener el arrow oscilando una vez que termina su entrada.
  useEffect(() => {
    if (reduced) return;
    if (!arrowRef.current) return;
    const tween = gsap.to(arrowRef.current.querySelector('.arrow-inner'), {
      y: 8,
      repeat: -1,
      yoyo: true,
      duration: 0.9,
      ease: 'sine.inOut',
    });
    return () => {
      tween.kill();
    };
  }, [reduced]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative isolate flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-brand-dark"
    >
      {/* Canvas 3D */}
      <Suspense fallback={<SceneFallback />}>
        <HeroScene className="absolute inset-0 -z-10" />
      </Suspense>

      {/* Vignette + grid overlay para el contraste del texto */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] bg-grid-dynamic opacity-[0.18]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(4,2,15,0) 30%, rgba(4,2,15,0.7) 75%, rgba(4,2,15,0.95) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center sm:px-10">
        <motion.div
          ref={chipRef}
          className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-surface/40 px-4 py-1.5 font-mono-brand text-[11px] uppercase tracking-[0.35em] text-brand-light/80 backdrop-blur"
        >
          <span className="size-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_#0AFFE0]" />
          ✦ Plataforma de conducción Nº1
        </motion.div>

        <h1 className="mt-7 font-hero text-5xl font-bold leading-[1.02] text-brand-light sm:text-7xl md:text-8xl">
          <span className="block overflow-hidden">
            <SplitLetters text="Domina" />
          </span>
          <span className="block overflow-hidden">
            <SplitLetters text="la " />
            <SplitLetters text="carretera." gradient />
          </span>
        </h1>

        <p
          ref={subRef}
          className="mt-7 max-w-2xl text-balance text-base text-brand-light/75 sm:text-lg"
        >
          Agenda, gestiona y aprende con la plataforma todo-en-uno para
          escuelas de conducción modernas. Tres roles, un mismo lenguaje.
        </p>

        <div ref={ctaRef} className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to={ROUTES.REGISTER}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-dynamic px-7 font-mono-brand text-xs font-semibold uppercase tracking-[0.22em] text-brand-dark transition-all duration-300 ease-brand hover:translate-y-[-2px] hover:shadow-[0_18px_44px_-12px_rgba(10,255,224,0.55)]"
          >
            Empieza gratis
            <ArrowRight className="size-4 transition-transform duration-300 ease-brand group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('#features', { offset: -80 });
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-brand-mid/70 bg-brand-surface/30 px-6 text-sm font-medium text-brand-light/85 transition-all duration-300 ease-brand hover:border-brand-primary/40 hover:text-brand-light"
          >
            Ver demo
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={arrowRef}
        aria-hidden
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="arrow-inner grid place-items-center gap-2 text-brand-light/55">
          <span className="font-mono-brand text-[10px] uppercase tracking-[0.4em]">Scroll</span>
          <ChevronDown className="size-4" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
