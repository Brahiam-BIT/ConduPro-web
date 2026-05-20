import type { ScheduleStatus, ScheduleType } from '@/types/schedule.types';
import type { BadgeVariant } from '@/components/ui/Badge';

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  THEORY: 'Teórica',
  PRACTICE: 'Práctica',
};

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

export const SCHEDULE_STATUS_VARIANT: Record<ScheduleStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
};

export const SCHEDULE_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
] as const;

export const SCHEDULE_TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'THEORY', label: 'Teórica' },
  { value: 'PRACTICE', label: 'Práctica' },
] as const;
