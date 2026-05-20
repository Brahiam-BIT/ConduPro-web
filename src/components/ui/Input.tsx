import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Input
 * - Label above the field
 * - Focus ring with the primary color
 * - States: default | error | success
 * - Supports iconLeft, helperText, errorMessage
 */
export type InputState = 'default' | 'error' | 'success';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  state?: InputState;
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

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    errorMessage,
    iconLeft,
    iconRight,
    state,
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
  const inputId = id ?? generatedId;
  const computedState: InputState = errorMessage ? 'error' : state ?? 'default';
  const describedById = errorMessage || helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-label text-surface-700 dark:text-surface-200"
        >
          {label}
          {required ? <span className="ml-0.5 text-error-500">*</span> : null}
        </label>
      ) : null}

      <div
        className={cn(
          'flex h-11 items-center gap-2 rounded-lg border bg-surface-50 px-3 transition-all duration-150 ease-smooth',
          'dark:bg-surface-900',
          STATE_RING[computedState],
          disabled && 'opacity-60 cursor-not-allowed bg-surface-200 dark:bg-surface-800',
        )}
      >
        {iconLeft ? (
          <span className="flex shrink-0 items-center text-surface-500 dark:text-surface-400">
            {iconLeft}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={computedState === 'error' || undefined}
          aria-describedby={describedById}
          className={cn(
            'h-full w-full bg-transparent text-body-md text-surface-900 placeholder:text-surface-400 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed',
            'dark:text-surface-100 dark:placeholder:text-surface-500',
            className,
          )}
          {...rest}
        />
        {iconRight ? (
          <span className="flex shrink-0 items-center text-surface-500 dark:text-surface-400">
            {iconRight}
          </span>
        ) : computedState === 'success' ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success-500" aria-hidden />
        ) : computedState === 'error' ? (
          <AlertCircle className="h-4 w-4 shrink-0 text-error-500" aria-hidden />
        ) : null}
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
