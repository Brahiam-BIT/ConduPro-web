import { useEffect, type ReactNode } from 'react';
import { applyThemeMode } from '@/lib/theme';
import { useThemeStore } from '@/store/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    applyThemeMode(mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => applyThemeMode('system');
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [mode]);

  return <>{children}</>;
}
