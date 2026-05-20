import { isApiError } from '@/lib/axios';

export interface GlobalErrorToastPayload {
  title: string;
  description?: string;
}

type GlobalErrorHandler = (payload: GlobalErrorToastPayload) => void;

let globalErrorHandler: GlobalErrorHandler | null = null;

export function registerGlobalQueryErrorHandler(handler: GlobalErrorHandler | null): void {
  globalErrorHandler = handler;
}

export function handleGlobalQueryError(error: unknown): void {
  if (!globalErrorHandler) return;

  if (!isApiError(error)) {
    if (!error || typeof error !== 'object') return;
    globalErrorHandler({
      title: 'Error de conexión',
      description: 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
    });
    return;
  }

  const status = error.response?.status;
  if (!status || status === 401) return;

  if (status === 403) {
    globalErrorHandler({
      title: 'Sin permiso',
      description: 'No tienes permiso para esta acción',
    });
    return;
  }

  if (status >= 500) {
    globalErrorHandler({
      title: 'Error del servidor',
      description: 'Error del servidor, intenta de nuevo',
    });
  }
}
