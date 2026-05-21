import { useMemo, useState } from 'react';
import { Calendar, CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import { ScheduleDetailModal } from '@/components/shared/ScheduleDetailModal';
import { ParticipantInfoModal } from '@/components/shared/ParticipantInfoModal';
import { WeeklyScheduleGrid } from '@/components/instructor/WeeklyScheduleGrid';
import { WeekSchedulePickerModal } from '@/components/instructor/WeekSchedulePickerModal';
import { QueryErrorBanner } from '@/components/shared/QueryErrorBanner';
import { CountUpNumber } from '@/components/shared/CountUpNumber';
import { MotionCard } from '@/components/shared/MotionCard';
import { StaggerContainer, StaggerItem } from '@/components/shared/StaggerContainer';
import { EMPTY_INSTRUCTOR_DASHBOARD } from '@/constants/dashboardDefaults';
import {
  useInstructorDashboard,
  useInstructorScheduleDetail,
} from '@/hooks/useInstructorSchedules';
import { formatTime } from '@/utils/formatDate';
import { formatStudentName } from '@/utils/instructor';
import type { Schedule, ScheduleParticipant } from '@/types/schedule.types';

function MetricSkeleton() {
  return (
    <Card variant="elevated" padding="md">
      <Skeleton className="mb-2 h-4 w-28" />
      <Skeleton className="h-8 w-16" />
    </Card>
  );
}

export default function InstructorDashboard() {
  const { data, isLoading, isError } = useInstructorDashboard();
  const dashboard = data ?? EMPTY_INSTRUCTOR_DASHBOARD;
  const todayClasses = dashboard.todayClasses ?? [];

  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [pickerSchedules, setPickerSchedules] = useState<Schedule[] | null>(null);
  const [cellPeerSchedules, setCellPeerSchedules] = useState<Schedule[]>([]);
  const [participant, setParticipant] = useState<ScheduleParticipant | null>(null);

  const { data: detailSchedule, isLoading: detailLoading } =
    useInstructorScheduleDetail(selectedScheduleId);

  const additionalStudents = useMemo(() => {
    if (!detailSchedule || cellPeerSchedules.length <= 1) return [];
    return cellPeerSchedules
      .filter((s) => s.id !== detailSchedule.id)
      .map((s) => s.student);
  }, [detailSchedule, cellPeerSchedules]);

  const handleWeekCellClick = (schedule: Schedule, cellSchedules: Schedule[]) => {
    if (cellSchedules.length > 1) {
      setPickerSchedules(cellSchedules);
      return;
    }
    setCellPeerSchedules(cellSchedules);
    setSelectedScheduleId(schedule.id);
  };

  const handlePickerSelect = (schedule: Schedule) => {
    setPickerSchedules((peers) => {
      setCellPeerSchedules(peers ?? [schedule]);
      return null;
    });
    setSelectedScheduleId(schedule.id);
  };

  const closeDetail = () => {
    setSelectedScheduleId(null);
    setCellPeerSchedules([]);
  };

  return (
    <StaggerContainer className="flex flex-col gap-8">
      {isError ? (
        <QueryErrorBanner message="No pudimos cargar tu resumen. Intenta recargar la página." />
      ) : null}

      <StaggerItem className="grid gap-4 lg:grid-cols-3">
        {/* Clases hoy */}
        <Card variant="elevated" padding="md" className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
            <h2 className="text-heading-sm text-surface-900 dark:text-surface-50">Clases hoy</h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : todayClasses.length === 0 ? (
            <p className="py-6 text-center text-body-sm text-surface-500 dark:text-surface-400">
              No tienes clases programadas para hoy.
            </p>
          ) : (
            <ul className="divide-y divide-surface-200 dark:divide-surface-800">
              {todayClasses.map((s) => (
                <li
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-lg py-3 transition-colors first:pt-0 last:pb-0 hover:bg-surface-50 dark:hover:bg-surface-800/50"
                  onClick={() => {
                    setCellPeerSchedules([s]);
                    setSelectedScheduleId(s.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setCellPeerSchedules([s]);
                      setSelectedScheduleId(s.id);
                    }
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-surface-800 dark:text-surface-100">
                      {formatTime(s.startAt)} – {formatTime(s.endAt)}
                    </p>
                    <p className="text-caption text-surface-500 dark:text-surface-400">
                      {formatStudentName(s.student)}
                    </p>
                  </div>
                  <ScheduleTypeBadge type={s.type} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* KPIs semana / mes */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <>
              <MetricSkeleton />
              <MetricSkeleton />
            </>
          ) : (
            <>
              <MotionCard variant="elevated" padding="md">
                <div className="mb-2 flex items-center gap-2 text-surface-500 dark:text-surface-400">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  <span className="text-label">Esta semana</span>
                </div>
                <p className="text-display-sm text-surface-900 dark:text-surface-50">
                  <CountUpNumber value={dashboard.weekTotal ?? 0} />{' '}
                  <span className="text-body-md font-normal text-surface-500">clases</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-body-sm text-surface-600 dark:text-surface-400">
                  <Clock className="h-4 w-4" aria-hidden />
                  <CountUpNumber value={dashboard.weekHours ?? 0} /> horas impartidas
                </p>
              </MotionCard>
              <MotionCard variant="elevated" padding="md">
                <div className="mb-2 flex items-center gap-2 text-surface-500 dark:text-surface-400">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  <span className="text-label">Este mes</span>
                </div>
                <p className="text-display-sm text-surface-900 dark:text-surface-50">
                  <CountUpNumber value={dashboard.monthTotal ?? 0} />{' '}
                  <span className="text-body-md font-normal text-surface-500">impartidas</span>
                </p>
                <p className="mt-1 text-body-sm text-success-600 dark:text-success-500">
                  <CountUpNumber value={dashboard.monthCompleted ?? 0} /> completadas
                </p>
              </MotionCard>
            </>
          )}
        </div>
      </StaggerItem>

      {/* Mini calendario semanal */}
      <StaggerItem as="section" className="flex flex-col gap-4" delay={0.2}>
        <h2 className="text-heading-md text-surface-900 dark:text-surface-50">
          Calendario de la semana
        </h2>
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <WeeklyScheduleGrid
            schedules={dashboard.weekSchedules ?? []}
            onScheduleClick={handleWeekCellClick}
          />
        )}
      </StaggerItem>

      <WeekSchedulePickerModal
        open={!!pickerSchedules?.length}
        onClose={() => setPickerSchedules(null)}
        schedules={pickerSchedules ?? []}
        onSelect={handlePickerSelect}
      />

      <ScheduleDetailModal
        open={!!selectedScheduleId}
        onClose={closeDetail}
        schedule={detailSchedule ?? null}
        isLoading={detailLoading}
        viewer="instructor"
        onParticipantClick={setParticipant}
        additionalStudents={additionalStudents}
      />

      <ParticipantInfoModal
        open={!!participant}
        onClose={() => setParticipant(null)}
        participant={participant}
      />
    </StaggerContainer>
  );
}
