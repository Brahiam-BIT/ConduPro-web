import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthSuccessBanner } from '@/components/auth/AuthSuccessBanner';
import { PasswordField } from '@/components/auth/PasswordField';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { extractApiErrorMessage } from '@/lib/axios';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { ROLE_DEFAULT_ROUTE, ROUTES } from '@/constants/routes';
import type { Role } from '@/constants/roles';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

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
      navigate(from && from !== ROUTES.LOGIN ? from : defaultRoute, { replace: true });
    } catch (error) {
      setFormError(extractApiErrorMessage(error, 'Correo o contraseña incorrectos'));
    }
  };

  const showError = (field: keyof LoginFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  return (
    <AuthLayout title="Bienvenido de nuevo" subtitle="Inicia sesión en tu cuenta ConduPro">
      <div className="flex flex-col gap-8">
        <Logo size={40} className="hidden lg:inline-flex" />

        <div>
          <h2 className="hidden text-display-sm text-surface-900 dark:text-surface-50 lg:block">
            Iniciar sesión
          </h2>
          <p className="mt-1 hidden text-body-md text-surface-600 dark:text-surface-400 lg:block">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {registered ? (
          <AuthSuccessBanner
            message="¡Cuenta creada! Ya puedes iniciar sesión con tu correo y contraseña."
            onDismiss={dismissRegisteredBanner}
          />
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            iconLeft={<Mail className="h-4 w-4" aria-hidden />}
            errorMessage={showError('email')}
            {...register('email')}
          />

          <PasswordField
            label="Contraseña"
            autoComplete="current-password"
            placeholder="••••••••"
            errorMessage={showError('password')}
            {...register('password')}
          />

          {formError ? (
            <p
              role="alert"
              className="rounded-lg border border-error-200 bg-error-50 px-3 py-2.5 text-body-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
            >
              {formError}
            </p>
          ) : null}

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-body-sm text-surface-600 dark:text-surface-400">
          ¿No tienes cuenta?{' '}
          <Link
            to={ROUTES.REGISTER}
            className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Regístrate gratis
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
