import { Suspense, forwardRef, lazy, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import gsap from 'gsap';
import {
  FloatingField,
  FloatingPasswordField,
} from '@/components/auth/FloatingField';
import { useWipeOverlay } from '@/components/layout/PageTransition';
import { useAuth } from '@/hooks/useAuth';
import { extractApiErrorMessage } from '@/lib/axios';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { ROLE_DEFAULT_ROUTE, ROUTES } from '@/constants/routes';
import type { Role } from '@/constants/roles';

const LoginScene = lazy(() => import('@/components/three/LoginScene'));

const BRAND_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function SceneFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-gradient-dynamic-radial bg-brand-dark"
    />
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const wipe = useWipeOverlay();

  const registered = searchParams.get('registered') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    // Shimmer cyan→violeta del botón mientras loading.
    const el = submitButtonRef.current;
    if (!el) return;
    if (isSubmitting) {
      el.classList.add('is-loading');
    } else {
      el.classList.remove('is-loading');
    }
  }, [isSubmitting]);

  const dismissRegisteredBanner = () => {
    searchParams.delete('registered');
    setSearchParams(searchParams, { replace: true });
  };

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      const user = await login(values);
      const from = (location.state as { from?: string } | null)?.from;
      const defaultRoute = ROLE_DEFAULT_ROUTE[user.role as Role];
      const target = from && from !== ROUTES.LOGIN ? from : defaultRoute;

      // Animación de salida del card y wipe negro hacia el dashboard.
      if (formCardRef.current) {
        gsap.to(formCardRef.current, {
          opacity: 0,
          scale: 0.96,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      wipe.play({
        onComplete: () => navigate(target, { replace: true }),
      });
    } catch (error) {
      setFormError(extractApiErrorMessage(error, 'Correo o contraseña incorrectos'));
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
    }
  };

  const showError = (field: keyof LoginFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  return (
    <div className="theme-dynamic relative grid min-h-screen grid-cols-1 overflow-hidden bg-brand-dark lg:grid-cols-2">
      {/* ─── Panel izquierdo — escena 3D ─── */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Suspense fallback={<SceneFallback />}>
          <LoginScene className="absolute inset-0" />
        </Suspense>

        {/* Overlay con tagline */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
          <div className="pointer-events-auto inline-flex items-center gap-2 self-start rounded-full border border-brand-primary/30 bg-brand-surface/50 px-4 py-1.5 font-mono-brand text-[10px] uppercase tracking-[0.4em] text-brand-light/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_#0AFFE0]" />
            ConduPro · Plataforma Nº1
          </div>

          <div className="max-w-md space-y-3">
            <p className="font-mono-brand text-xs uppercase tracking-[0.35em] text-brand-primary">
              Bienvenido de nuevo
            </p>
            <h1 className="font-hero text-5xl font-bold leading-[1.05] text-brand-light">
              Vuelve a la <span className="text-gradient-dynamic">carretera</span>.
            </h1>
            <p className="max-w-sm text-sm text-brand-light/70">
              Conduce, agenda, aprende. Toda tu academia en un solo lugar.
              Haz click en el auto para arrancarlo.
            </p>
          </div>

          <div className="pointer-events-auto text-[11px] uppercase tracking-[0.3em] text-brand-light/40">
            © {new Date().getFullYear()} ConduPro
          </div>
        </div>
      </aside>

      {/* ─── Panel derecho — formulario ─── */}
      <section className="relative flex min-h-screen items-center justify-center bg-brand-surface px-6 py-12 sm:px-10">
        {/* Grid decorativa de fondo */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-dynamic opacity-40" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-dynamic-radial opacity-20" />

        <motion.div
          ref={formCardRef}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { duration: 0.7, ease: BRAND_EASE } }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="relative grid size-10 place-items-center rounded-xl bg-gradient-dynamic">
              <SteeringIcon className="size-5 text-brand-dark" />
            </div>
            <span className="font-hero text-2xl font-bold text-brand-light">
              Condu<span className="text-gradient-dynamic">Pro</span>
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="font-hero text-3xl font-bold text-brand-light">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm text-brand-light/60">Inicia sesión para continuar</p>
          </div>

          {registered ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-start justify-between gap-3 rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-4 py-3 text-sm text-brand-light"
            >
              <span>Tu cuenta fue creada. Ahora inicia sesión para continuar.</span>
              <button
                type="button"
                onClick={dismissRegisteredBanner}
                className="font-mono-brand text-[10px] uppercase tracking-widest text-brand-primary hover:text-brand-light"
              >
                Cerrar
              </button>
            </motion.div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <FloatingField
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              iconLeft={<Mail className="h-4 w-4" aria-hidden />}
              errorMessage={showError('email')}
              shake={shake}
              {...register('email')}
            />

            <FloatingPasswordField
              label="Contraseña"
              autoComplete="current-password"
              iconLeft={<Lock className="h-4 w-4" aria-hidden />}
              errorMessage={showError('password')}
              shake={shake}
              {...register('password')}
            />

            {formError ? (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300"
              >
                {formError}
              </motion.p>
            ) : null}

            <SubmitButton ref={submitButtonRef} isSubmitting={isSubmitting} />
          </form>

          {/* Separador y placeholder Google */}
          <div className="mt-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-brand-light/40">
            <span className="h-px flex-1 bg-brand-mid/60" />
            o continúa con
            <span className="h-px flex-1 bg-brand-mid/60" />
          </div>
          <button
            type="button"
            disabled
            title="Próximamente"
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-brand-mid/70 bg-brand-surface/40 px-4 py-3 text-sm text-brand-light/70 transition-colors duration-300 ease-brand hover:border-brand-primary/40 hover:text-brand-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon className="h-4 w-4" />
            Google (próximamente)
          </button>

          <p className="mt-8 text-center text-sm text-brand-light/60">
            ¿No tienes cuenta?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-semibold text-brand-primary transition-colors hover:text-brand-light"
            >
              Regístrate aquí
            </Link>
          </p>
        </motion.div>
      </section>

      {/* Estilos locales del shimmer del botón submit */}
      <style>{`
        .submit-cta {
          background: linear-gradient(135deg, #0AFFE0 0%, #7000FF 100%);
          background-size: 200% 100%;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .submit-cta:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 16px 36px -16px rgba(10, 255, 224, 0.6);
        }
        .submit-cta.is-loading {
          animation: submit-shimmer 1.2s linear infinite;
        }
        @keyframes submit-shimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}

interface SubmitButtonProps {
  isSubmitting: boolean;
}

const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(function SubmitButton(
  { isSubmitting },
  ref,
) {
  return (
    <button
      ref={ref}
      type="submit"
      disabled={isSubmitting}
      className="submit-cta relative h-[52px] w-full rounded-xl font-mono-brand text-sm font-semibold uppercase tracking-[0.25em] text-brand-dark disabled:cursor-progress disabled:opacity-90"
    >
      {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
    </button>
  );
});

function SteeringIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 5v4.6" />
      <path d="M5.6 14.5l4 -2.1" />
      <path d="M18.4 14.5l-4 -2.1" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M12 11v3.2h4.5c-.18 1.18-1.34 3.45-4.5 3.45-2.7 0-4.9-2.24-4.9-5s2.2-5 4.9-5c1.54 0 2.57.65 3.16 1.22l2.16-2.08C15.86 5.46 14.1 4.6 12 4.6 7.86 4.6 4.5 7.96 4.5 12.1S7.86 19.6 12 19.6c6.94 0 7.5-6.5 7.04-8.6H12z"
      />
    </svg>
  );
}
