import { Fragment } from 'react';
import { startOfWeek } from 'date-fns';
import { cn } from '@/utils/cn';
import { SCHEDULE_TYPE_LABELS } from '@/constants/schedules';
import { formatTime } from '@/utils/formatDate';
import {
  DASHBOARD_HOUR_ROWS,
  formatStudentName,
  schedulesForWeekCell,
  WEEKDAY_COLUMNS,
} from '@/utils/instructor';
import type { Schedule } from '@/types/schedule.types';

interface WeeklyScheduleGridProps {
  schedules: Schedule[];
  className?: string;
  onScheduleClick?: (schedule: Schedule, cellSchedules: Schedule[]) => void;
}

/**
 * Mini calendario semanal de solo lectura: 7 columnas × 8 filas horarias.
 */
export function WeeklyScheduleGrid({
  schedules,
  className,
  onScheduleClick,
}: WeeklyScheduleGridProps) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const handleCellClick = (cellSchedules: Schedule[]) => {
    const first = cellSchedules[0];
    if (!first || !onScheduleClick) return;
    onScheduleClick(first, cellSchedules);
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div
        className="grid min-w-[640px] gap-px rounded-xl border border-surface-200 bg-surface-200 dark:border-surface-800 dark:bg-surface-800"
        style={{
          gridTemplateColumns: `48px repeat(${WEEKDAY_COLUMNS.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="bg-surface-50 p-2 dark:bg-surface-900" />
        {WEEKDAY_COLUMNS.map((col) => (
          <div
            key={col.dayOfWeek}
            className="bg-surface-50 p-2 text-center text-caption font-semibold uppercase text-surface-600 dark:bg-surface-900 dark:text-surface-300"
          >
            {col.label}
          </div>
        ))}

        {DASHBOARD_HOUR_ROWS.map((hour) => (
          <Fragment key={hour}>
            <div className="flex items-center justify-end bg-surface-50 px-2 text-caption text-surface-500 dark:bg-surface-900 dark:text-surface-400">
              {hour}:00
            </div>
            {WEEKDAY_COLUMNS.map((col) => {
              const cellSchedules = schedulesForWeekCell(
                schedules,
                weekStart,
                col.dayOfWeek,
                hour,
              );
              const primary = cellSchedules[0];
              const extraCount = cellSchedules.length - 1;
              const isClickable = !!primary && !!onScheduleClick;

              return (
                <div
                  key={`${col.dayOfWeek}-${hour}`}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  className={cn(
                    'min-h-[44px] bg-surface-50 p-0.5 dark:bg-surface-900',
                    primary && 'bg-primary-100/80 dark:bg-primary-500/20',
                    isClickable &&
                      'cursor-pointer transition-colors hover:bg-primary-200/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-primary-500/30',
                  )}
                  title={
                    primary
                      ? `${SCHEDULE_TYPE_LABELS[primary.type]} · ${formatStudentName(primary.student)}${extraCount > 0 ? ` (+${extraCount})` : ''}`
                      : undefined
                  }
                  onClick={() => handleCellClick(cellSchedules)}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleCellClick(cellSchedules);
                    }
                  }}
                >
                  {primary ? (
                    <div className="relative h-full rounded-md bg-primary-600 px-1 py-0.5 text-[10px] font-medium leading-tight text-white dark:bg-primary-500">
                      <span className="block truncate">{formatTime(primary.startAt)}</span>
                      <span className="block truncate opacity-90">
                        {primary.type === 'THEORY' && primary.theoryTopic
                          ? primary.theoryTopic.title
                          : formatStudentName(primary.student).split(' ')[0]}
                      </span>
                      {extraCount > 0 ? (
                        <span className="absolute -right-0.5 -top-0.5 rounded-full bg-surface-900 px-1 text-[9px] font-bold dark:bg-surface-950">
                          +{extraCount}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
