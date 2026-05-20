import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getPasswordStrength, type PasswordStrengthLevel } from '@/utils/passwordStrength';

const BAR_COLORS: Record<PasswordStrengthLevel, string> = {
  empty: 'bg-surface-300 dark:bg-surface-700',
  weak: 'bg-error-500',
  fair: 'bg-warning-500',
  good: 'bg-info-500',
  strong: 'bg-success-500',
};

const LABEL_COLORS: Record<PasswordStrengthLevel, string> = {
  empty: 'text-surface-500',
  weak: 'text-error-600 dark:text-error-500',
  fair: 'text-warning-600 dark:text-warning-500',
  good: 'text-info-600 dark:text-info-500',
  strong: 'text-success-600 dark:text-success-500',
};

interface PasswordStrengthIndicatorProps {
  password: string;
  showChecks?: boolean;
}

export function PasswordStrengthIndicator({ password, showChecks = true }: PasswordStrengthIndicatorProps) {
  const { level, score, checks, label } = getPasswordStrength(password);

  if (!password) return null;

  const criteria = [
    { key: 'length', met: checks.length, text: 'Al menos 8 caracteres' },
    { key: 'lowercase', met: checks.lowercase, text: 'Una minúscula' },
    { key: 'uppercase', met: checks.uppercase, text: 'Una mayúscula' },
    { key: 'number', met: checks.number, text: 'Un número' },
    { key: 'special', met: checks.special, text: 'Un carácter especial (opcional)' },
  ] as const;

  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-200',
                i < score ? BAR_COLORS[level] : 'bg-surface-200 dark:bg-surface-800',
              )}
            />
          ))}
        </div>
        <span className={cn('text-caption font-medium', LABEL_COLORS[level])}>{label}</span>
      </div>

      {showChecks ? (
        <ul className="grid gap-1 sm:grid-cols-2">
          {criteria.map(({ key, met, text }) => (
            <li key={key} className="flex items-center gap-1.5 text-caption">
              {met ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-success-500" aria-hidden />
              ) : (
                <X className="h-3.5 w-3.5 shrink-0 text-surface-400" aria-hidden />
              )}
              <span className={met ? 'text-surface-600 dark:text-surface-300' : 'text-surface-500'}>
                {text}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
