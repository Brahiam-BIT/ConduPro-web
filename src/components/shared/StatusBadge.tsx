import { Badge } from '@/components/ui/Badge';
import {
  SCHEDULE_STATUS_LABELS,
  SCHEDULE_STATUS_VARIANT,
  SCHEDULE_TYPE_LABELS,
} from '@/constants/schedules';
import type { ScheduleStatus, ScheduleType } from '@/types/schedule.types';

export function ScheduleStatusBadge({ status }: { status: ScheduleStatus }) {
  return (
    <Badge variant={SCHEDULE_STATUS_VARIANT[status]} dot size="sm">
      {SCHEDULE_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ScheduleTypeBadge({ type }: { type: ScheduleType }) {
  return (
    <Badge variant={type === 'THEORY' ? 'primary' : 'info'} size="sm">
      {SCHEDULE_TYPE_LABELS[type]}
    </Badge>
  );
}
