import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, User } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordField } from '@/components/auth/PasswordField';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { extractApiErrorMessage } from '@/lib/axios';
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schema';
import { ROUTES } from '@/constants/routes';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
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

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      navigate(`${ROUTES.LOGIN}?registered=true`, { replace: true });
    } catch (error) {
      setFormError(extractApiErrorMessage(error, 'No se pudo crear la cuenta. Intenta de nuevo.'));
    }
  };

  const showError = (field: keyof RegisterFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Únete a ConduPro y agenda tu primera clase">
      <div className="flex flex-col gap-8">
        <Logo size={40} className="hidden lg:inline-flex" />

        <div>
          <h2 className="hidden text-display-sm text-surface-900 dark:text-surface-50 lg:block">
            Registrarse
          </h2>
          <p className="mt-1 hidden text-body-md text-surface-600 dark:text-surface-400 lg:block">
            Completa el formulario para crear tu cuenta de estudiante
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre"
              autoComplete="given-name"
              placeholder="Ana"
              iconLeft={<User className="h-4 w-4" aria-hidden />}
              errorMessage={showError('firstName')}
              {...register('firstName')}
            />
            <Input
              label="Apellido"
              autoComplete="family-name"
              placeholder="López"
              errorMessage={showError('lastName')}
              {...register('lastName')}
            />
          </div>

          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            iconLeft={<Mail className="h-4 w-4" aria-hidden />}
            errorMessage={showError('email')}
            {...register('email')}
          />

          <Input
            label="Teléfono"
            type="tel"
            autoComplete="tel"
            placeholder="300 123 4567"
            iconLeft={<Phone className="h-4 w-4" aria-hidden />}
            errorMessage={showError('phone')}
            {...register('phone')}
          />

          <div className="flex flex-col gap-2">
            <PasswordField
              label="Contraseña"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              errorMessage={showError('password')}
              {...register('password')}
            />
            <PasswordStrengthIndicator password={passwordValue} />
          </div>

          <PasswordField
            label="Confirmar contraseña"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            errorMessage={showError('confirmPassword')}
            {...register('confirmPassword')}
          />

          {formError ? (
            <p
              role="alert"
              className="rounded-lg border border-error-200 bg-error-50 px-3 py-2.5 text-body-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
            >
              {formError}
            </p>
          ) : null}

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg" className="mt-2">
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-body-sm text-surface-600 dark:text-surface-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
