import { cn } from '@/utils/cn';
import {
  AVAILABILITY_HOURS,
  availabilitySlotKey,
  WEEKDAY_COLUMNS,
} from '@/utils/instructor';
import type { AvailabilityCellState } from './AvailabilityGrid';

interface AvailabilityDayListProps {
  grid: Map<string, boolean>;
  lockedSlots: Set<string>;
  onToggle: (dayOfWeek: number, hour: number) => void;
}

function getCellState(
  key: string,
  grid: Map<string, boolean>,
  lockedSlots: Set<string>,
): AvailabilityCellState {
  if (lockedSlots.has(key)) return 'scheduled';
  return grid.get(key) ? 'available' : 'unavailable';
}

const STATE_LABELS: Record<AvailabilityCellState, string> = {
  available: 'Disponible',
  unavailable: 'No disponible',
  scheduled: 'Clase agendada',
};

const STATE_STYLES: Record<AvailabilityCellState, string> = {
  available: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  unavailable: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  scheduled: 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
};

/** Vista móvil: lista de franjas agrupadas por día. */
export function AvailabilityDayList({ grid, lockedSlots, onToggle }: AvailabilityDayListProps) {
  return (
    <div className="flex flex-col gap-6">
      {WEEKDAY_COLUMNS.map((col) => (
        <section key={col.dayOfWeek}>
          <h3 className="mb-2 text-heading-sm text-surface-800 dark:text-surface-100">{col.label}</h3>
          <ul className="flex flex-col gap-1">
            {AVAILABILITY_HOURS.map((hour) => {
              const key = availabilitySlotKey(col.dayOfWeek, hour);
              const state = getCellState(key, grid, lockedSlots);
              const locked = state === 'scheduled';
              return (
                <li key={key}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => onToggle(col.dayOfWeek, hour)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors duration-150',
                      STATE_STYLES[state],
                      locked && 'cursor-not-allowed opacity-90',
                    )}
                  >
                    <span>{hour}:00 – {hour + 1}:00</span>
                    <span className="text-caption">{STATE_LABELS[state]}</span>
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
