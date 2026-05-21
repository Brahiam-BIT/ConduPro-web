import { Fragment } from 'react';
import { BookOpen, Car } from 'lucide-react';
import { AvailabilityCellContent } from '@/components/instructor/AvailabilityCellContent';
import { cn } from '@/utils/cn';
import {
  AVAILABILITY_HOURS,
  availabilityDateKey,
  type WorkWeekColumn,
} from '@/utils/availability';
import type { AvailabilityCellData } from '@/types/availability.types';

export type AvailabilityCellState = 'available' | 'unavailable' | 'scheduled' | 'past';

interface AvailabilityGridProps {
  weekColumns: WorkWeekColumn[];
  grid: Map<string, AvailabilityCellData>;
  scheduledCells: Map<string, AvailabilityCellData>;
  selectedKey: string | null;
  onPaint: (date: Date, hour: number) => void;
  className?: string;
}

function getCellState(
  key: string,
  grid: Map<string, AvailabilityCellData>,
  scheduledCells: Map<string, AvailabilityCellData>,
  isPast: boolean,
): AvailabilityCellState {
  if (isPast) return 'past';
  if (scheduledCells.has(key)) return 'scheduled';
  const cell = grid.get(key);
  return cell?.available ? 'available' : 'unavailable';
}

const STATE_STYLES: Record<AvailabilityCellState, string> = {
  available:
    'bg-success-100 hover:bg-success-200 dark:bg-success-500/25 dark:hover:bg-success-500/35 border-success-300 dark:border-success-500/40',
  unavailable:
    'bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 border-surface-300 dark:border-surface-700',
  scheduled:
    'bg-primary-100 dark:bg-primary-500/30 border-primary-400 dark:border-primary-500/50 cursor-not-allowed',
  past: 'cursor-not-allowed border-surface-200 bg-surface-100/90 opacity-55 dark:border-surface-800 dark:bg-surface-900/70',
};

export function AvailabilityGrid({
  weekColumns,
  grid,
  scheduledCells,
  selectedKey,
  onPaint,
  className,
}: AvailabilityGridProps) {
  const headerMinH = 'min-h-[3rem]';

  return (
    <div className={cn('overflow-x-auto px-0.5 pb-1 pt-0.5', className)}>
      <div
        className="grid min-w-[620px] gap-1"
        style={{
          gridTemplateColumns: `44px repeat(${weekColumns.length}, minmax(72px, 1fr))`,
        }}
      >
        <div className={cn('flex items-end justify-end pb-1 pr-0.5', headerMinH)} aria-hidden />
        {weekColumns.map((col) => (
          <div
            key={col.dayOfWeek}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-md border-2 px-1 py-1.5 text-center',
              headerMinH,
              col.isPast &&
                'border-transparent bg-surface-100 opacity-50 dark:bg-surface-900/80',
              !col.isPast &&
                col.isToday &&
                'border-primary-400 bg-primary-50 dark:border-primary-500/60 dark:bg-primary-500/15',
              !col.isPast &&
                !col.isToday &&
                'border-transparent bg-transparent',
            )}
          >
            <span
              className={cn(
                'text-body-sm font-bold capitalize leading-tight',
                col.isPast && 'text-surface-400 dark:text-surface-500',
                !col.isPast && col.isToday && 'text-primary-800 dark:text-primary-100',
                !col.isPast && !col.isToday && 'text-primary-700 dark:text-primary-300',
              )}
            >
              {col.headerLabel}
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wide',
                col.isPast && 'text-surface-400',
                col.isToday && !col.isPast && 'text-primary-600 dark:text-primary-400',
                !col.isToday && !col.isPast && 'invisible select-none',
              )}
              aria-hidden={!col.isToday || col.isPast}
            >
              {col.isPast ? 'Pasado' : 'Hoy'}
            </span>
          </div>
        ))}

        {AVAILABILITY_HOURS.map((hour) => (
          <Fragment key={hour}>
            <div className="flex min-h-[2.35rem] items-center justify-end pr-1 text-[11px] font-medium tabular-nums text-surface-500 dark:text-surface-400">
              {hour}:00
            </div>
            {weekColumns.map((col) => {
              const key = availabilityDateKey(col.date, hour);
              const state = getCellState(key, grid, scheduledCells, col.isPast);
              const cell = grid.get(key);
              const scheduled = scheduledCells.get(key);
              const locked = state === 'scheduled' || state === 'past';
              const isSelected = selectedKey === key && !col.isPast;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={locked}
                  aria-label={`${col.fullLabel} ${hour}:00`}
                  aria-pressed={state === 'available'}
                  onClick={() => !col.isPast && onPaint(col.date, hour)}
                  title={
                    col.isPast
                      ? `${col.fullLabel} — ya pasó, no se puede modificar`
                      : state === 'scheduled' && scheduled
                        ? scheduled.classType === 'THEORY' && scheduled.theoryTopicTitle
                          ? `Clase agendada: ${scheduled.licenseCategoryCode ? `${scheduled.licenseCategoryCode}: ` : ''}${scheduled.theoryTopicTitle}`
                          : 'Clase práctica agendada'
                        : state === 'available' &&
                            cell?.classType === 'THEORY' &&
                            cell.theoryTopicTitle
                          ? `${col.fullLabel} ${hour}:00 — ${cell.licenseCategoryCode ? `${cell.licenseCategoryCode}: ` : ''}${cell.theoryTopicTitle}`
                          : `${col.fullLabel} ${hour}:00`
                  }
                  className={cn(
                    'relative flex min-h-[2.35rem] flex-col items-center justify-center rounded-md border px-0.5 transition-colors duration-150',
                    STATE_STYLES[state],
                    locked && state !== 'past' && 'opacity-90',
                    isSelected && 'z-[1] ring-2 ring-inset ring-primary-500 dark:ring-primary-400',
                  )}
                >
                  {state === 'available' && cell ? (
                    <AvailabilityCellContent cell={cell} compact variant="available" />
                  ) : null}
                  {state === 'scheduled' && scheduled ? (
                    <AvailabilityCellContent cell={scheduled} compact variant="scheduled" />
                  ) : null}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-surface-600 dark:text-surface-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-success-500" /> Verde — solo ese día (Guardar)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-3 w-3" /> Teoría (materia)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Car className="h-3 w-3" /> Práctica
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary-500" /> Morado — clase ya reservada (solo lectura)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-surface-300 dark:bg-surface-600" /> Día pasado
        </span>
      </div>
    </div>
  );
}
