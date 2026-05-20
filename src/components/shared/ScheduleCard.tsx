import { Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { formatDate, formatTime } from '@/utils/formatDate';
import { formatInstructorName } from '@/utils/schedule';
import type { AvailabilitySlot, Schedule } from '@/types/schedule.types';
import { ScheduleTypeBadge } from './StatusBadge';

interface AvailabilitySlotCardProps {
  slot: AvailabilitySlot;
  selected?: boolean;
  onSelect: () => void;
}

export function AvailabilitySlotCard({ slot, selected, onSelect }: AvailabilitySlotCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border-2 p-4 text-left transition-all duration-150 ease-smooth',
        selected
          ? 'border-primary-600 bg-primary-50 shadow-sm dark:border-primary-500 dark:bg-primary-500/15'
          : 'border-surface-200 bg-surface-50 hover:border-primary-300 hover:bg-primary-50/50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-primary-700',
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar name={slot.instructorName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold text-surface-800 dark:text-surface-100">
            {slot.instructorName}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-caption text-surface-500 dark:text-surface-400">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {formatTime(slot.startAt)} – {formatTime(slot.endAt)}
          </p>
        </div>
      </div>
    </button>
  );
}

interface NextClassCardProps {
  schedule: Schedule;
  className?: string;
}

/** Card destacada para la próxima clase en el dashboard. */
export function NextClassCard({ schedule, className }: NextClassCardProps) {
  const instructorName = formatInstructorName(schedule.instructor);

  return (
    <Card
      variant="elevated"
      className={cn(
        'relative overflow-hidden border-primary-200 bg-gradient-to-br from-primary-50 to-surface-50 dark:border-primary-500/30 dark:from-primary-950/40 dark:to-surface-900',
        className,
      )}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-400/10 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
            Próxima clase
          </p>
          <p className="mt-1 text-heading-md text-surface-900 dark:text-surface-50">
            {formatTime(schedule.startAt)}
          </p>
          <p className="text-body-sm text-surface-600 dark:text-surface-400">
            {formatDate(schedule.startAt, "EEEE, d 'de' MMMM")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <ScheduleTypeBadge type={schedule.type} />
          <p className="flex items-center gap-2 text-body-sm text-surface-700 dark:text-surface-200">
            <User className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden />
            {instructorName}
          </p>
        </div>
      </div>
    </Card>
  );
}
