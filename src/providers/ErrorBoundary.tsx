import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-100 px-4 py-12 dark:bg-surface-950">
        <div className="w-full max-w-md rounded-2xl border border-surface-200 bg-surface-50 p-8 text-center shadow-lg dark:border-surface-800 dark:bg-surface-900">
          <Logo size={40} withText={false} className="mx-auto justify-center" />
          <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">
            <AlertTriangle className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="mt-5 text-heading-md text-surface-900 dark:text-surface-50">
            Algo salió mal
          </h1>
          <p className="mt-2 text-body-sm text-surface-600 dark:text-surface-400">
            Ocurrió un error inesperado al mostrar esta página. Puedes recargar e intentar de nuevo.
          </p>
          {import.meta.env.DEV && this.state.error ? (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-surface-100 p-3 text-left text-caption text-error-700 dark:bg-surface-800 dark:text-error-400">
              {this.state.error.message}
            </pre>
          ) : null}
          <Button
            className="mt-6 w-full sm:w-auto"
            iconLeft={<RefreshCw className="h-4 w-4" />}
            onClick={this.handleReload}
          >
            Recargar
          </Button>
        </div>
      </div>
    );
  }
}
