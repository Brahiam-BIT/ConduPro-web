import { useState } from 'react';
import { ChevronDown, ChevronRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatTime } from '@/utils/formatDate';
import { practiceOfferKey } from '@/hooks/usePracticeClassOffers';
import type { PracticeClassDayGroup } from '@/utils/practiceClassOffers';
import type { PracticeClassOffer } from '@/types/practiceClassOffers.types';

const MAX_SLOTS_COLLAPSED = 6;

interface PracticeClassDaySectionProps {
  days: PracticeClassDayGroup[];
  joiningKey: string | null;
  onBook: (offer: PracticeClassOffer) => void;
}

function PracticeSlotRow({
  slot,
  joining,
  onBook,
}: {
  slot: PracticeClassOffer;
  joining: boolean;
  onBook: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-md border border-surface-200 bg-white px-2.5 py-1.5 dark:border-surface-800 dark:bg-surface-950/40">
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <span className="w-12 shrink-0 text-body-sm font-semibold tabular-nums text-surface-900 dark:text-surface-50">
          {formatTime(slot.startAt)}
        </span>
        {slot.vehicleHint ? (
          <span className="truncate text-body-xs text-surface-500" title={slot.vehicleHint}>
            {slot.vehicleHint}
          </span>
        ) : null}
      </div>
      <Button
        size="sm"
        variant="secondary"
        iconLeft={<UserPlus className="h-3.5 w-3.5" />}
        isLoading={joining}
        onClick={onBook}
      >
        <span className="hidden sm:inline">Reservar</span>
      </Button>
    </li>
  );
}

function InstructorBlock({
  instructor,
  joiningKey,
  onBook,
}: {
  instructor: PracticeClassDayGroup['instructors'][number];
  joiningKey: string | null;
  onBook: (offer: PracticeClassOffer) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleSlots = showAll ? instructor.slots : instructor.slots.slice(0, MAX_SLOTS_COLLAPSED);
  const hiddenCount = instructor.slots.length - visibleSlots.length;

  return (
    <div className="px-3 py-2.5">
      <p className="mb-2 text-body-xs text-surface-600 dark:text-surface-400">
        <span className="font-medium text-surface-800 dark:text-surface-200">
          {instructor.instructorName}
        </span>
        <span className="text-surface-400"> · </span>
        <span>{instructor.licenseCategoryCode}</span>
      </p>
      <ul className="flex flex-col gap-1">
        {visibleSlots.map((slot) => (
          <PracticeSlotRow
            key={practiceOfferKey(slot)}
            slot={slot}
            joining={joiningKey === practiceOfferKey(slot)}
            onBook={() => onBook(slot)}
          />
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          className="mt-1.5 text-body-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
          onClick={() => setShowAll(true)}
        >
          Ver {hiddenCount} horario{hiddenCount === 1 ? '' : 's'} más
        </button>
      ) : null}
      {showAll && instructor.slots.length > MAX_SLOTS_COLLAPSED ? (
        <button
          type="button"
          className="mt-1.5 text-body-xs font-medium text-surface-500 hover:underline"
          onClick={() => setShowAll(false)}
        >
          Ver menos
        </button>
      ) : null}
    </div>
  );
}

function DayBlock({
  day,
  joiningKey,
  onBook,
}: {
  day: PracticeClassDayGroup;
  joiningKey: string | null;
  onBook: (offer: PracticeClassOffer) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-lg border border-surface-200 dark:border-surface-800">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-t-lg bg-surface-50/90 px-3 py-2 text-left dark:bg-surface-900/50"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="text-body-sm font-semibold capitalize text-surface-800 dark:text-surface-100">
          {day.dateLabel}
        </span>
        <span className="flex items-center gap-2 text-body-xs text-surface-500">
          {day.slotCount} horario{day.slotCount === 1 ? '' : 's'}
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
        </span>
      </button>

      {expanded ? (
        <div className="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
          {day.instructors.map((instructor) => (
            <InstructorBlock
              key={instructor.instructorId}
              instructor={instructor}
              joiningKey={joiningKey}
              onBook={onBook}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PracticeClassDaySection({
  days,
  joiningKey,
  onBook,
}: PracticeClassDaySectionProps) {
  if (days.length === 0) return null;

  return (
    <div className="flex max-w-3xl flex-col gap-3">
      {days.map((day) => (
        <DayBlock key={day.dateKey} day={day} joiningKey={joiningKey} onBook={onBook} />
      ))}
    </div>
  );
}
