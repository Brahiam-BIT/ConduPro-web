import { Suspense, lazy, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Mail, Phone, User } from 'lucide-react';
import { FloatingField, FloatingPasswordField } from '@/components/auth/FloatingField';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { useAuth } from '@/hooks/useAuth';
import { extractApiErrorMessage } from '@/lib/axios';
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schema';
import { ROUTES } from '@/constants/routes';

const RegisterScene = lazy(() => import('@/components/three/RegisterScene'));

const BRAND_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STEP_VARIANTS = {
  enter: (d: 1 | -1) => ({ x: d * 50, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: BRAND_EASE } },
  exit: (d: 1 | -1) => ({ x: -d * 50, opacity: 0, transition: { duration: 0.3, ease: BRAND_EASE } }),
};

type StepKey = 1 | 2 | 3;

const STEP_FIELDS: Record<StepKey, Array<keyof RegisterFormValues>> = {
  1: ['firstName', 'lastName', 'phone'],
  2: ['email', 'password', 'confirmPassword'],
  3: [],
};

function SceneFallback() {
  return (
    <div aria-hidden className="absolute inset-0 bg-gradient-dynamic-radial bg-brand-dark" />
  );
}

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
      window.setTimeout(() => navigate(`${ROUTES.LOGIN}?registered=true`, { replace: true }), 2000);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, 'No se pudo crear la cuenta. Intenta de nuevo.'));
    }
  };

  const showError = (field: keyof RegisterFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  const summary = getValues();

  return (
    <div className="theme-dynamic relative grid min-h-screen grid-cols-1 overflow-hidden bg-brand-dark lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block">
        <Suspense fallback={<SceneFallback />}>
          <RegisterScene className="absolute inset-0" />
        </Suspense>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-brand-primary/30 bg-brand-surface/50 px-4 py-1.5 font-mono-brand text-[10px] uppercase tracking-[0.4em] text-brand-light/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_#0AFFE0]" />
            Únete a ConduPro
          </div>
          <div className="max-w-md space-y-3">
            <p className="font-mono-brand text-xs uppercase tracking-[0.35em] text-brand-primary">
              Crea tu cuenta
            </p>
            <h1 className="font-hero text-5xl font-bold leading-[1.05] text-brand-light">
              Empieza tu <span className="text-gradient-dynamic">viaje</span>.
            </h1>
            <p className="max-w-sm text-sm text-brand-light/70">
              Tres pasos rápidos y ya podrás agendar tu primera clase.
            </p>
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-brand-light/40">
            © {new Date().getFullYear()} ConduPro
          </div>
        </div>
      </aside>

      <section className="relative flex min-h-screen items-center justify-center bg-brand-surface px-6 py-12 sm:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-dynamic opacity-40" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-dynamic-radial opacity-20" />

        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { duration: 0.7, ease: BRAND_EASE } }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8 flex items-center justify-between">
            <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-light/60 transition-colors hover:text-brand-light">
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver
            </Link>
            <span className="font-mono-brand text-[11px] uppercase tracking-[0.3em] text-brand-light/50">
              Paso {step} / 3
            </span>
          </div>

          <Stepper current={step} />

          <div className="mt-8 space-y-2">
            <h2 className="font-hero text-3xl font-bold text-brand-light">
              {step === 1 ? 'Cuéntanos sobre ti' : step === 2 ? 'Asegura tu cuenta' : 'Confirma tus datos'}
            </h2>
            <p className="text-sm text-brand-light/60">
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
                        iconLeft={<User className="h-4 w-4" aria-hidden />}
                        errorMessage={showError('firstName')}
                        {...register('firstName')}
                      />
                      <FloatingField
                        label="Apellido"
                        autoComplete="family-name"
                        errorMessage={showError('lastName')}
                        {...register('lastName')}
                      />
                    </div>
                    <FloatingField
                      label="Teléfono"
                      type="tel"
                      autoComplete="tel"
                      iconLeft={<Phone className="h-4 w-4" aria-hidden />}
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
                      iconLeft={<Mail className="h-4 w-4" aria-hidden />}
                      errorMessage={showError('email')}
                      {...register('email')}
                    />
                    <div className="space-y-2">
                      <FloatingPasswordField
                        label="Contraseña"
                        autoComplete="new-password"
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
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300"
                  >
                    {formError}
                  </p>
                ) : null}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prev}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-brand-mid/70 bg-transparent px-5 text-sm font-medium text-brand-light/80 transition-colors duration-300 ease-brand hover:border-brand-primary/40 hover:text-brand-light"
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
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-dynamic px-6 font-mono-brand text-xs uppercase tracking-[0.25em] text-brand-dark transition-transform duration-300 ease-brand hover:translate-y-[-1px] hover:shadow-[0_14px_36px_-16px_rgba(10,255,224,0.6)]"
                    >
                      Siguiente
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !acceptedTerms}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-dynamic px-6 font-mono-brand text-xs uppercase tracking-[0.25em] text-brand-dark transition-transform duration-300 ease-brand hover:translate-y-[-1px] hover:shadow-[0_14px_36px_-16px_rgba(10,255,224,0.6)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {isSubmitting ? 'Creando…' : 'Crear mi cuenta'}
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
            <p className="mt-8 text-center text-sm text-brand-light/60">
              ¿Ya tienes cuenta?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-semibold text-brand-primary transition-colors hover:text-brand-light"
              >
                Inicia sesión
              </Link>
            </p>
          ) : null}
        </motion.div>
      </section>
    </div>
  );
}

function Stepper({ current }: { current: StepKey }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((n) => {
        const active = current >= n;
        return (
          <div key={n} className="space-y-2">
            <div
              className={[
                'h-1.5 rounded-full transition-all duration-500 ease-brand',
                active ? 'bg-gradient-dynamic shadow-[0_0_12px_rgba(10,255,224,0.45)]' : 'bg-brand-mid/60',
              ].join(' ')}
            />
            <p className={['font-mono-brand text-[10px] uppercase tracking-[0.3em]', active ? 'text-brand-light' : 'text-brand-light/40'].join(' ')}>
              {n === 1 ? 'Datos' : n === 2 ? 'Seguridad' : 'Confirmar'}
            </p>
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
      <div className="rounded-2xl border border-brand-mid/70 bg-brand-surface/40 p-5">
        <ul className="space-y-3 text-sm">
          {items.map((it) => (
            <li key={it.label} className="flex items-center justify-between gap-4">
              <span className="font-mono-brand text-[11px] uppercase tracking-[0.25em] text-brand-light/50">
                {it.label}
              </span>
              <span className="truncate text-right text-brand-light">{it.value || '—'}</span>
            </li>
          ))}
        </ul>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-light/70">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => onChangeTerms(e.target.checked)}
          className="mt-1 size-4 cursor-pointer rounded border-brand-mid bg-brand-surface text-brand-primary focus:ring-brand-primary"
        />
        <span>
          Acepto los <span className="underline decoration-brand-primary/50 underline-offset-4">términos y condiciones</span>{' '}
          y la <span className="underline decoration-brand-primary/50 underline-offset-4">política de privacidad</span> de ConduPro.
        </span>
      </label>
    </div>
  );
}

function SuccessCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: BRAND_EASE } }}
      className="mt-8 flex flex-col items-center gap-5 rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-8 text-center"
    >
      <AnimatedCheck />
      <div className="space-y-1">
        <h3 className="font-hero text-2xl font-bold text-brand-light">¡Cuenta creada!</h3>
        <p className="text-sm text-brand-light/70">Te llevamos al login en unos segundos…</p>
      </div>
    </motion.div>
  );
}

function AnimatedCheck() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        stroke="#0AFFE0"
        strokeWidth="3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      <motion.path
        d="M20 33 L29 42 L45 24"
        stroke="#0AFFE0"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
        style={{
          filter: 'drop-shadow(0 0 6px rgba(10,255,224,0.65))',
        }}
      />
    </svg>
  );
}
