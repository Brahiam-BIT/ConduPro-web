import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ListEmptyState } from '@/components/shared/ListEmptyState';
import { PracticeClassDaySection } from '@/components/student/PracticeClassDaySection';
import { useMyEnrollments } from '@/hooks/useStudentEnrollments';
import {
  practiceOfferKey,
  useJoinPracticeClass,
  usePracticeClassOffers,
} from '@/hooks/usePracticeClassOffers';
import { groupPracticeClassOffers } from '@/utils/practiceClassOffers';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { ROUTES } from '@/constants/routes';
import type { PracticeClassOffer } from '@/types/practiceClassOffers.types';

export default function StudentPracticeClasses() {
  const navigate = useNavigate();
  const toast = useToast();
  const [licenseFilter, setLicenseFilter] = useState('');
  const [joiningKey, setJoiningKey] = useState<string | null>(null);

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useMyEnrollments();
  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');

  const filters = useMemo(
    () => ({
      ...(licenseFilter ? { licenseCategoryId: licenseFilter } : {}),
    }),
    [licenseFilter],
  );

  const { data: offers = [], isLoading: offersLoading } = usePracticeClassOffers(filters);
  const joinMutation = useJoinPracticeClass(filters);

  const dayGroups = useMemo(() => groupPracticeClassOffers(offers), [offers]);

  const licenseOptions = useMemo(
    () => [
      { value: '', label: 'Todas mis licencias activas' },
      ...activeEnrollments.map((e) => ({
        value: e.licenseCategory.id,
        label: `${e.licenseCategory.code} — ${e.licenseCategory.name}`,
      })),
    ],
    [activeEnrollments],
  );

  const totalSlots = offers.length;

  const handleBook = async (offer: PracticeClassOffer) => {
    const key = practiceOfferKey(offer);
    setJoiningKey(key);
    try {
      await joinMutation.mutateAsync({
        instructorId: offer.instructorId,
        licenseCategoryId: offer.licenseCategoryId,
        startAt: offer.startAt,
      });
      toast.success(
        '¡Clase reservada!',
        `Práctica con ${offer.instructorName} a las ${new Date(offer.startAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}.`,
      );
      navigate(ROUTES.STUDENT.SCHEDULES);
    } catch (error) {
      toast.error('No se pudo reservar', extractApiErrorMessage(error));
    } finally {
      setJoiningKey(null);
    }
  };

  const isLoading = enrollmentsLoading || offersLoading;

  if (!enrollmentsLoading && activeEnrollments.length === 0) {
    return (
      <ListEmptyState
        illustration="calendar"
        title="Sin matrícula activa"
        description="Matricúlate en una licencia para ver los horarios prácticos que publiquen los instructores."
        action={
          <Link to={ROUTES.STUDENT.LICENSES}>
            <Button iconLeft={<GraduationCap className="h-4 w-4" />}>Ir a Mis licencias</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-body-sm text-surface-600 dark:text-surface-400">
        Estos horarios salen de la <strong>disponibilidad</strong> que cada instructor marcó (día y
        hora concretos). Elige instructor y franja; al reservar se asigna un vehículo disponible.
      </p>

      <Select
        label="Licencia"
        options={licenseOptions}
        value={licenseFilter}
        onChange={(e) => setLicenseFilter(e.target.value)}
        containerClassName="max-w-md"
      />

      {!isLoading && dayGroups.length > 0 ? (
        <p className="text-body-sm text-surface-600 dark:text-surface-400">
          {dayGroups.length} día{dayGroups.length === 1 ? '' : 's'} · {totalSlots} horario
          {totalSlots === 1 ? '' : 's'} disponible{totalSlots === 1 ? '' : 's'}.
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-body-sm text-surface-500">Buscando prácticas disponibles…</p>
      ) : dayGroups.length === 0 ? (
        <ListEmptyState
          illustration="car"
          title="No hay prácticas disponibles"
          description="Cuando un instructor marque franjas de práctica en su agenda, aparecerán aquí por día e instructor."
        />
      ) : (
        <PracticeClassDaySection
          days={dayGroups}
          joiningKey={joiningKey}
          onBook={(offer) => void handleBook(offer)}
        />
      )}
    </div>
  );
}
