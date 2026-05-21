import { useState } from 'react';
import { ChevronDown, ChevronRight, GraduationCap, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { formatTime } from '@/utils/formatDate';
import { offerSessionKey } from '@/hooks/useTheoryClassOffers';
import type { TheoryClassDayGroup, TheoryClassTopicGroup } from '@/utils/theoryClassOffers';
import type { TheoryClassOffer } from '@/types/theoryClassOffers.types';

const MAX_SLOTS_COLLAPSED = 6;

interface TheoryClassTopicSectionProps {
  group: TheoryClassTopicGroup;
  joiningKey: string | null;
  onJoin: (offer: TheoryClassOffer) => void;
}

function DayBlock({
  day,
  joiningKey,
  onJoin,
}: {
  day: TheoryClassDayGroup;
  joiningKey: string | null;
  onJoin: (offer: TheoryClassOffer) => void;
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
          {day.sessions.map((session) => (
            <SessionSlots
              key={`${session.instructorId}-${session.classroomName}`}
              session={session}
              joiningKey={joiningKey}
              onJoin={onJoin}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SessionSlots({
  session,
  joiningKey,
  onJoin,
}: {
  session: TheoryClassDayGroup['sessions'][number];
  joiningKey: string | null;
  onJoin: (offer: TheoryClassOffer) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const enrolledSlot = session.slots.find((s) => s.isEnrolled);
  const visibleSlots = showAll ? session.slots : session.slots.slice(0, MAX_SLOTS_COLLAPSED);
  const hiddenCount = session.slots.length - visibleSlots.length;

  return (
    <div className="px-3 py-2.5">
      <p className="mb-2 text-body-xs text-surface-600 dark:text-surface-400">
        <span className="font-medium text-surface-800 dark:text-surface-200">
          {session.instructorName}
        </span>
        {' · '}
        {session.classroomName}
      </p>

      {enrolledSlot ? (
        <div className="mb-2 rounded-md border border-success-200 bg-success-50/80 px-2.5 py-2 dark:border-success-500/30 dark:bg-success-500/10">
          <p className="text-body-xs font-medium text-success-700 dark:text-success-400">
            Ya inscrito a las {formatTime(enrolledSlot.startAt)}
          </p>
          {enrolledSlot.students.length > 0 ? (
            <p className="mt-0.5 text-body-xs text-surface-600 dark:text-surface-400">
              {enrolledSlot.enrolledCount} compañero{enrolledSlot.enrolledCount === 1 ? '' : 's'} en
              esa sesión
            </p>
          ) : null}
        </div>
      ) : null}

      <ul className="flex flex-col gap-1">
        {visibleSlots.map((slot) => (
          <SlotRow
            key={offerSessionKey(slot)}
            slot={slot}
            joining={joiningKey === offerSessionKey(slot)}
            onJoin={() => onJoin(slot)}
            hideJoin={!!enrolledSlot}
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
      {showAll && session.slots.length > MAX_SLOTS_COLLAPSED ? (
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

function SlotRow({
  slot,
  joining,
  onJoin,
  hideJoin,
}: {
  slot: TheoryClassOffer;
  joining: boolean;
  onJoin: () => void;
  hideJoin: boolean;
}) {
  const canJoin = !slot.isEnrolled && slot.spotsLeft > 0 && !hideJoin;
  const full = slot.spotsLeft <= 0;

  return (
    <li
      className={cn(
        'flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5',
        slot.isEnrolled
          ? 'border-success-200 bg-success-50/50 dark:border-success-500/25 dark:bg-success-500/5'
          : 'border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-950/40',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="w-12 shrink-0 text-body-sm font-semibold tabular-nums text-surface-900 dark:text-surface-50">
          {formatTime(slot.startAt)}
        </span>
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-body-xs font-medium tabular-nums',
            full
              ? 'bg-surface-100 text-surface-500 dark:bg-surface-800'
              : 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
          )}
        >
          {slot.enrolledCount}/{slot.capacity}
        </span>
        {slot.students.length > 0 ? (
          <span className="truncate text-body-xs text-surface-500" title={slot.students.map((s) => `${s.firstName} ${s.lastName}`).join(', ')}>
            {slot.students.length === 1 && slot.students[0] ? (
              <span className="inline-flex items-center gap-1">
                <Avatar
                  name={`${slot.students[0].firstName} ${slot.students[0].lastName}`}
                  size="xs"
                />
                {slot.students[0].firstName}
              </span>
            ) : (
              `${slot.students.length} inscritos`
            )}
          </span>
        ) : null}
      </div>

      {slot.isEnrolled ? (
        <span className="shrink-0 text-body-xs font-medium text-success-600 dark:text-success-400">
          Inscrito
        </span>
      ) : canJoin ? (
        <Button
          size="sm"
          variant="secondary"
          iconLeft={<UserPlus className="h-3.5 w-3.5" />}
          isLoading={joining}
          onClick={onJoin}
        >
          <span className="hidden sm:inline">Inscribir</span>
        </Button>
      ) : full ? (
        <span className="shrink-0 text-body-xs text-surface-400">Lleno</span>
      ) : null}
    </li>
  );
}

export function TheoryClassTopicSection({
  group,
  joiningKey,
  onJoin,
}: TheoryClassTopicSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        className="flex w-full items-start gap-3 border-b border-surface-200 bg-surface-50/80 px-4 py-3 text-left dark:border-surface-800 dark:bg-surface-900/40 sm:px-5"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          <GraduationCap className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-surface-900 dark:text-surface-50">
            {group.licenseCategoryCode} — {group.theoryTopicTitle}
          </p>
          <p className="text-body-xs text-surface-500">
            {group.days.length} día{group.days.length === 1 ? '' : 's'} · {group.totalSlots}{' '}
            horario{group.totalSlots === 1 ? '' : 's'} disponibles
          </p>
        </div>
        {collapsed ? (
          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-surface-400" />
        ) : (
          <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-surface-400" />
        )}
      </button>

      {!collapsed ? (
        <div className="flex flex-col gap-3 p-3 sm:p-4">
          {group.days.map((day) => (
            <DayBlock key={day.dateKey} day={day} joiningKey={joiningKey} onJoin={onJoin} />
          ))}
        </div>
      ) : null}
    </Card>
  );
}
