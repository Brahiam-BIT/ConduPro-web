import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ROUTES } from '@/constants/routes';
import type { HeroSceneState } from '@/components/three/HeroScene';

const HeroScene = lazy(() => import('@/components/three/HeroScene'));

gsap.registerPlugin(ScrollTrigger);

function SceneFallback() {
  return <div aria-hidden className="absolute inset-0 bg-hero-bg" />;
}

const FEATURE_BULLETS = [
  'Agendamiento automático',
  '3 roles integrados',
  'Disponibilidad en tiempo real',
];

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
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Ref consumido por <HeroScene/> dentro del Canvas.
  const sceneStateRef = useRef<HeroSceneState>({ progress: 0, isMobile: false });

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
      gsap.set('.feature-bullet', { opacity: 0, x: -24 });

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
        .to('.feature-bullet', { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 }, 0.32)
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
          <HeroScene className="absolute inset-0" stateRef={sceneStateRef} />
        </Suspense>

        {/* ─── Overlay HTML ───────────────────────────────────────── */}
        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center">
          <div ref={heroTextRef} className="pointer-events-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-balance text-6xl font-semibold tracking-tight text-white sm:text-7xl md:text-8xl"
            >
              ConduPro
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-6 max-w-2xl text-balance text-lg font-normal text-white/70 sm:text-xl"
            >
              Gestión inteligente para escuelas de conducción.
            </motion.p>

            <div
              ref={ctaRef}
              className="pointer-events-auto mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
            >
              <Link
                to={ROUTES.REGISTER}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-text-primary transition-colors duration-200 hover:bg-bg-secondary"
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

          {/* Bullets que aparecen al hacer scroll (escritorio) */}
          {!isMobile && !reduced ? (
            <ul
              ref={featuresRef}
              className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 space-y-5 text-left sm:left-12 md:left-20"
            >
              {FEATURE_BULLETS.map((b) => (
                <li
                  key={b}
                  className="feature-bullet flex items-center gap-3 text-base font-medium text-white sm:text-lg md:text-xl"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-accent text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {b}
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
