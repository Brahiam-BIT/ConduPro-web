import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Badge
 * Variants: success | warning | error | info | neutral | primary
 * Sizes: sm | md
 */
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  iconLeft?: ReactNode;
  dot?: boolean;
}

const VARIANT_MAP: Record<BadgeVariant, string> = {
  success:
    'bg-success-50 text-success-700 border-success-100 dark:bg-success-500/15 dark:text-success-500 dark:border-success-500/30',
  warning:
    'bg-warning-50 text-warning-700 border-warning-100 dark:bg-warning-500/15 dark:text-warning-500 dark:border-warning-500/30',
  error:
    'bg-error-50 text-error-700 border-error-100 dark:bg-error-500/15 dark:text-error-500 dark:border-error-500/30',
  info: 'bg-info-50 text-info-700 border-info-100 dark:bg-info-500/15 dark:text-info-500 dark:border-info-500/30',
  neutral:
    'bg-surface-200 text-surface-700 border-surface-300 dark:bg-surface-800 dark:text-surface-200 dark:border-surface-700',
  primary:
    'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-500/15 dark:text-primary-300 dark:border-primary-500/30',
};

const SIZE_MAP: Record<BadgeSize, string> = {
  sm: 'h-5 px-1.5 text-[11px] gap-1 rounded-md',
  md: 'h-6 px-2 text-caption gap-1.5 rounded-md',
};

const DOT_COLOR: Record<BadgeVariant, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
  neutral: 'bg-surface-500',
  primary: 'bg-primary-500',
};

export function Badge({
  variant = 'neutral',
  size = 'md',
  iconLeft,
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border font-medium uppercase tracking-wide',
        VARIANT_MAP[variant],
        SIZE_MAP[size],
        className,
      )}
      {...rest}
    >
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', DOT_COLOR[variant])} aria-hidden /> : iconLeft}
      {children}
    </span>
  );
}
