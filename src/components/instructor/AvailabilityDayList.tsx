import { cn } from '@/utils/cn';
import { AvailabilityCellContent } from '@/components/instructor/AvailabilityCellContent';
import {
  AVAILABILITY_HOURS,
  availabilityDateKey,
  type WorkWeekColumn,
} from '@/utils/availability';
import type { AvailabilityCellData } from '@/types/availability.types';
import type { AvailabilityCellState } from './AvailabilityGrid';

interface AvailabilityDayListProps {
  weekColumns: WorkWeekColumn[];
  grid: Map<string, AvailabilityCellData>;
  scheduledCells: Map<string, AvailabilityCellData>;
  selectedKey: string | null;
  onPaint: (date: Date, hour: number) => void;
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

const STATE_LABELS: Record<AvailabilityCellState, string> = {
  available: 'Disponible',
  unavailable: 'No disponible',
  scheduled: 'Clase agendada',
  past: 'Día pasado',
};

const STATE_STYLES: Record<AvailabilityCellState, string> = {
  available: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  unavailable: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  scheduled: 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
  past: 'cursor-not-allowed bg-surface-100 text-surface-400 opacity-60 dark:bg-surface-900/80',
};

export function AvailabilityDayList({
  weekColumns,
  grid,
  scheduledCells,
  selectedKey,
  onPaint,
}: AvailabilityDayListProps) {
  return (
    <div className="flex flex-col gap-6">
      {weekColumns.map((col) => (
        <section key={col.dayOfWeek}>
          <h3
            className={cn(
              'mb-2 flex flex-wrap items-baseline gap-2 capitalize',
              col.isToday
                ? 'text-primary-800 dark:text-primary-100'
                : 'text-surface-800 dark:text-surface-100',
            )}
          >
            <span className="text-body-md font-bold">{col.fullLabel}</span>
            {col.isToday ? (
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-body-xs font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                Hoy
              </span>
            ) : null}
            {col.isPast ? (
              <span className="text-body-xs font-medium text-surface-400">Pasado</span>
            ) : null}
          </h3>
          <ul className="flex flex-col gap-1">
            {AVAILABILITY_HOURS.map((hour) => {
              const key = availabilityDateKey(col.date, hour);
              const state = getCellState(key, grid, scheduledCells, col.isPast);
              const cell = grid.get(key);
              const scheduled = scheduledCells.get(key);
              const locked = state === 'scheduled' || state === 'past';
              const showContent =
                (state === 'available' && cell) || (state === 'scheduled' && scheduled);
              const contentCell = state === 'scheduled' ? scheduled : cell;
              return (
                <li key={key}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => !col.isPast && onPaint(col.date, hour)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors duration-150',
                      STATE_STYLES[state],
                      locked && 'cursor-not-allowed opacity-90',
                      selectedKey === key && 'ring-2 ring-primary-500',
                    )}
                  >
                    <span className="inline-flex min-w-0 flex-1 items-center gap-3">
                      <span className="shrink-0 tabular-nums">
                        {hour}:00 – {hour + 1}:00
                      </span>
                      {showContent && contentCell ? (
                        <span className="min-w-0 flex-1">
                          <AvailabilityCellContent
                            cell={contentCell}
                            compact
                            variant={state === 'scheduled' ? 'scheduled' : 'available'}
                          />
                        </span>
                      ) : (
                        <span className="text-caption">{STATE_LABELS[state]}</span>
                      )}
                    </span>
                    {!showContent ? (
                      <span className="shrink-0 text-caption">{STATE_LABELS[state]}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
