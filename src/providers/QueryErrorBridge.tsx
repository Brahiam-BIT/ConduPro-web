import { useEffect } from 'react';
import { useToast } from '@/providers/ToastProvider';
import { registerGlobalQueryErrorHandler } from '@/lib/queryErrorHandler';

/**
 * Registers the toast handler for TanStack Query global errors (403, 5xx).
 * Must render inside ToastProvider.
 */
export function QueryErrorBridge() {
  const toast = useToast();

  useEffect(() => {
    registerGlobalQueryErrorHandler(({ title, description }) => {
      toast.error(title, description);
    });
    return () => registerGlobalQueryErrorHandler(null);
  }, [toast]);

  return null;
}
