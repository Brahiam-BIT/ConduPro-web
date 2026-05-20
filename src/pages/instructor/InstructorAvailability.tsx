import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { AvailabilityGrid } from '@/components/instructor/AvailabilityGrid';
import { AvailabilityDayList } from '@/components/instructor/AvailabilityDayList';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  useInstructorAvailability,
  useInstructorWeekSchedules,
  useSaveInstructorAvailability,
} from '@/hooks/useInstructorSchedules';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import {
  availabilitySlotKey,
  buildFullAvailabilityGrid,
  mapToAvailabilitySlots,
  scheduledSlotsForAvailability,
} from '@/utils/instructor';

export default function InstructorAvailability() {
  const { user } = useAuth();
  const toast = useToast();
  const isMobile = useIsMobile();
  const userId = user?.id ?? null;

  const { data: savedSlots, isLoading } = useInstructorAvailability(userId);
  const { data: weekSchedules = [] } = useInstructorWeekSchedules();
  const saveMutation = useSaveInstructorAvailability();

  const [grid, setGrid] = useState<Map<string, boolean>>(new Map());
  const [dirty, setDirty] = useState(false);

  const lockedSlots = useMemo(
    () => scheduledSlotsForAvailability(weekSchedules),
    [weekSchedules],
  );

  useEffect(() => {
    if (savedSlots) {
      setGrid(buildFullAvailabilityGrid(savedSlots));
      setDirty(false);
    }
  }, [savedSlots]);

  const handleToggle = (dayOfWeek: number, hour: number) => {
    const key = availabilitySlotKey(dayOfWeek, hour);
    if (lockedSlots.has(key)) return;
    setGrid((prev) => {
      const next = new Map(prev);
      next.set(key, !prev.get(key));
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      const slots = mapToAvailabilitySlots(grid);
      await saveMutation.mutateAsync({ userId, slots });
      toast.success('Disponibilidad guardada', 'Tus horarios fueron actualizados.');
      setDirty(false);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error, 'No se pudo guardar la disponibilidad.'));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Mi disponibilidad"
        subtitle="Marca los horarios en los que puedes impartir clases"
        actions={
          <Button
            iconLeft={<Save className="h-4 w-4" />}
            onClick={() => void handleSave()}
            isLoading={saveMutation.isPending}
            disabled={!dirty || isLoading}
          >
            Guardar disponibilidad
          </Button>
        }
      />

      <Card variant="elevated" padding="md">
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : isMobile ? (
          <AvailabilityDayList grid={grid} lockedSlots={lockedSlots} onToggle={handleToggle} />
        ) : (
          <AvailabilityGrid grid={grid} lockedSlots={lockedSlots} onToggle={handleToggle} />
        )}
      </Card>

      {dirty ? (
        <p className="text-center text-caption text-warning-600 dark:text-warning-500">
          Tienes cambios sin guardar
        </p>
      ) : null}
    </div>
  );
}
