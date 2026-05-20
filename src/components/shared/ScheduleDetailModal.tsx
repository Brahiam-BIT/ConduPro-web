import { Calendar, Car, Clock, FileText, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatTime } from '@/utils/formatDate';
import { formatDuration } from '@/utils/formatters';
import { canCancelSchedule, formatInstructorName } from '@/utils/schedule';
import { ScheduleStatusBadge, ScheduleTypeBadge } from './StatusBadge';
import type { ReactNode } from 'react';
import type { Schedule } from '@/types/schedule.types';

interface ScheduleDetailModalProps {
  open: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  isLoading?: boolean;
  onCancel?: () => void;
  isCancelling?: boolean;
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-surface-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-caption font-medium uppercase tracking-wide text-surface-500 dark:text-surface-400">
          {label}
        </p>
        <div className="mt-0.5 text-body-sm text-surface-800 dark:text-surface-100">{value}</div>
      </div>
    </div>
  );
}

export function ScheduleDetailModal({
  open,
  onClose,
  schedule,
  isLoading = false,
  onCancel,
  isCancelling = false,
}: ScheduleDetailModalProps) {
  const showCancel = schedule && onCancel && canCancelSchedule(schedule);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalle de la clase"
      size="md"
      footer={
        showCancel ? (
          <Button variant="danger" onClick={onCancel} isLoading={isCancelling}>
            Cancelar clase
          </Button>
        ) : (
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        )
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : schedule ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <ScheduleTypeBadge type={schedule.type} />
            <ScheduleStatusBadge status={schedule.status} />
          </div>

          <DetailRow
            icon={<Calendar className="h-4 w-4" />}
            label="Fecha"
            value={formatDate(schedule.startAt)}
          />
          <DetailRow
            icon={<Clock className="h-4 w-4" />}
            label="Horario"
            value={`${formatTime(schedule.startAt)} – ${formatTime(schedule.endAt)} (${formatDuration(schedule.durationMinutes)})`}
          />
          <DetailRow
            icon={<User className="h-4 w-4" />}
            label="Instructor"
            value={
              <span className="inline-flex items-center gap-2">
                <Avatar
                  name={formatInstructorName(schedule.instructor)}
                  src={schedule.instructor.avatarUrl}
                  size="sm"
                />
                {formatInstructorName(schedule.instructor)}
              </span>
            }
          />
          {schedule.vehicle ? (
            <DetailRow
              icon={<Car className="h-4 w-4" />}
              label="Vehículo"
              value={`${schedule.vehicle.brand} ${schedule.vehicle.model} · ${schedule.vehicle.plate}`}
            />
          ) : null}
          {schedule.notes ? (
            <DetailRow icon={<FileText className="h-4 w-4" />} label="Notas" value={schedule.notes} />
          ) : null}
        </div>
      ) : (
        <p className="text-body-sm text-surface-500">No se encontró la clase.</p>
      )}
    </Modal>
  );
}
