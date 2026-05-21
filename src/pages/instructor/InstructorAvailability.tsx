import { useCallback, useEffect, useMemo, useState } from 'react';
import { startOfDay } from 'date-fns';
import { Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { AvailabilityGrid } from '@/components/instructor/AvailabilityGrid';
import { AvailabilityDayList } from '@/components/instructor/AvailabilityDayList';
import { AvailabilityPaintBar } from '@/components/instructor/AvailabilityPaintBar';
import { AvailabilityWeekNav } from '@/components/instructor/AvailabilityWeekNav';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  useInstructorAvailability,
  useInstructorWeekSchedules,
  useSaveInstructorAvailability,
} from '@/hooks/useInstructorSchedules';
import { useAllTheoryTopics } from '@/hooks/useAllTheoryTopics';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { scheduledCellsForAvailabilityWeek } from '@/utils/instructor';
import {
  availabilityDateKey,
  buildAvailabilityGridForWeek,
  createEmptyAvailabilityGridForWeek,
  getMondayOfWeek,
  getWorkWeekColumns,
  mergeAvailabilitySlotsForWeekSave,
  templateToCellData,
} from '@/utils/availability';
import type {
  AvailabilityCellData,
  AvailabilityClassType,
} from '@/types/availability.types';
import type { TheoryTopicOption } from '@/hooks/useAllTheoryTopics';

export default function InstructorAvailability() {
  const { user } = useAuth();
  const toast = useToast();
  const isMobile = useIsMobile();
  const userId = user?.id ?? null;

  const { data: savedSlots, isLoading } = useInstructorAvailability(userId);
  const { data: weekSchedules = [] } = useInstructorWeekSchedules();
  const saveMutation = useSaveInstructorAvailability();
  const { data: topicOptions = [], isLoading: topicsLoading } = useAllTheoryTopics();

  const [grid, setGrid] = useState<Map<string, AvailabilityCellData>>(() =>
    createEmptyAvailabilityGridForWeek(getMondayOfWeek(new Date())),
  );
  const [dirty, setDirty] = useState(false);
  const [paintMode, setPaintMode] = useState<AvailabilityClassType>('PRACTICE');
  const [theoryTopicId, setTheoryTopicId] = useState('');
  const [theoryMeta, setTheoryMeta] = useState<TheoryTopicOption | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [weekMonday, setWeekMonday] = useState(() => getMondayOfWeek(new Date()));

  const weekColumns = useMemo(() => getWorkWeekColumns(weekMonday), [weekMonday]);

  const scheduledCells = useMemo(
    () => scheduledCellsForAvailabilityWeek(weekSchedules, weekMonday),
    [weekSchedules, weekMonday],
  );

  const handleWeekChange = (nextMonday: Date) => {
    if (dirty) {
      const ok = window.confirm(
        'Tienes cambios sin guardar en esta semana. ¿Cambiar de semana sin guardar?',
      );
      if (!ok) return;
    }
    setDirty(false);
    setWeekMonday(nextMonday);
    setSelectedKey(null);
  };

  const topicLookup = useMemo(() => {
    const map = new Map<string, { title: string; licenseCode: string; licenseCategoryId: string }>();
    for (const t of topicOptions) {
      map.set(t.id, {
        title: t.title,
        licenseCode: t.licenseCode,
        licenseCategoryId: t.licenseCategoryId,
      });
    }
    return map;
  }, [topicOptions]);

  useEffect(() => {
    if (!savedSlots || dirty) return;
    setGrid(buildAvailabilityGridForWeek(savedSlots, weekMonday, topicLookup));
  }, [savedSlots, weekMonday, topicLookup, dirty]);

  const buildCellFromPaint = useCallback((): AvailabilityCellData | null => {
    if (paintMode === 'PRACTICE') {
      return templateToCellData({
        available: true,
        classType: 'PRACTICE',
        recurrence: 'WEEKLY',
      });
    }
    if (!theoryTopicId || !theoryMeta) return null;
    return templateToCellData({
      available: true,
      classType: 'THEORY',
      theoryTopicId,
      theoryTopicTitle: theoryMeta.title,
      licenseCategoryId: theoryMeta.licenseCategoryId,
      licenseCategoryCode: theoryMeta.licenseCode,
      recurrence: 'WEEKLY',
    });
  }, [paintMode, theoryTopicId, theoryMeta]);

  const handlePaint = (date: Date, hour: number) => {
    const col = weekColumns.find((c) => c.date.getTime() === startOfDay(date).getTime());
    if (!col || col.isPast) return;

    const key = availabilityDateKey(date, hour);
    if (scheduledCells.has(key)) return;

    setSelectedKey(key);

    const painted = buildCellFromPaint();
    if (!painted) {
      toast.error('Elige la materia', 'Selecciona el tema teórico en la barra superior.');
      return;
    }

    setGrid((prev) => {
      const next = new Map(prev);
      const current = next.get(key);
      if (current?.available) {
        next.set(key, { ...current, available: false });
      } else {
        next.set(key, painted);
      }
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      const slots = mergeAvailabilitySlotsForWeekSave(
        savedSlots ?? [],
        weekMonday,
        weekColumns,
        grid,
      );
      await saveMutation.mutateAsync({ userId, slots });
      toast.success('Disponibilidad guardada', 'Solo las celdas verdes de esta semana.');
      setDirty(false);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error, 'No se pudo guardar la disponibilidad.'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          <Button
            iconLeft={<Save className="h-4 w-4" />}
            onClick={() => void handleSave()}
            isLoading={saveMutation.isPending}
            disabled={!dirty || isLoading}
          >
            Guardar
          </Button>
        }
      />

      <p className="text-body-sm text-surface-600 dark:text-surface-400">
        Cada celda es <strong>un solo día</strong> (ej. jueves 18:00 de esta semana). No se repite en
        otros días ni en semanas futuras. <strong>Verde</strong> = disponibilidad que guardas;{' '}
        <strong>morado</strong> = clase ya reservada en esa fecha.
      </p>

      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : (
        <AvailabilityPaintBar
          paintMode={paintMode}
          onPaintModeChange={setPaintMode}
          theoryTopicId={theoryTopicId}
          onTheoryTopicChange={(id, opt) => {
            setTheoryTopicId(id);
            setTheoryMeta(opt ?? null);
          }}
          topicOptions={topicOptions}
          topicsLoading={topicsLoading}
        />
      )}

      <Card variant="elevated" padding="md" className="flex flex-col gap-4 overflow-visible">
        {!isLoading ? (
          <AvailabilityWeekNav
            weekMonday={weekMonday}
            lockedCount={scheduledCells.size}
            onWeekChange={handleWeekChange}
          />
        ) : null}
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : isMobile ? (
          <AvailabilityDayList
            weekColumns={weekColumns}
            grid={grid}
            scheduledCells={scheduledCells}
            selectedKey={selectedKey}
            onPaint={handlePaint}
          />
        ) : (
          <AvailabilityGrid
            weekColumns={weekColumns}
            grid={grid}
            scheduledCells={scheduledCells}
            selectedKey={selectedKey}
            onPaint={handlePaint}
          />
        )}
      </Card>

      {dirty ? (
        <p className="text-center text-caption text-warning-600 dark:text-warning-500">
          Cambios sin guardar en esta semana
        </p>
      ) : null}
    </div>
  );
}
