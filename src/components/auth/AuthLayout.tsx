import type { ReactNode } from 'react';
import { AuthIllustration } from './AuthIllustration';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Layout split-screen para login y registro.
 * - Izquierda (lg+): ilustración + tagline sobre gradiente de marca.
 * - Derecha: formulario.
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo — oculto en móvil */}
      <aside className="relative hidden w-0 flex-1 overflow-hidden lg:flex lg:w-1/2 lg:max-w-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-900" />
        <div className="absolute inset-0 bg-gradient-brand-soft opacity-40" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-primary-300/15 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
          <div className="max-w-md">
            <p className="text-caption font-semibold uppercase tracking-widest text-primary-200">
              Plataforma de movilidad
            </p>
            <h1 className="mt-3 text-display-md text-white">
              Aprende a conducir con confianza
            </h1>
            <p className="mt-4 text-body-lg text-primary-100/90">
              ConduPro conecta estudiantes, instructores y administradores en un solo lugar para
              agendar, impartir y gestionar clases de conducción.
            </p>
          </div>

          <div className="mt-8 flex-1 py-6">
            <AuthIllustration />
          </div>

          <div className="text-body-sm text-primary-200/80">
            © {new Date().getFullYear()} ConduPro · Escuelas de conducción
          </div>
        </div>
      </aside>

      {/* Panel derecho — formulario */}
      <div className="flex w-full flex-col justify-center bg-surface-100 px-4 py-10 dark:bg-surface-950 sm:px-8 lg:w-1/2 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          {(title || subtitle) && (
            <div className="mb-8 lg:hidden">
              {title ? (
                <h2 className="text-display-sm text-surface-900 dark:text-surface-50">{title}</h2>
              ) : null}
              {subtitle ? (
                <p className="mt-1 text-body-md text-surface-600 dark:text-surface-400">{subtitle}</p>
              ) : null}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
