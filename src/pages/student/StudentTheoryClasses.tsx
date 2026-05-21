import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ListEmptyState } from '@/components/shared/ListEmptyState';
import { TheoryClassTopicSection } from '@/components/student/TheoryClassTopicSection';
import { useMyEnrollments } from '@/hooks/useStudentEnrollments';
import { offerSessionKey, useJoinTheoryClass, useTheoryClassOffers } from '@/hooks/useTheoryClassOffers';
import { groupTheoryClassOffers } from '@/utils/theoryClassOffers';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { ROUTES } from '@/constants/routes';
import type { TheoryClassOffer } from '@/types/theoryClassOffers.types';

export default function StudentTheoryClasses() {
  const navigate = useNavigate();
  const toast = useToast();
  const [licenseFilter, setLicenseFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [joiningKey, setJoiningKey] = useState<string | null>(null);

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useMyEnrollments();
  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');

  const filters = useMemo(
    () => ({
      ...(licenseFilter ? { licenseCategoryId: licenseFilter } : {}),
      ...(topicFilter ? { theoryTopicId: topicFilter } : {}),
    }),
    [licenseFilter, topicFilter],
  );

  const { data: offers = [], isLoading: offersLoading } = useTheoryClassOffers(filters);
  const joinMutation = useJoinTheoryClass(filters);

  const topicGroups = useMemo(() => groupTheoryClassOffers(offers), [offers]);

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

  const topicOptions = useMemo(() => {
    const relevant = licenseFilter
      ? activeEnrollments.filter((e) => e.licenseCategory.id === licenseFilter)
      : activeEnrollments;

    const pendingTopics = relevant.flatMap((e) =>
      e.theoryTopics.filter((t) => !t.completed).map((t) => ({
        value: t.id,
        label: `${e.licenseCategory.code} — ${t.title}`,
      })),
    );

    return [{ value: '', label: 'Todos los temas pendientes' }, ...pendingTopics];
  }, [activeEnrollments, licenseFilter]);

  const totalSlots = offers.length;

  const handleJoin = async (offer: TheoryClassOffer) => {
    const key = offerSessionKey(offer);
    setJoiningKey(key);
    try {
      await joinMutation.mutateAsync({
        instructorId: offer.instructorId,
        theoryTopicId: offer.theoryTopicId,
        licenseCategoryId: offer.licenseCategoryId,
        startAt: offer.startAt,
      });
      toast.success('¡Inscrito!', `Clase a las ${new Date(offer.startAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}.`);
      navigate(ROUTES.STUDENT.SCHEDULES);
    } catch (error) {
      toast.error('No se pudo inscribir', extractApiErrorMessage(error));
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
        description="Matricúlate en una licencia para ver las clases teóricas disponibles según el temario y la disponibilidad de los instructores."
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
        Horarios según la <strong>disponibilidad</strong> de cada instructor para el tema de tu
        licencia. Elige día, instructor y hora con cupo.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Licencia"
          options={licenseOptions}
          value={licenseFilter}
          onChange={(e) => {
            setLicenseFilter(e.target.value);
            setTopicFilter('');
          }}
        />
        <Select
          label="Tema teórico"
          options={topicOptions}
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          disabled={topicOptions.length <= 1}
        />
      </div>

      {!isLoading && topicGroups.length > 0 ? (
        <p className="text-body-sm text-surface-600 dark:text-surface-400">
          {topicGroups.length} tema{topicGroups.length === 1 ? '' : 's'} · {totalSlots} horario
          {totalSlots === 1 ? '' : 's'} — elige la <strong>hora</strong> que prefieras en cada día.
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-body-sm text-surface-500">Buscando clases disponibles…</p>
      ) : topicGroups.length === 0 ? (
        <ListEmptyState
          illustration="calendar"
          title="No hay clases teóricas abiertas"
          description="Cuando un instructor marque disponibilidad para un tema de tu licencia, aparecerá aquí agrupado por día y hora."
        />
      ) : (
        <div className="flex max-w-3xl flex-col gap-4">
          {topicGroups.map((group) => (
            <TheoryClassTopicSection
              key={group.theoryTopicId}
              group={group}
              joiningKey={joiningKey}
              onJoin={(offer) => void handleJoin(offer)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
