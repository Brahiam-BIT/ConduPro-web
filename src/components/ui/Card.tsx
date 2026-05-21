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
  default: 'border border-border bg-bg-primary',
  elevated: 'border border-border bg-bg-primary shadow-sm',
  glass: 'border border-border bg-bg-primary/80 shadow-sm backdrop-blur-md',
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
    <h3 className={cn('text-heading-sm text-text-primary', className)}>{children}</h3>
  );
}

export function CardDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn('text-body-sm text-text-secondary', className)}>{children}</p>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('mt-4 flex items-center justify-end gap-2 border-t border-border pt-4', className)}>
      {children}
    </div>
  );
}
