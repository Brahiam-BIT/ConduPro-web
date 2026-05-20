import { Fragment } from 'react';
import { cn } from '@/utils/cn';
import {
  AVAILABILITY_HOURS,
  availabilitySlotKey,
  WEEKDAY_COLUMNS,
} from '@/utils/instructor';

export type AvailabilityCellState = 'available' | 'unavailable' | 'scheduled';

interface AvailabilityGridProps {
  grid: Map<string, boolean>;
  lockedSlots: Set<string>;
  onToggle: (dayOfWeek: number, hour: number) => void;
  className?: string;
}

function getCellState(
  key: string,
  grid: Map<string, boolean>,
  lockedSlots: Set<string>,
): AvailabilityCellState {
  if (lockedSlots.has(key)) return 'scheduled';
  return grid.get(key) ? 'available' : 'unavailable';
}

const STATE_STYLES: Record<AvailabilityCellState, string> = {
  available:
    'bg-success-100 hover:bg-success-200 dark:bg-success-500/25 dark:hover:bg-success-500/35 border-success-300 dark:border-success-500/40',
  unavailable:
    'bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 border-surface-300 dark:border-surface-700',
  scheduled:
    'bg-primary-100 dark:bg-primary-500/30 border-primary-400 dark:border-primary-500/50 cursor-not-allowed',
};

export function AvailabilityGrid({ grid, lockedSlots, onToggle, className }: AvailabilityGridProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <div
        className="grid min-w-[720px] gap-1"
        style={{
          gridTemplateColumns: `56px repeat(${WEEKDAY_COLUMNS.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="p-2" />
        {WEEKDAY_COLUMNS.map((col) => (
          <div
            key={col.dayOfWeek}
            className="p-2 text-center text-caption font-semibold uppercase text-surface-600 dark:text-surface-300"
          >
            {col.label}
          </div>
        ))}

        {AVAILABILITY_HOURS.map((hour) => (
          <Fragment key={hour}>
            <div className="flex items-center justify-end pr-2 text-caption text-surface-500 dark:text-surface-400">
              {hour}:00
            </div>
            {WEEKDAY_COLUMNS.map((col) => {
              const key = availabilitySlotKey(col.dayOfWeek, hour);
              const state = getCellState(key, grid, lockedSlots);
              const locked = state === 'scheduled';
              return (
                <button
                  key={key}
                  type="button"
                  disabled={locked}
                  aria-label={`${col.label} ${hour}:00 — ${state === 'scheduled' ? 'clase agendada' : state === 'available' ? 'disponible' : 'no disponible'}`}
                  onClick={() => onToggle(col.dayOfWeek, hour)}
                  className={cn(
                    'h-10 rounded-md border transition-colors duration-150 ease-smooth',
                    STATE_STYLES[state],
                    locked && 'opacity-90',
                  )}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-caption text-surface-600 dark:text-surface-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-success-500" /> Disponible
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-surface-400 dark:bg-surface-600" /> No disponible
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary-500" /> Con clase agendada
        </span>
      </div>
    </div>
  );
}
