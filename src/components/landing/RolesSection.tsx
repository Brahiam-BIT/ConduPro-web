import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface Role {
  id: 'student' | 'instructor' | 'admin';
  label: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  benefits: string[];
  cta: string;
}

const ROLES: Role[] = [
  {
    id: 'student',
    label: 'Estudiante',
    title: 'Aprende a tu ritmo, llega más lejos.',
    description: 'Agenda, practica y consulta tus materiales sin perder tiempo.',
    Icon: GraduationCap,
    benefits: [
      'Reserva clases prácticas y teóricas online',
      'Acceso a materiales de estudio descargables',
      'Recordatorios y confirmaciones automáticas',
      'Historial completo de tus clases y avances',
    ],
    cta: 'Crear cuenta',
  },
  {
    id: 'instructor',
    label: 'Instructor',
    title: 'Gestiona tu agenda con precisión.',
    description: 'Disponibilidad en una grilla, clases sincronizadas.',
    Icon: ClipboardCheck,
    benefits: [
      'Marca tu disponibilidad por semana en segundos',
      'Vista unificada de clases prácticas y teóricas',
      'Subida de materiales para tus estudiantes',
      'Notificaciones de cambios y cancelaciones',
    ],
    cta: 'Conocer el panel',
  },
  {
    id: 'admin',
    label: 'Admin',
    title: 'Tu academia, en un solo dashboard.',
    description: 'Estudiantes, instructores, vehículos y reportes con control total.',
    Icon: ShieldCheck,
    benefits: [
      'Gestión de usuarios, roles y permisos',
      'Calendario global de todas las clases',
      'Reportes operativos y financieros',
      'Auditoría y cumplimiento integrados',
    ],
    cta: 'Empezar ahora',
  },
];

const TAB_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/** Ilustración simple (mockup tipo "card") para cada rol, en escala de grises. */
function RoleIllustration({ role }: { role: Role['id'] }) {
  if (role === 'student') {
    return (
      <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
        <rect x="20" y="40" width="280" height="150" rx="16" fill="#F5F5F7" />
        <rect x="40" y="60" width="120" height="14" rx="7" fill="#1D1D1F" />
        <rect x="40" y="80" width="180" height="8" rx="4" fill="#AEAEB2" />
        <rect x="40" y="92" width="160" height="8" rx="4" fill="#D2D2D7" />
        <circle cx="245" cy="135" r="30" fill="#0071E3" />
        <path d="M229 135 l12 12 l22 -24" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="40" y="135" width="60" height="35" rx="8" stroke="#D2D2D7" strokeWidth="2" fill="white" />
      </svg>
    );
  }
  if (role === 'instructor') {
    return (
      <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
        <rect x="20" y="30" width="280" height="160" rx="16" fill="#F5F5F7" />
        {[
          { i: 0, h: 30 },
          { i: 1, h: 60 },
          { i: 2, h: 90 },
          { i: 3, h: 30 },
          { i: 4, h: 60 },
          { i: 5, h: 90 },
          { i: 6, h: 60 },
        ].map((it) => (
          <g key={it.i}>
            <rect x={40 + it.i * 32} y="60" width="24" height="120" rx="4" fill="#E8E8ED" />
            <rect
              x={40 + it.i * 32}
              y={180 - it.h}
              width="24"
              height={it.h}
              rx="4"
              fill="#0071E3"
            />
          </g>
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
      <rect x="20" y="30" width="280" height="160" rx="16" fill="#F5F5F7" />
      <rect x="40" y="50" width="120" height="40" rx="8" fill="#E8E8ED" />
      <rect x="170" y="50" width="110" height="40" rx="8" fill="#E8E8ED" />
      <rect x="40" y="100" width="80" height="80" rx="8" fill="#0071E3" />
      <rect x="130" y="100" width="80" height="80" rx="8" fill="#E8E8ED" />
      <rect x="220" y="100" width="60" height="80" rx="8" fill="#E8E8ED" />
    </svg>
  );
}

/**
 * RolesSection — tabs minimalistas con underline indicator en accent.
 *
 *  - Tab activa: subrayado azul accent (animado con `layoutId`).
 *  - Contenido: card blanca + ilustración SVG en grises + bullets con check.
 */
export function RolesSection() {
  const [active, setActive] = useState<Role['id']>('student');
  const role = ROLES.find((r) => r.id === active) ?? ROLES[0]!;

  return (
    <section id="roles" className="bg-bg-primary py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            Para tu rol
          </p>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Tres caminos, un destino.
          </h2>
        </div>

        {/* Tabs con underline */}
        <div className="mb-10 flex flex-wrap gap-2 border-b border-border">
          {ROLES.map((r) => {
            const isActive = r.id === active;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActive(r.id)}
                className={[
                  'relative inline-flex items-center gap-2 px-1 pb-3 pt-2 text-sm font-medium transition-colors duration-150',
                  isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                <r.Icon className="size-4" />
                {r.label}
                {isActive ? (
                  <motion.span
                    layoutId="roles-active-underline"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={role.id}
            variants={TAB_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-bg-primary p-6 shadow-sm">
              <RoleIllustration role={role.id} />
            </div>

            <div>
              <h3 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                {role.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-text-secondary">
                {role.description}
              </p>

              <ul className="mt-7 space-y-3">
                {role.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-text-primary">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  to={ROUTES.REGISTER}
                  className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
                >
                  {role.cta}
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default RolesSection;
