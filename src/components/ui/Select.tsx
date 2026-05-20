import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { InputState } from './Input';

/**
 * Select
 * Native <select> styled to match Input so labels/borders/states feel identical.
 */
export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  state?: InputState;
  options: SelectOption<string>[];
  placeholder?: string;
  containerClassName?: string;
}

const STATE_RING: Record<InputState, string> = {
  default:
    'border-surface-300 focus-within:border-primary-500 focus-within:shadow-glow dark:border-surface-700',
  error:
    'border-error-500 focus-within:border-error-500 focus-within:shadow-glow-error dark:border-error-500/70',
  success:
    'border-success-500 focus-within:border-success-500 focus-within:shadow-glow-success dark:border-success-500/70',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helperText,
    errorMessage,
    state,
    options,
    placeholder,
    containerClassName,
    className,
    id,
    disabled,
    required,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const computedState: InputState = errorMessage ? 'error' : state ?? 'default';
  const describedById = errorMessage || helperText ? `${selectId}-helper` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label ? (
        <label htmlFor={selectId} className="text-label text-surface-700 dark:text-surface-200">
          {label}
          {required ? <span className="ml-0.5 text-error-500">*</span> : null}
        </label>
      ) : null}

      <div
        className={cn(
          'relative flex h-11 items-center rounded-lg border bg-surface-50 transition-all duration-150 ease-smooth',
          'dark:bg-surface-900',
          STATE_RING[computedState],
          disabled && 'opacity-60 cursor-not-allowed bg-surface-200 dark:bg-surface-800',
        )}
      >
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={computedState === 'error' || undefined}
          aria-describedby={describedById}
          className={cn(
            'h-full w-full appearance-none bg-transparent px-3 pr-9 text-body-md text-surface-900 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed',
            'dark:text-surface-100',
            className,
          )}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 h-4 w-4 text-surface-500 dark:text-surface-400"
          aria-hidden
        />
      </div>

      {errorMessage ? (
        <p id={describedById} className="text-caption text-error-600 dark:text-error-500" role="alert">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p id={describedById} className="text-caption text-surface-500 dark:text-surface-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
