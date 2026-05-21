import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ROUTES } from '@/constants/routes';
import type { HeroSceneState } from '@/components/three/HeroScene';

const HeroScene = lazy(() => import('@/components/three/HeroScene'));

gsap.registerPlugin(ScrollTrigger);

function SceneFallback() {
  return <div aria-hidden className="absolute inset-0 bg-hero-bg" />;
}

const FEATURE_HIGHLIGHTS = [
  {
    title: 'Un click, una clase',
    line: 'Tus alumnos reservan sin llamar por teléfono.',
  },
  {
    title: 'Todo el equipo, alineado',
    line: 'Estudiante, instructor y admin en un solo panel.',
  },
  {
    title: 'Horarios que no fallan',
    line: 'Disponibilidad al instante. Cero dobles reservas.',
  },
] as const;

/**
 * HeroSection — primer impacto de la landing.
 *
 * Estructura tipo "Apple product story":
 *   - Contenedor principal de 250vh (en mobile vuelve a 100vh, sin animación).
 *   - Canvas R3F en `sticky top-0 h-screen` que ocupa todo el viewport.
 *   - Texto "ConduPro" + tagline encima del carro al inicio.
 *   - Bullets de features que aparecen entre el 30 % y 70 % del scroll.
 *   - El carro lo coreografía `HeroScene` leyendo `stateRef`.
 *
 * El estado del scroll se almacena en un ref para evitar re-renders de React
 * en cada frame; el canvas lo consume directamente en su `useFrame`.
 */
export function HeroSection() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Ref consumido por <HeroScene/> dentro del Canvas.
  const sceneStateRef = useRef<HeroSceneState>({ progress: 0, isMobile: false });

  /** Al volver desde login/register: scroll arriba, progress 0 y refresco de ScrollTrigger. */
  useEffect(() => {
    sceneStateRef.current.progress = 0;
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh(true));
    return () => cancelAnimationFrame(id);
  }, [location.key]);

  // Detectar mobile.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = () => {
      setIsMobile(mq.matches);
      sceneStateRef.current.isMobile = mq.matches;
    };
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ScrollTrigger principal: setea progress + anima el texto.
  useEffect(() => {
    if (isMobile || reduced) {
      // En mobile o con reduced-motion no hay coreografía.
      sceneStateRef.current.progress = 0;
      return;
    }

    const ctx = gsap.context(() => {
      // Estado inicial del texto.
      gsap.set(featuresRef.current, { opacity: 0 });
      gsap.set('.feature-bullet', { opacity: 0, x: -48 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            sceneStateRef.current.progress = self.progress;
          },
        },
      });

      // 0 → 30 %  el texto principal desaparece y se hace zoom.
      tl.to(heroTextRef.current, { opacity: 0, y: -40, duration: 0.3 }, 0)
        .to(ctaRef.current, { opacity: 0, y: -20, duration: 0.3 }, 0)
        // 30 → 70 %  aparecen los bullets desde la izquierda.
        .to(featuresRef.current, { opacity: 1, duration: 0.1 }, 0.3)
        .to('.feature-bullet', { opacity: 1, x: 0, duration: 0.5, stagger: 0.12 }, 0.32)
        // 70 → 100 %  fade-out de los bullets para preparar la siguiente sección.
        .to('.feature-bullet', { opacity: 0, y: -10, duration: 0.2 }, 0.78);
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile, reduced]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative w-full bg-hero-bg text-white"
      style={{ height: isMobile || reduced ? '100vh' : '250vh' }}
    >
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
      >
        {/* Canvas 3D */}
        <Suspense fallback={<SceneFallback />}>
          <HeroScene
            key={location.key}
            className="absolute inset-0"
            stateRef={sceneStateRef}
          />
        </Suspense>

        {/* Scrim superior para el título */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 22%, transparent 42%)',
          }}
        />
        {/* Halo suave detrás del carro (lado derecho) para que no se pierda en negro */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'radial-gradient(ellipse 55% 45% at 72% 58%, rgba(55,58,68,0.55) 0%, rgba(20,20,24,0.2) 45%, transparent 70%)',
          }}
        />

        {/* ─── Overlay HTML — texto arriba, carro visible abajo ─── */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center px-6 pt-28 text-center sm:pt-32 md:pt-36">
          <div ref={heroTextRef} className="pointer-events-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-balance text-5xl font-semibold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)] sm:text-6xl md:text-7xl"
            >
              ConduPro
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-5 max-w-xl text-balance text-base font-normal text-white/75 sm:text-lg"
            >
              Gestión inteligente para escuelas de conducción.
            </motion.p>

            <div
              ref={ctaRef}
              className="pointer-events-auto mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
            >
              <Link
                to={ROUTES.REGISTER}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-bg-primary px-6 text-sm font-medium text-text-primary transition-colors duration-200 hover:bg-bg-secondary"
              >
                Empezar gratis
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-medium text-white/85 transition-colors duration-200 hover:border-white/40 hover:text-white"
              >
                Ver características
              </a>
            </div>
          </div>

          {/* Highlights al hacer scroll (escritorio) */}
          {!isMobile && !reduced ? (
            <ul
              ref={featuresRef}
              className="pointer-events-none absolute left-6 top-1/2 max-w-md -translate-y-1/2 space-y-10 text-left sm:left-10 md:left-16 lg:left-20"
            >
              {FEATURE_HIGHLIGHTS.map((item, i) => (
                <li key={item.title} className="feature-bullet space-y-2">
                  <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
                    0{i + 1}
                  </span>
                  <p className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                    {item.title}
                  </p>
                  <p className="text-base leading-relaxed text-white/60 sm:text-lg">
                    {item.line}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
