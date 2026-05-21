import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
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
    cta: 'Crea tu cuenta',
  },
  {
    id: 'instructor',
    label: 'Instructor',
    title: 'Gestiona tu agenda con precisión.',
    description: 'Disponibilidad pintada en una grilla, clases sincronizadas.',
    Icon: ClipboardCheck,
    benefits: [
      'Marca tu disponibilidad por semana en segundos',
      'Vista unificada de clases prácticas y teóricas',
      'Subida de materiales para tus estudiantes',
      'Notificaciones de cambios y cancelaciones',
    ],
    cta: 'Conoce el panel',
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
    cta: 'Empieza ahora',
  },
];

// Pequeño SVG ilustrado para cada rol (sin assets externos).
function RoleIllustration({ role }: { role: Role['id'] }) {
  if (role === 'student') {
    return (
      <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="il-student-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0AFFE0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7000FF" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect x="20" y="40" width="280" height="150" rx="20" fill="url(#il-student-grad)" opacity="0.12" />
        <rect x="40" y="60" width="120" height="14" rx="7" fill="#0AFFE0" />
        <rect x="40" y="80" width="180" height="8" rx="4" fill="#F0EEFF" opacity="0.55" />
        <rect x="40" y="92" width="160" height="8" rx="4" fill="#F0EEFF" opacity="0.35" />
        <circle cx="245" cy="135" r="35" fill="url(#il-student-grad)" />
        <path d="M225 135 l15 15 l25 -28" stroke="#04020F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="40" y="135" width="60" height="35" rx="10" stroke="#0AFFE0" strokeWidth="2" fill="transparent" />
      </svg>
    );
  }
  if (role === 'instructor') {
    return (
      <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="il-instr-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7000FF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0AFFE0" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect x="20" y="30" width="280" height="160" rx="20" fill="url(#il-instr-grad)" opacity="0.12" />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={40 + i * 32} y="60" width="24" height="120" rx="4" fill="#1A1535" />
        ))}
        {[
          { i: 0, h: 30 },
          { i: 1, h: 60 },
          { i: 2, h: 90 },
          { i: 3, h: 30 },
          { i: 4, h: 60 },
          { i: 5, h: 90 },
          { i: 6, h: 60 },
        ].map((it) => (
          <rect
            key={it.i}
            x={40 + it.i * 32}
            y={180 - it.h}
            width="24"
            height={it.h}
            rx="4"
            fill="url(#il-instr-grad)"
          />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="il-admin-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0AFFE0" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#7000FF" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect x="20" y="30" width="280" height="160" rx="20" fill="url(#il-admin-grad)" opacity="0.12" />
      <rect x="40" y="50" width="120" height="40" rx="8" fill="#1A1535" />
      <rect x="170" y="50" width="110" height="40" rx="8" fill="#1A1535" />
      <rect x="40" y="100" width="80" height="80" rx="8" fill="url(#il-admin-grad)" />
      <rect x="130" y="100" width="80" height="80" rx="8" fill="#1A1535" />
      <rect x="220" y="100" width="60" height="80" rx="8" fill="#1A1535" />
    </svg>
  );
}

const TAB_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

/**
 * RolesSection — tabs animadas Estudiante / Instructor / Admin.
 *
 * Cambia el contenido con `AnimatePresence` (slide vertical + fade), y la
 * pill activa usa `layoutId` de Framer Motion para deslizarse entre tabs.
 */
export function RolesSection() {
  const [active, setActive] = useState<Role['id']>('student');
  const role = ROLES.find((r) => r.id === active) ?? ROLES[0]!;

  return (
    <section id="roles" className="relative bg-brand-dark py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono-brand text-xs uppercase tracking-[0.4em] text-brand-primary">
            ✦ Diseñado para tu rol
          </p>
          <h2 className="font-hero text-4xl font-bold leading-[1.05] text-brand-light sm:text-5xl md:text-6xl">
            Tres caminos, <span className="text-gradient-dynamic">un destino.</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="mb-10 inline-flex rounded-full border border-brand-mid/60 bg-brand-surface/40 p-1">
          {ROLES.map((r) => {
            const isActive = r.id === active;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActive(r.id)}
                className="relative isolate inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono-brand text-xs uppercase tracking-[0.18em] text-brand-light/65 transition-colors duration-300 ease-brand hover:text-brand-light"
              >
                {isActive ? (
                  <motion.span
                    layoutId="roles-active-pill"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-dynamic"
                  />
                ) : null}
                <r.Icon className={['size-3.5', isActive ? 'text-brand-dark' : ''].join(' ')} />
                <span className={isActive ? 'text-brand-dark' : ''}>{r.label}</span>
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
            {/* Illustration */}
            <div className="relative overflow-hidden rounded-3xl border border-brand-mid/60 bg-brand-surface/50 p-6">
              <RoleIllustration role={role.id} />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -right-12 size-48 rounded-full bg-brand-primary/20 blur-3xl"
              />
            </div>

            {/* Content */}
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-surface/40 px-3 py-1 font-mono-brand text-[10px] uppercase tracking-[0.3em] text-brand-light/75">
                <Sparkles className="size-3" />
                {role.label}
              </p>
              <h3 className="font-hero text-3xl font-semibold leading-tight text-brand-light sm:text-4xl">
                {role.title}
              </h3>
              <p className="mt-3 text-base text-brand-light/65">{role.description}</p>

              <ul className="mt-7 space-y-3">
                {role.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-brand-light/85">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-primary/15 text-brand-primary">
                      <CheckCircle2 className="size-3.5" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center gap-3">
                <Link
                  to={ROUTES.REGISTER}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-dynamic px-5 font-mono-brand text-[11px] uppercase tracking-[0.22em] text-brand-dark transition-transform duration-300 ease-brand hover:translate-y-[-1px] hover:shadow-[0_14px_36px_-16px_rgba(10,255,224,0.55)]"
                >
                  {role.cta}
                  <Compass className="size-4" />
                </Link>
                <span className="inline-flex items-center gap-2 text-xs text-brand-light/55">
                  <Users className="size-3.5" />
                  Más de 200 personas usándolo
                </span>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default RolesSection;
