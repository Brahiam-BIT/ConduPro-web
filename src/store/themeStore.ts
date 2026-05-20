import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      toggle: () => {
        const current = get().mode;
        const resolved =
          current === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : current;
        set({ mode: resolved === 'dark' ? 'light' : 'dark' });
      },
    }),
    {
      name: 'condupro:theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
