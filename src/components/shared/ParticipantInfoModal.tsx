import { Mail, Phone, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { formatStudentName } from '@/utils/instructor';
import type { ScheduleParticipant } from '@/types/schedule.types';

interface ParticipantInfoModalProps {
  open: boolean;
  onClose: () => void;
  participant: ScheduleParticipant | null;
  title?: string;
}

export function ParticipantInfoModal({
  open,
  onClose,
  participant,
  title = 'Información del estudiante',
}: ParticipantInfoModalProps) {
  const name = participant ? formatStudentName(participant) : '';

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {participant ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={name} src={participant.avatarUrl} size="md" />
            <div>
              <p className="text-body-md font-semibold text-surface-900 dark:text-surface-50">
                {name}
              </p>
              <p className="text-caption text-surface-500">Estudiante</p>
            </div>
          </div>
          <ul className="space-y-3 text-body-sm">
            {participant.email ? (
              <li className="flex items-start gap-2 text-surface-700 dark:text-surface-300">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" aria-hidden />
                <a href={`mailto:${participant.email}`} className="break-all hover:underline">
                  {participant.email}
                </a>
              </li>
            ) : null}
            {participant.phone ? (
              <li className="flex items-start gap-2 text-surface-700 dark:text-surface-300">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" aria-hidden />
                <a href={`tel:${participant.phone}`} className="hover:underline">
                  {participant.phone}
                </a>
              </li>
            ) : null}
            {!participant.email && !participant.phone ? (
              <li className="flex items-center gap-2 text-surface-500">
                <User className="h-4 w-4" aria-hidden />
                Sin datos de contacto registrados.
              </li>
            ) : null}
          </ul>
        </div>
      ) : (
        <p className="text-body-sm text-surface-500">No hay información disponible.</p>
      )}
    </Modal>
  );
}
