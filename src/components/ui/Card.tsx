import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Card
 * Variants: default | elevated | glass (backdrop-blur)
 * Uses rounded-xl by default.
 */
export type CardVariant = 'default' | 'elevated' | 'glass';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section';
}

const VARIANT_MAP: Record<CardVariant, string> = {
  default:
    'bg-surface-50 border border-surface-200 dark:bg-surface-900 dark:border-surface-800',
  elevated:
    'bg-surface-50 border border-surface-200/70 shadow-md dark:bg-surface-900 dark:border-surface-800',
  glass:
    'bg-surface-50/70 backdrop-blur-md border border-surface-200/60 shadow-sm dark:bg-surface-900/60 dark:border-surface-800/60',
};

const PADDING_MAP = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', as: Tag = 'div', className, children, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      className={cn(
        'rounded-xl transition-shadow duration-200 ease-smooth',
        VARIANT_MAP[variant],
        PADDING_MAP[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mb-3 flex items-start justify-between gap-3', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <h3 className={cn('text-heading-sm text-surface-800 dark:text-surface-100', className)}>{children}</h3>
  );
}

export function CardDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn('text-body-sm text-surface-600 dark:text-surface-400', className)}>{children}</p>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('mt-4 flex items-center justify-end gap-2 border-t border-surface-200 pt-4 dark:border-surface-800', className)}>
      {children}
    </div>
  );
}
