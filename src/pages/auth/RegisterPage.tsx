import { Logo } from '@/components/layout/Logo';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-4 dark:bg-surface-950">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Logo size={40} />
          <h1 className="text-display-sm">Crear cuenta</h1>
          <p className="text-body-sm text-surface-500 dark:text-surface-400">
            La pantalla de registro se construirá en la Fase 2.
          </p>
        </div>
      </Card>
    </div>
  );
}
