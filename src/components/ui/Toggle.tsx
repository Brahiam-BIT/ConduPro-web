import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/**
 * Toggle
 * Accessible switch built on top of <input type="checkbox" role="switch">.
 * The track and thumb are siblings of the hidden input so peer variants
 * drive the visual state purely from CSS.
 * Sizes: sm | md
 */
export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  containerClassName?: string;
}

export function Toggle({
  label,
  description,
  size = 'md',
  checked,
  disabled,
  id,
  containerClassName,
  className,
  ...rest
}: ToggleProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isSm = size === 'sm';

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'group flex items-start gap-3',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        containerClassName,
      )}
    >
      <span className="relative inline-flex shrink-0 items-center">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden
          className={cn(
            'block rounded-full bg-surface-300 transition-colors duration-200 ease-smooth',
            'peer-checked:bg-primary-600',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-100 dark:peer-focus-visible:ring-offset-surface-950',
            'dark:bg-surface-700',
            isSm ? 'h-5 w-9' : 'h-6 w-11',
            className,
          )}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute left-0.5 inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ease-smooth',
            isSm ? 'h-4 w-4 peer-checked:translate-x-4' : 'h-5 w-5 peer-checked:translate-x-5',
          )}
        />
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label ? <span className="text-body-sm font-medium text-surface-800 dark:text-surface-100">{label}</span> : null}
          {description ? (
            <span className="text-caption text-surface-500 dark:text-surface-400">{description}</span>
          ) : null}
        </span>
      )}
    </label>
  );
}
