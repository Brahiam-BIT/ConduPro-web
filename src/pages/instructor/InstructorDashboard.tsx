import { Calendar, CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import { WeeklyScheduleGrid } from '@/components/instructor/WeeklyScheduleGrid';
import { QueryErrorBanner } from '@/components/shared/QueryErrorBanner';
import { EMPTY_INSTRUCTOR_DASHBOARD } from '@/constants/dashboardDefaults';
import { useInstructorDashboard } from '@/hooks/useInstructorSchedules';
import { formatTime } from '@/utils/formatDate';
import { formatStudentName } from '@/utils/instructor';

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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de tus clases impartidas esta semana"
      />

      {isError ? (
        <QueryErrorBanner message="No pudimos cargar tu resumen. Intenta recargar la página." />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
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
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
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
              <Card variant="elevated" padding="md">
                <div className="mb-2 flex items-center gap-2 text-surface-500 dark:text-surface-400">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  <span className="text-label">Esta semana</span>
                </div>
                <p className="text-display-sm text-surface-900 dark:text-surface-50">
                  {dashboard.weekTotal ?? 0}{' '}
                  <span className="text-body-md font-normal text-surface-500">clases</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-body-sm text-surface-600 dark:text-surface-400">
                  <Clock className="h-4 w-4" aria-hidden />
                  {dashboard.weekHours ?? 0} horas impartidas
                </p>
              </Card>
              <Card variant="elevated" padding="md">
                <div className="mb-2 flex items-center gap-2 text-surface-500 dark:text-surface-400">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  <span className="text-label">Este mes</span>
                </div>
                <p className="text-display-sm text-surface-900 dark:text-surface-50">
                  {dashboard.monthTotal ?? 0}{' '}
                  <span className="text-body-md font-normal text-surface-500">impartidas</span>
                </p>
                <p className="mt-1 text-body-sm text-success-600 dark:text-success-500">
                  {dashboard.monthCompleted ?? 0} completadas
                </p>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Mini calendario semanal */}
      <section className="flex flex-col gap-4">
        <h2 className="text-heading-md text-surface-900 dark:text-surface-50">
          Calendario de la semana
        </h2>
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <WeeklyScheduleGrid schedules={dashboard.weekSchedules ?? []} />
        )}
      </section>
    </div>
  );
}
