import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Spinner } from './Spinner';
import { cn } from '@/utils/cn';

/**
 * Button
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes:    sm | md | lg
 * States:   loading (shows spinner, disables the button), disabled
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_MAP: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md focus-visible:ring-primary-500',
  secondary:
    'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-200 dark:hover:bg-primary-900/60 focus-visible:ring-primary-500',
  ghost:
    'bg-transparent text-surface-700 hover:bg-surface-200 active:bg-surface-300 dark:text-surface-200 dark:hover:bg-surface-800 dark:active:bg-surface-700 focus-visible:ring-surface-400',
  danger:
    'bg-error-600 text-white hover:bg-error-700 active:bg-error-700 shadow-sm hover:shadow-md focus-visible:ring-error-500',
  outline:
    'bg-transparent border border-surface-300 text-surface-800 hover:bg-surface-100 hover:border-surface-400 dark:border-surface-700 dark:text-surface-100 dark:hover:bg-surface-800 focus-visible:ring-primary-500',
};

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm rounded-md gap-1.5',
  md: 'h-10 px-4 text-body-sm rounded-lg gap-2',
  lg: 'h-12 px-5 text-body-md rounded-lg gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    iconLeft,
    iconRight,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-all duration-150 ease-smooth',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-100 dark:focus-visible:ring-offset-surface-950',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_MAP[variant],
        SIZE_MAP[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} className="mr-1" />
      ) : iconLeft ? (
        <span className="inline-flex shrink-0 items-center">{iconLeft}</span>
      ) : null}
      <span className="inline-flex items-center">{children}</span>
      {!isLoading && iconRight ? (
        <span className="inline-flex shrink-0 items-center">{iconRight}</span>
      ) : null}
    </button>
  );
});
