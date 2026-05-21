import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { AuthProvider } from './AuthProvider';
import { AuthGate } from './AuthGate';
import { ErrorBoundary } from './ErrorBoundary';
import { QueryErrorBridge } from './QueryErrorBridge';
import { WipeOverlayProvider } from '@/components/layout/PageTransition';

/**
 * AppProviders
 * Wraps the whole application with the providers required by every page:
 *   ErrorBoundary → Query → Theme → Toast → Auth → AuthGate (refresh silencioso)
 *   → WipeOverlay (overlay GSAP de transiciones fuertes)
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <QueryErrorBridge />
            <AuthProvider>
              <WipeOverlayProvider>
                <AuthGate>{children}</AuthGate>
              </WipeOverlayProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
