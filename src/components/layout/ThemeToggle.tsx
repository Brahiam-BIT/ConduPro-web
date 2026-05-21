import { Moon, Sun, Laptop } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';
import { cn } from '@/utils/cn';

const MODES: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Tema claro' },
  { value: 'system', icon: Laptop, label: 'Tema del sistema' },
  { value: 'dark', icon: Moon, label: 'Tema oscuro' },
];

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-bg-secondary p-0.5"
    >
      {MODES.map(({ value, icon: Icon, label }) => {
        const isActive = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            onClick={() => setMode(value)}
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150',
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
