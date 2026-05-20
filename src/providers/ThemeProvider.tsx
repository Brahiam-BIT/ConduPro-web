import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@/store/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

function applyTheme(mode: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => applyTheme('system');
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [mode]);

  return <>{children}</>;
}
