export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'condupro:theme';

export function readStoredThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'system';
    const parsed = JSON.parse(raw) as {
      state?: { mode?: ThemeMode };
      mode?: ThemeMode;
    };
    const mode = parsed.state?.mode ?? parsed.mode;
    if (mode === 'light' || mode === 'dark' || mode === 'system') return mode;
    return 'system';
  } catch {
    return 'system';
  }
}

export function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Aplica clase `dark` y color-scheme en <html> (usar antes del primer paint y en ThemeProvider). */
export function applyThemeMode(mode: ThemeMode): void {
  const root = document.documentElement;
  const isDark = resolveIsDark(mode);
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
}
