import { forwardRef, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import {
  FloatingField,
  FloatingPasswordField,
} from '@/components/auth/FloatingField';
import { useAuth } from '@/hooks/useAuth';
import { extractApiErrorMessage } from '@/lib/axios';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { ROLE_DEFAULT_ROUTE, ROUTES } from '@/constants/routes';
import type { Role } from '@/constants/roles';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * LoginPage — pantalla de inicio de sesión Apple-minimal.
 *
 *  - Fondo gris claro (#F5F5F7).
 *  - Card centrada blanca con shadow-lg, rounded-3xl.
 *  - Inputs estilo Apple (label encima, sin íconos).
 *  - Botón submit azul accent + spinner inline.
 *  - Botón "Volver" en esquina superior-izquierda.
 *  - Animación de entrada: card y campos con stagger Framer Motion.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

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
      navigate(target, { replace: true });
    } catch (error) {
      setFormError(extractApiErrorMessage(error, 'Correo o contraseña incorrectos'));
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
    }
  };

  const showError = (field: keyof LoginFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  return (
    <div className="theme-light relative flex min-h-screen items-center justify-center bg-bg-secondary px-4 py-10">
      {/* Botón "Volver" */}
      <Link
        to="/"
        className="group absolute left-6 top-6 z-50 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
      >
        <ArrowLeft
          size={16}
          className="transition-transform duration-150 group-hover:-translate-x-0.5"
        />
        <span className="hidden sm:inline">Volver</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="w-full max-w-sm rounded-3xl bg-bg-primary p-10 shadow-lg"
      >
        {/* Logo */}
        <div className="mb-7 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-white">
            <SteeringIcon className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            ConduPro
          </span>
        </div>

        <Stagger>
          <StaggerItem>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              Iniciar sesión
            </h1>
            <p className="mt-1 text-sm text-text-secondary">Bienvenido de nuevo</p>
          </StaggerItem>

          {registered ? (
            <StaggerItem>
              <div className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-text-primary">
                <span>Tu cuenta fue creada. Ahora inicia sesión para continuar.</span>
                <button
                  type="button"
                  onClick={dismissRegisteredBanner}
                  className="text-xs font-medium text-accent hover:text-accent-hover"
                >
                  Cerrar
                </button>
              </div>
            </StaggerItem>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
            <StaggerItem>
              <FloatingField
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                errorMessage={showError('email')}
                shake={shake}
                {...register('email')}
              />
            </StaggerItem>

            <StaggerItem>
              <FloatingPasswordField
                label="Contraseña"
                autoComplete="current-password"
                placeholder="••••••••"
                errorMessage={showError('password')}
                shake={shake}
                {...register('password')}
              />
              <div className="mt-2 text-right">
                <a
                  href="#"
                  className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </StaggerItem>

            {formError ? (
              <StaggerItem>
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-error-500/30 bg-error-50 px-3 py-2.5 text-sm text-error-700"
                >
                  {formError}
                </motion.p>
              </StaggerItem>
            ) : null}

            <StaggerItem>
              <SubmitButton ref={submitButtonRef} isSubmitting={isSubmitting} />
            </StaggerItem>
          </form>

          <StaggerItem>
            <div className="mt-6 flex items-center gap-3 text-xs text-text-tertiary">
              <span className="h-px flex-1 bg-border" />
              o
              <span className="h-px flex-1 bg-border" />
            </div>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-5 text-center text-sm text-text-secondary">
              ¿No tienes cuenta?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="font-medium text-accent transition-colors hover:text-accent-hover"
              >
                Regístrate
              </Link>
            </p>
          </StaggerItem>
        </Stagger>
      </motion.div>
    </div>
  );
}

/* ─── Helpers locales ────────────────────────────────────────────── */

function Stagger({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
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
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover disabled:cursor-progress disabled:opacity-80"
    >
      {isSubmitting ? (
        <>
          <Spinner />
          Iniciando sesión…
        </>
      ) : (
        'Iniciar sesión'
      )}
    </button>
  );
});

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
