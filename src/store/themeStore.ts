import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { applyThemeMode, type ThemeMode } from '@/lib/theme';

export type { ThemeMode };

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => {
        set({ mode });
        applyThemeMode(mode);
      },
      toggle: () => {
        const current = get().mode;
        const resolved =
          current === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : current;
        const next: ThemeMode = resolved === 'dark' ? 'light' : 'dark';
        set({ mode: next });
        applyThemeMode(next);
      },
    }),
    {
      name: 'condupro:theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
