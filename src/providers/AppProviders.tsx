import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { AuthProvider } from './AuthProvider';
import { AuthGate } from './AuthGate';
import { ErrorBoundary } from './ErrorBoundary';
import { QueryErrorBridge } from './QueryErrorBridge';

/**
 * AppProviders
 * Wraps the whole application with the providers required by every page:
 *   ErrorBoundary → Query → Theme → Toast → Auth → AuthGate (refresh silencioso)
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <QueryErrorBridge />
            <AuthProvider>
              <AuthGate>{children}</AuthGate>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
