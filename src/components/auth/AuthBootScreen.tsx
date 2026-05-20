import { Logo } from '@/components/layout/Logo';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Pantalla fullscreen mientras AuthProvider verifica la sesión (refresh silencioso).
 */
export function AuthBootScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-100 dark:bg-surface-950">
      <Logo size={48} />
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" className="text-primary-600" />
        <p className="text-body-sm text-surface-500 dark:text-surface-400">Verificando sesión…</p>
      </div>
    </div>
  );
}
