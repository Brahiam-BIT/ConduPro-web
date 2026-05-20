import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Car, Sparkles, CalendarSearch } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Stepper } from '@/components/ui/Stepper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Modal } from '@/components/ui/Modal';
import { AvailabilitySlotCard } from '@/components/shared/ScheduleCard';
import { ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import { useAutoAssignSchedule, useAvailabilitySlots } from '@/hooks/useStudentSchedules';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { SCHEDULE_TYPE_LABELS } from '@/constants/schedules';
import { formatDate, formatTime } from '@/utils/formatDate';
import { formatInstructorName, isBookableDay, toApiDate } from '@/utils/schedule';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import type { AvailabilitySlot, Schedule, ScheduleType } from '@/types/schedule.types';

const STEPS = [
  { id: 'type', title: 'Tipo de clase', description: 'Teórica o práctica' },
  { id: 'schedule', title: 'Fecha y horario', description: 'Elige cuándo' },
];

interface PendingBooking {
  type: ScheduleType;
  schedule: Schedule;
  source: 'auto' | 'manual';
}

export default function BookClass() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [classType, setClassType] = useState<ScheduleType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSlots, setShowSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [pending, setPending] = useState<PendingBooking | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dateStr = selectedDate ? toApiDate(selectedDate) : null;

  const { data: slots = [], isLoading: slotsLoading } = useAvailabilitySlots(
    showSlots ? dateStr : null,
    showSlots ? classType : null,
  );

  const autoAssign = useAutoAssignSchedule();

  const openConfirmWithSchedule = (schedule: Schedule, source: 'auto' | 'manual') => {
    if (!classType) return;
    setPending({ type: classType, schedule, source });
    setConfirmOpen(true);
  };

  const handleAutoAssign = async () => {
    if (!classType || !selectedDate) return;
    try {
      const schedule = await autoAssign.mutateAsync({
        preferredDate: toApiDate(selectedDate),
        type: classType,
      });
      openConfirmWithSchedule(schedule, 'auto');
    } catch (error) {
      toast.error('Sin disponibilidad', extractApiErrorMessage(error, 'No hay opciones para esa fecha.'));
    }
  };

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    if (!classType || !selectedDate) return;
    const preview: Schedule = {
      id: 'preview',
      type: classType,
      status: 'PENDING',
      startAt: slot.startAt,
      endAt: slot.endAt,
      durationMinutes: Math.round(
        (new Date(slot.endAt).getTime() - new Date(slot.startAt).getTime()) / 60000,
      ),
      student: { id: '', firstName: '', lastName: '', avatarUrl: null },
      instructor: {
        id: slot.instructorId,
        firstName: slot.instructorName.split(' ')[0] ?? '',
        lastName: slot.instructorName.split(' ').slice(1).join(' ') ?? '',
        avatarUrl: null,
      },
      vehicle: null,
      createdAt: new Date().toISOString(),
    };
    openConfirmWithSchedule(preview, 'manual');
  };

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      if (pending.source === 'manual' && selectedSlot && classType) {
        toast.error(
          'No disponible',
          'La reserva manual aún no está habilitada. Usa asignación automática.',
        );
        return;
      }
      // source === 'auto': la clase ya fue creada por POST /schedules/auto-assign
      toast.success('¡Clase agendada!', 'Tu clase fue confirmada correctamente.');
      setConfirmOpen(false);
      navigate(ROUTES.STUDENT.SCHEDULES);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error, 'No se pudo confirmar la clase.'));
    }
  };

  const handleEditFromConfirm = () => {
    setConfirmOpen(false);
    setPending(null);
    if (pending?.source === 'manual') {
      setSelectedSlot(null);
    }
  };

  const canProceedStep1 = classType !== null;
  const canProceedStep2 = selectedDate !== null && isBookableDay(selectedDate);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Agendar clase"
        subtitle="Selecciona el tipo de clase y el horario que prefieras"
      />

      <Stepper steps={STEPS} currentStep={step} />

      {/* Paso 1 — Tipo */}
      {step === 0 && (
        <div className="flex flex-col gap-6">
          <p className="text-body-md text-surface-600 dark:text-surface-400">
            ¿Qué tipo de clase deseas tomar?
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ClassTypeCard
              selected={classType === 'THEORY'}
              onSelect={() => setClassType('THEORY')}
              icon={<BookOpen className="h-8 w-8" />}
              title="Teórica"
              description="Normas de tránsito, señales y conceptos fundamentales en aula."
            />
            <ClassTypeCard
              selected={classType === 'PRACTICE'}
              onSelect={() => setClassType('PRACTICE')}
              icon={<Car className="h-8 w-8" />}
              title="Práctica"
              description="Manejo en vía con instructor certificado y vehículo de la escuela."
            />
          </div>
          <div className="flex justify-end">
            <Button disabled={!canProceedStep1} onClick={() => setStep(1)}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Paso 2 — Fecha y asignación */}
      {step === 1 && classType && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body-sm text-surface-500">Tipo seleccionado:</span>
            <ScheduleTypeBadge type={classType} />
            <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
              Cambiar
            </Button>
          </div>

          <DatePicker
            label="Fecha preferida"
            value={selectedDate}
            onChange={(d) => {
              setSelectedDate(d);
              setShowSlots(false);
              setSelectedSlot(null);
            }}
            helperText="Solo días laborables (lun–vie), sin fechas pasadas."
            disabledDays={(d) => !isBookableDay(d)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Card variant="default" padding="md" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <Sparkles className="h-5 w-5" aria-hidden />
                <h3 className="text-heading-sm text-surface-800 dark:text-surface-100">
                  Asignación automática
                </h3>
              </div>
              <p className="text-body-sm text-surface-600 dark:text-surface-400">
                El sistema elige la mejor opción disponible para tu fecha.
              </p>
              <Button
                fullWidth
                disabled={!canProceedStep2}
                isLoading={autoAssign.isPending}
                onClick={() => void handleAutoAssign()}
              >
                Asignar la mejor opción disponible
              </Button>
            </Card>

            <Card variant="default" padding="md" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <CalendarSearch className="h-5 w-5" aria-hidden />
                <h3 className="text-heading-sm text-surface-800 dark:text-surface-100">
                  Ver horarios disponibles
                </h3>
              </div>
              <p className="text-body-sm text-surface-600 dark:text-surface-400">
                Próximamente: elegir instructor y horario manualmente. Por ahora usa asignación
                automática.
              </p>
              <Button variant="outline" fullWidth disabled>
                Ver slots disponibles
              </Button>
            </Card>
          </div>

          {showSlots && (
            <div className="flex flex-col gap-3">
              <h3 className="text-heading-sm text-surface-800 dark:text-surface-100">
                Horarios disponibles
              </h3>
              {slotsLoading ? (
                <p className="text-body-sm text-surface-500">Cargando horarios…</p>
              ) : slots.length === 0 ? (
                <Card variant="default" padding="md">
                  <p className="text-body-sm text-surface-600 dark:text-surface-400">
                    No hay horarios disponibles para esta fecha. Prueba otra fecha o usa asignación
                    automática.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {slots.map((slot) => (
                    <AvailabilitySlotCard
                      key={`${slot.instructorId}-${slot.startAt}`}
                      slot={slot}
                      selected={
                        selectedSlot?.instructorId === slot.instructorId &&
                        selectedSlot.startAt === slot.startAt
                      }
                      onSelect={() => handleSlotSelect(slot)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Atrás
            </Button>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <Modal
        open={confirmOpen}
        onClose={handleEditFromConfirm}
        title="Confirmar agendamiento"
        description="Revisa los detalles antes de confirmar tu clase."
        footer={
          <>
            <Button variant="ghost" onClick={handleEditFromConfirm}>
              Editar
            </Button>
            <Button
              onClick={() => void handleConfirm()}
              isLoading={autoAssign.isPending}
              disabled={autoAssign.isPending}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {pending ? (
          <ul className="space-y-3 text-body-sm">
            <li className="flex justify-between gap-4 border-b border-surface-200 pb-2 dark:border-surface-800">
              <span className="text-surface-500">Tipo</span>
              <span className="font-medium text-surface-800 dark:text-surface-100">
                {SCHEDULE_TYPE_LABELS[pending.type]}
              </span>
            </li>
            <li className="flex justify-between gap-4 border-b border-surface-200 pb-2 dark:border-surface-800">
              <span className="text-surface-500">Instructor</span>
              <span className="font-medium text-surface-800 dark:text-surface-100">
                {formatInstructorName(pending.schedule.instructor)}
              </span>
            </li>
            <li className="flex justify-between gap-4 border-b border-surface-200 pb-2 dark:border-surface-800">
              <span className="text-surface-500">Fecha</span>
              <span className="font-medium text-surface-800 dark:text-surface-100">
                {formatDate(pending.schedule.startAt)}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-surface-500">Hora</span>
              <span className="font-medium text-surface-800 dark:text-surface-100">
                {formatTime(pending.schedule.startAt)} – {formatTime(pending.schedule.endAt)}
              </span>
            </li>
          </ul>
        ) : null}
      </Modal>
    </div>
  );
}

function ClassTypeCard({
  selected,
  onSelect,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col gap-4 rounded-xl border-2 p-6 text-left transition-all duration-150 ease-smooth',
        selected
          ? 'border-primary-600 bg-primary-50 shadow-md dark:border-primary-500 dark:bg-primary-500/15'
          : 'border-surface-200 bg-surface-50 hover:border-primary-300 dark:border-surface-800 dark:bg-surface-900',
      )}
    >
      <span
        className={cn(
          'inline-flex h-14 w-14 items-center justify-center rounded-xl',
          selected
            ? 'bg-primary-600 text-white'
            : 'bg-surface-200 text-surface-600 dark:bg-surface-800 dark:text-surface-300',
        )}
      >
        {icon}
      </span>
      <div>
        <h3 className="text-heading-sm text-surface-900 dark:text-surface-50">{title}</h3>
        <p className="mt-1 text-body-sm text-surface-600 dark:text-surface-400">{description}</p>
      </div>
    </button>
  );
}
