import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { AuthProvider } from './AuthProvider';

/**
 * AppProviders
 * Wraps the whole application with the providers required by every page:
 *   Query → Theme → Toast → Auth
 *
 * Auth lives inside Toast/Query so it can call useToast / use the query client
 * once the rest of the integration is wired up.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
