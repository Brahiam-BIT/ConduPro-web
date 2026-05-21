import { useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  CalendarCheck,
  Clock,
  Shield,
  Users2,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    Icon: CalendarCheck,
    title: 'Agendamiento Inteligente',
    description:
      'Reserva clases prácticas y teóricas con disponibilidad en tiempo real y cero conflictos.',
  },
  {
    Icon: Users2,
    title: 'Tres Roles, Una Plataforma',
    description:
      'Estudiantes, instructores y administradores trabajan en sincronía sin cambiar de herramienta.',
  },
  {
    Icon: Clock,
    title: 'Disponibilidad en Tiempo Real',
    description:
      'Visualiza horarios libres al instante y elimina la fricción de la programación manual.',
  },
  {
    Icon: Bell,
    title: 'Notificaciones Automáticas',
    description:
      'Confirmaciones, recordatorios y cambios entregados al instante por email y push.',
  },
  {
    Icon: BarChart3,
    title: 'Reportes y Métricas',
    description:
      'Indicadores de operación, ocupación y rendimiento listos para tomar decisiones.',
  },
  {
    Icon: Shield,
    title: 'DevSecOps Integrado',
    description:
      'Seguridad de extremo a extremo, auditoría, y despliegues con flujos CI/CD modernos.',
  },
];

/**
 * FeaturesSection — grid 3×2 de cards con entrada staggered.
 *
 * - Título con split-text-like reveal de palabras al entrar al viewport.
 * - Cards aparecen con fadeIn + translateY stagger 0.1s (IntersectionObserver).
 * - Hover: border glow cyan + escala 1.02.
 */
export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { ref: ioRef, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  useGSAP(
    () => {
      if (!inView) return;
      const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
      if (reduced) {
        gsap.set(['.feature-card', '.feature-word'], { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        '.feature-word',
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease },
      );
      gsap.fromTo(
        '.feature-card',
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease, delay: 0.25 },
      );
    },
    { scope: sectionRef, dependencies: [inView, reduced] },
  );

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative bg-brand-dark py-28 sm:py-36"
    >
      <div ref={ioRef} className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono-brand text-xs uppercase tracking-[0.4em] text-brand-primary">
            ✦ Lo que incluye
          </p>
          <h2
            ref={titleRef}
            className="font-hero text-4xl font-bold leading-[1.05] text-brand-light sm:text-5xl md:text-6xl"
          >
            <span className="feature-word inline-block">Todo</span>{' '}
            <span className="feature-word inline-block">lo</span>{' '}
            <span className="feature-word inline-block">que</span>{' '}
            <span className="feature-word inline-block">tu</span>{' '}
            <span className="feature-word inline-block">escuela</span>{' '}
            <span className="feature-word inline-block text-gradient-dynamic">necesita.</span>
          </h2>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="feature-card group relative overflow-hidden rounded-3xl border border-brand-mid/60 bg-brand-surface/40 p-6 transition-all duration-300 ease-brand hover:scale-[1.02] hover:border-brand-primary/50 hover:shadow-[0_0_0_1px_rgba(10,255,224,0.18),0_30px_60px_-25px_rgba(10,255,224,0.35)]"
            >
              {/* Glow decorativo al hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-brand-primary/20 opacity-0 blur-3xl transition-opacity duration-500 ease-brand group-hover:opacity-100"
              />

              <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-gradient-dynamic-soft text-brand-primary ring-1 ring-brand-primary/30">
                <Icon className="size-5" />
              </div>
              <h3 className="font-hero text-xl font-semibold text-brand-light">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-light/65">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
