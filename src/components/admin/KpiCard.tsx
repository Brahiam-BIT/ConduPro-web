import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: string;
  isLoading?: boolean;
  className?: string;
}

export function KpiCard({ label, value, icon, trend, isLoading, className }: KpiCardProps) {
  if (isLoading) {
    return (
      <Card variant="elevated" padding="md" className={className}>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-9 w-20" />
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="md" className={cn('relative overflow-hidden', className)}>
      {icon ? (
        <div className="absolute right-4 top-4 text-primary-500/40 dark:text-primary-400/30">
          {icon}
        </div>
      ) : null}
      <p className="text-label text-surface-500 dark:text-surface-400">{label}</p>
      <p className="mt-1 text-display-sm text-surface-900 dark:text-surface-50">{value}</p>
      {trend ? (
        <p className="mt-1 text-caption text-surface-500 dark:text-surface-400">{trend}</p>
      ) : null}
    </Card>
  );
}
