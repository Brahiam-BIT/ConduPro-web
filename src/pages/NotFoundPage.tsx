import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-4 dark:bg-surface-950">
      <div className="flex flex-col items-center gap-6 text-center">
        <Logo size={40} />
        <div>
          <p className="text-display-lg bg-gradient-brand bg-clip-text text-transparent">404</p>
          <h1 className="text-heading-lg text-surface-800 dark:text-surface-100">Página no encontrada</h1>
          <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">
            La página que buscas no existe o fue movida.
          </p>
        </div>
        <Link to={ROUTES.LOGIN}>
          <Button variant="primary">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
