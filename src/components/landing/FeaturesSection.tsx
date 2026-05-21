import { useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, useReducedMotion } from 'framer-motion';
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
    title: 'Agendamiento inteligente',
    description:
      'Reserva clases prácticas y teóricas con disponibilidad en tiempo real y cero conflictos.',
  },
  {
    Icon: Users2,
    title: 'Tres roles, una plataforma',
    description:
      'Estudiantes, instructores y administradores trabajan en sincronía sin cambiar de herramienta.',
  },
  {
    Icon: Clock,
    title: 'Disponibilidad en tiempo real',
    description:
      'Visualiza horarios libres al instante y elimina la fricción de la programación manual.',
  },
  {
    Icon: Bell,
    title: 'Notificaciones automáticas',
    description:
      'Confirmaciones, recordatorios y cambios entregados al instante por email y push.',
  },
  {
    Icon: BarChart3,
    title: 'Reportes y métricas',
    description:
      'Indicadores de operación, ocupación y rendimiento listos para tomar decisiones.',
  },
  {
    Icon: Shield,
    title: 'Seguridad de extremo a extremo',
    description:
      'Auditoría, control de roles y despliegues con flujos CI/CD modernos.',
  },
];

/**
 * FeaturesSection — grid 3×2 minimalista.
 *
 * Fondo gris Apple, cards blancas con borde sutil. Sin neón.
 * Entrada con fade + translateY discreto vía IntersectionObserver.
 */
export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { ref: ioRef, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section
      ref={sectionRef}
      id="features"
      className="bg-bg-secondary py-24 sm:py-32"
    >
      <div ref={ioRef} className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            Características
          </p>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Todo lo que tu escuela necesita.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={inView || reduced ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduced ? undefined : { y: -2 }}
              className="rounded-2xl border border-border bg-bg-primary p-6 shadow-sm transition-shadow duration-150 hover:shadow-md"
            >
              <div className="mb-5 grid size-10 place-items-center rounded-xl bg-bg-secondary text-text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
