import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-surface-200 pb-5 dark:border-surface-800 md:flex-row md:items-end md:justify-between md:gap-6',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-display-sm text-surface-900 dark:text-surface-50">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-body-md text-surface-600 dark:text-surface-400">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
