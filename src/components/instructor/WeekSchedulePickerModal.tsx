import { Modal } from '@/components/ui/Modal';
import { ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import { SCHEDULE_TYPE_LABELS } from '@/constants/schedules';
import { formatTime } from '@/utils/formatDate';
import { formatStudentName } from '@/utils/instructor';
import type { Schedule } from '@/types/schedule.types';

interface WeekSchedulePickerModalProps {
  open: boolean;
  onClose: () => void;
  schedules: Schedule[];
  onSelect: (schedule: Schedule) => void;
}

export function WeekSchedulePickerModal({
  open,
  onClose,
  schedules,
  onSelect,
}: WeekSchedulePickerModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Clases en este horario" size="sm">
      <ul className="divide-y divide-surface-200 dark:divide-surface-800">
        {schedules.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="flex w-full flex-col gap-1 py-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
              onClick={() => onSelect(s)}
            >
              <div className="flex flex-wrap items-center gap-2">
                <ScheduleTypeBadge type={s.type} />
                <span className="text-caption text-surface-500">
                  {formatTime(s.startAt)} – {formatTime(s.endAt)}
                </span>
              </div>
              <span className="text-body-sm font-medium text-surface-800 dark:text-surface-100">
                {formatStudentName(s.student)}
              </span>
              {s.type === 'THEORY' && s.theoryTopic ? (
                <span className="text-caption text-surface-500">
                  Materia: {s.theoryTopic.title}
                </span>
              ) : (
                <span className="text-caption text-surface-500">
                  {SCHEDULE_TYPE_LABELS[s.type]}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
