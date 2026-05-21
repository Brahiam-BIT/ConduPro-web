import { BookOpen, Car } from 'lucide-react';
import { cn } from '@/utils/cn';
import { truncateTopicLabel } from '@/utils/availability';
import type { AvailabilityCellData } from '@/types/availability.types';

interface AvailabilityCellContentProps {
  cell: AvailabilityCellData;
  compact?: boolean;
  /** Verde = tu disponibilidad; morado = clase ya agendada. */
  variant?: 'available' | 'scheduled';
}

const TONE = {
  available: {
    icon: 'text-success-700 dark:text-success-400',
    code: 'text-success-800 dark:text-success-300',
    label: 'text-success-800 dark:text-success-200',
    practice: 'text-success-800 dark:text-success-300',
  },
  scheduled: {
    icon: 'text-primary-700 dark:text-primary-300',
    code: 'text-primary-800 dark:text-primary-200',
    label: 'text-primary-900 dark:text-primary-100',
    practice: 'text-primary-800 dark:text-primary-200',
  },
} as const;

/** Teoría (materia) o práctica dentro de una celda. */
export function AvailabilityCellContent({
  cell,
  compact = false,
  variant = 'available',
}: AvailabilityCellContentProps) {
  const tone = TONE[variant];
  if (cell.classType === 'THEORY') {
    const title = cell.theoryTopicTitle
      ? truncateTopicLabel(cell.theoryTopicTitle, compact ? 22 : 32)
      : 'Teoría';
    return (
      <div
        className={cn(
          'flex min-w-0 flex-col items-center justify-center gap-0.5 text-center',
          compact ? 'px-0.5' : 'px-1 py-0.5',
        )}
      >
        <BookOpen
          className={cn('shrink-0', tone.icon, compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
          aria-hidden
        />
        {cell.licenseCategoryCode ? (
          <span className={cn('text-[9px] font-bold leading-none', tone.code)}>
            {cell.licenseCategoryCode}
          </span>
        ) : null}
        <span
          className={cn(
            'w-full font-medium leading-tight',
            tone.label,
            compact ? 'line-clamp-1 text-[9px]' : 'line-clamp-2 text-[10px]',
          )}
          title={cell.theoryTopicTitle ?? undefined}
        >
          {title}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-0.5">
      <Car className={cn(tone.icon, compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} aria-hidden />
      <span className={cn('font-medium', tone.practice, compact ? 'text-[8px]' : 'text-[9px]')}>
        Práctica
      </span>
    </div>
  );
}
