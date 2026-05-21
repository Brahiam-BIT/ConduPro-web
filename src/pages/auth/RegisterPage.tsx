import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { FloatingField, FloatingPasswordField } from '@/components/auth/FloatingField';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { useAuth } from '@/hooks/useAuth';
import { extractApiErrorMessage } from '@/lib/axios';
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schema';
import { ROUTES } from '@/constants/routes';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEP_VARIANTS = {
  enter: (d: 1 | -1) => ({ x: d * 40, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: (d: 1 | -1) => ({ x: -d * 40, opacity: 0, transition: { duration: 0.25, ease: EASE } }),
};

type StepKey = 1 | 2 | 3;

const STEP_FIELDS: Record<StepKey, Array<keyof RegisterFormValues>> = {
  1: ['firstName', 'lastName', 'phone'],
  2: ['email', 'password', 'confirmPassword'],
  3: [],
};

/**
 * RegisterPage — wizard de 3 pasos minimalista (estilo Apple).
 *
 *  - Fondo con un gradiente radial muy sutil (azul → gris → blanco).
 *  - Card central blanca con shadow-lg, ancho max-w-md.
 *  - Stepper visual = 3 círculos numerados conectados por una línea que se
 *    "llena" con accent al avanzar.
 *  - Inputs Apple (label encima, sin íconos).
 *  - Animación entre pasos: slide horizontal + fade (Framer Motion).
 *  - Éxito: checkmark animado accent + texto.
 */
export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<StepKey>(1);
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') ?? '';

  const next = async () => {
    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (!valid) return;
    setDirection(1);
    setStep((s) => (s === 3 ? 3 : ((s + 1) as StepKey)));
  };

  const prev = () => {
    setDirection(-1);
    setStep((s) => (s === 1 ? 1 : ((s - 1) as StepKey)));
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    if (!acceptedTerms) {
      setFormError('Acepta los términos y condiciones para continuar.');
      return;
    }
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      setSuccess(true);
      window.setTimeout(() => navigate(`${ROUTES.LOGIN}?registered=true`, { replace: true }), 1800);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, 'No se pudo crear la cuenta. Intenta de nuevo.'));
    }
  };

  const showError = (field: keyof RegisterFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  const summary = getValues();

  return (
    <div
      className="theme-light relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background:
          'radial-gradient(ellipse at 60% 0%, #E8F0FE 0%, #F5F5F7 40%, #FFFFFF 100%)',
      }}
    >
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
        className="w-full max-w-md rounded-3xl bg-bg-primary p-10 shadow-lg"
      >
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-white">
            <SteeringIcon className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            ConduPro
          </span>
        </div>

        <Stepper current={step} />

        <div className="mt-7 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {step === 1
              ? 'Cuéntanos sobre ti'
              : step === 2
                ? 'Asegura tu cuenta'
                : 'Confirma tus datos'}
          </h1>
          <p className="text-sm text-text-secondary">
            {step === 1
              ? 'Comencemos con lo básico.'
              : step === 2
                ? 'Crea credenciales seguras.'
                : 'Revisa que todo esté correcto.'}
          </p>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {!success ? (
            <motion.form
              key={`step-${step}`}
              custom={direction}
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-5"
              noValidate
            >
              {step === 1 ? (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FloatingField
                      label="Nombre"
                      autoComplete="given-name"
                      placeholder="María"
                      errorMessage={showError('firstName')}
                      {...register('firstName')}
                    />
                    <FloatingField
                      label="Apellido"
                      autoComplete="family-name"
                      placeholder="Pérez"
                      errorMessage={showError('lastName')}
                      {...register('lastName')}
                    />
                  </div>
                  <FloatingField
                    label="Teléfono"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+57 300 000 0000"
                    errorMessage={showError('phone')}
                    {...register('phone')}
                  />
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <FloatingField
                    label="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    errorMessage={showError('email')}
                    {...register('email')}
                  />
                  <div className="space-y-2">
                    <FloatingPasswordField
                      label="Contraseña"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      errorMessage={showError('password')}
                      {...register('password')}
                    />
                    <div className="px-1">
                      <PasswordStrengthIndicator password={passwordValue} showChecks={false} />
                    </div>
                  </div>
                  <FloatingPasswordField
                    label="Confirmar contraseña"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    errorMessage={showError('confirmPassword')}
                    {...register('confirmPassword')}
                  />
                </>
              ) : null}

              {step === 3 ? (
                <SummaryCard
                  items={[
                    { label: 'Nombre completo', value: `${summary.firstName} ${summary.lastName}` },
                    { label: 'Correo', value: summary.email },
                    { label: 'Teléfono', value: summary.phone },
                  ]}
                  acceptedTerms={acceptedTerms}
                  onChangeTerms={setAcceptedTerms}
                />
              ) : null}

              {formError ? (
                <p
                  role="alert"
                  className="rounded-xl border border-error-500/30 bg-error-50 px-3 py-2.5 text-sm text-error-700"
                >
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prev}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atrás
                  </button>
                ) : (
                  <span />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !acceptedTerms}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Creando…' : 'Crear cuenta'}
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.form>
          ) : (
            <SuccessCard key="success" />
          )}
        </AnimatePresence>

        {!success ? (
          <p className="mt-8 text-center text-sm text-text-secondary">
            ¿Ya tienes cuenta?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Inicia sesión
            </Link>
          </p>
        ) : null}
      </motion.div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function Stepper({ current }: { current: StepKey }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3].map((n, idx) => {
        const completed = current > n;
        const active = current === n;
        return (
          <div key={n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={[
                  'grid size-8 place-items-center rounded-full text-sm font-medium transition-colors duration-200',
                  completed
                    ? 'bg-accent/15 text-accent'
                    : active
                      ? 'bg-accent text-white'
                      : 'bg-bg-tertiary text-text-tertiary',
                ].join(' ')}
              >
                {completed ? <Check className="size-4" strokeWidth={3} /> : n}
              </div>
              <span
                className={[
                  'mt-2 text-xs font-medium',
                  active || completed ? 'text-text-primary' : 'text-text-tertiary',
                ].join(' ')}
              >
                {n === 1 ? 'Datos' : n === 2 ? 'Seguridad' : 'Confirmar'}
              </span>
            </div>
            {idx < 2 ? (
              <div className="mx-2 mt-[-18px] h-px flex-1 bg-border">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: completed ? '100%' : '0%' }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SummaryCard({
  items,
  acceptedTerms,
  onChangeTerms,
}: {
  items: Array<{ label: string; value: string }>;
  acceptedTerms: boolean;
  onChangeTerms: (v: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-bg-secondary p-5">
        <ul className="space-y-3 text-sm">
          {items.map((it) => (
            <li key={it.label} className="flex items-center justify-between gap-4">
              <span className="text-text-secondary">{it.label}</span>
              <span className="truncate text-right font-medium text-text-primary">
                {it.value || '—'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => onChangeTerms(e.target.checked)}
          className="mt-0.5 size-4 cursor-pointer rounded border-border text-accent focus:ring-accent"
        />
        <span>
          Acepto los <span className="text-accent">términos y condiciones</span> y la{' '}
          <span className="text-accent">política de privacidad</span> de ConduPro.
        </span>
      </label>
    </div>
  );
}

function SuccessCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE } }}
      className="mt-7 flex flex-col items-center gap-4 rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center"
    >
      <AnimatedCheck />
      <div>
        <h3 className="text-xl font-semibold text-text-primary">¡Cuenta creada!</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Te llevamos al login en unos segundos…
        </p>
      </div>
    </motion.div>
  );
}

function AnimatedCheck() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden>
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        stroke="#0071E3"
        strokeWidth="3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.path
        d="M20 33 L29 42 L45 24"
        stroke="#0071E3"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
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
