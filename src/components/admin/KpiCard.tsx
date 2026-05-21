import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { CountUpNumber } from '@/components/shared/CountUpNumber';
import { MotionCard } from '@/components/shared/MotionCard';
import { cn } from '@/utils/cn';

interface KpiCardProps {
  label: string;
  /**
   * Valor a mostrar. Si es `number`, se anima con `CountUpNumber`.
   * Si es un nodo React (ej. ya viene formateado como "87%"), se renderiza tal cual.
   */
  value: ReactNode;
  icon?: ReactNode;
  trend?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * KpiCard — card de métrica para dashboards.
 * Visual update Fase D:
 *   - Hover lift (`MotionCard`).
 *   - Count-up automático cuando el `value` es numérico.
 */
export function KpiCard({ label, value, icon, trend, isLoading, className }: KpiCardProps) {
  if (isLoading) {
    return (
      <Card variant="elevated" padding="md" className={className}>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-9 w-20" />
      </Card>
    );
  }

  const renderValue =
    typeof value === 'number' ? <CountUpNumber value={value} /> : value;

  return (
    <MotionCard
      variant="elevated"
      padding="md"
      className={cn('relative overflow-hidden', className)}
    >
      {icon ? (
        <div className="absolute right-4 top-4 text-text-tertiary">{icon}</div>
      ) : null}
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">{renderValue}</p>
      {trend ? <p className="mt-1 text-xs text-text-secondary">{trend}</p> : null}
    </MotionCard>
  );
}
