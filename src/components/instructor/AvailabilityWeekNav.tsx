import { addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatWorkWeekRange, getMondayOfWeek } from '@/utils/availability';

interface AvailabilityWeekNavProps {
  weekMonday: Date;
  lockedCount: number;
  onWeekChange: (monday: Date) => void;
}

export function AvailabilityWeekNav({
  weekMonday,
  lockedCount,
  onWeekChange,
}: AvailabilityWeekNavProps) {
  const thisWeekMonday = getMondayOfWeek(new Date());
  const isCurrentWeek = getMondayOfWeek(weekMonday).getTime() === thisWeekMonday.getTime();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-surface-800 dark:text-surface-100">
        <CalendarDays className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
        <div>
          <p className="text-body-sm font-semibold">Semana del {formatWorkWeekRange(weekMonday)}</p>
          <p className="text-body-xs text-surface-500 dark:text-surface-400">
            <span className="text-success-700 dark:text-success-400">Verde</span> = solo ese día y
            hora ·{' '}
            <span className="text-primary-700 dark:text-primary-300">Morado</span> = clases ya
            reservadas ({lockedCount})
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          iconLeft={<ChevronLeft className="h-4 w-4" />}
          onClick={() => onWeekChange(subWeeks(weekMonday, 1))}
          aria-label="Semana anterior"
        >
          Anterior
        </Button>
        {!isCurrentWeek ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onWeekChange(thisWeekMonday)}
          >
            Esta semana
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          iconRight={<ChevronRight className="h-4 w-4" />}
          onClick={() => onWeekChange(addWeeks(weekMonday, 1))}
          aria-label="Semana siguiente"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
