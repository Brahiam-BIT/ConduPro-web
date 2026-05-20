import { Link } from 'react-router-dom';
import { BookOpen, Calendar, CalendarClock, Clock, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, type TableColumn } from '@/components/ui/Table';
import { NextClassCard } from '@/components/shared/ScheduleCard';
import { ScheduleStatusBadge, ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import { ScheduleEmptyState } from '@/components/shared/ScheduleEmptyState';
import { EMPTY_STUDENT_DASHBOARD } from '@/constants/dashboardDefaults';
import { LicenseProgressCard } from '@/components/student/LicenseProgressCard';
import { useMyEnrollments } from '@/hooks/useStudentEnrollments';
import { useStudentDashboard } from '@/hooks/useStudentSchedules';
import { formatDate, formatTime } from '@/utils/formatDate';
import { formatInstructorName } from '@/utils/schedule';
import { ROUTES } from '@/constants/routes';
import type { Schedule } from '@/types/schedule.types';

function MetricCardSkeleton() {
  return (
    <Card variant="elevated" padding="md">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </Card>
  );
}

export default function StudentDashboard() {
  const { data, isLoading, isError } = useStudentDashboard();
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useMyEnrollments();
  const dashboard = data ?? EMPTY_STUDENT_DASHBOARD;
  const primaryEnrollment = enrollments.find((e) => e.status === 'ACTIVE');
  const nextClass = dashboard.nextClass ?? null;
  const recentSchedules = dashboard.recentSchedules ?? [];
  const completedCount = dashboard.completedCount ?? 0;
  const weekCount = dashboard.weekCount ?? 0;
  const totalHours = dashboard.totalHours ?? 0;

  const recentColumns: TableColumn<Schedule>[] = [
    {
      key: 'type',
      header: 'Tipo',
      cell: (r) => <ScheduleTypeBadge type={r.type} />,
    },
    {
      key: 'instructor',
      header: 'Instructor',
      cell: (r) => (
        <span className="text-surface-800 dark:text-surface-100">
          {formatInstructorName(r.instructor)}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Fecha',
      sortable: true,
      sortAccessor: (r) => r.startAt,
      cell: (r) => formatDate(r.startAt, 'd MMM yyyy'),
    },
    {
      key: 'time',
      header: 'Hora',
      cell: (r) => formatTime(r.startAt),
      align: 'right',
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (r) => <ScheduleStatusBadge status={r.status} />,
      align: 'right',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        actions={
          <Link to={ROUTES.STUDENT.BOOK}>
            <Button iconLeft={<Calendar className="h-4 w-4" />}>Agendar clase</Button>
          </Link>
        }
      />

      {isError ? (
        <Card variant="elevated">
          <p className="text-body-sm text-error-600 dark:text-error-500">
            No pudimos cargar tu resumen. Intenta recargar la página.
          </p>
        </Card>
      ) : null}

      {primaryEnrollment && !enrollmentsLoading ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-heading-md text-surface-900 dark:text-surface-50">
              Progreso hacia tu licencia
            </h2>
            <Link to={ROUTES.STUDENT.LICENSES}>
              <Button variant="ghost" size="sm" iconLeft={<GraduationCap className="h-4 w-4" />}>
                Mis licencias
              </Button>
            </Link>
          </div>
          <LicenseProgressCard progress={primaryEnrollment} compact />
        </section>
      ) : !enrollmentsLoading && !primaryEnrollment ? (
        <Card variant="elevated" padding="md" className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-heading-sm text-surface-800 dark:text-surface-100">
              Empieza tu licencia de conducción
            </p>
            <p className="mt-1 text-body-sm text-surface-500">
              Matricúlate en A1, B1, C1 u otra categoría para seguir teoría y práctica.
            </p>
          </div>
          <Link to={ROUTES.STUDENT.LICENSES}>
            <Button iconLeft={<GraduationCap className="h-4 w-4" />}>Ver licencias</Button>
          </Link>
        </Card>
      ) : null}

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Card variant="elevated" className="sm:col-span-2 lg:col-span-2">
              <Skeleton className="h-28 w-full rounded-lg" />
            </Card>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <div className="sm:col-span-2 lg:col-span-2">
              {nextClass ? (
                <NextClassCard schedule={nextClass} />
              ) : (
                <Card variant="elevated" className="flex flex-col items-center gap-3 py-8 text-center">
                  <CalendarClock className="h-10 w-10 text-surface-400" aria-hidden />
                  <p className="text-heading-sm text-surface-800 dark:text-surface-100">
                    Sin clases próximas
                  </p>
                  <p className="text-body-sm text-surface-500 dark:text-surface-400">
                    Agenda una nueva clase cuando quieras continuar.
                  </p>
                  <Link to={ROUTES.STUDENT.BOOK}>
                    <Button size="sm">Agendar ahora</Button>
                  </Link>
                </Card>
              )}
            </div>

            <Card variant="elevated" padding="md">
              <p className="text-label text-surface-500 dark:text-surface-400">Clases completadas</p>
              <p className="mt-2 text-display-sm text-surface-900 dark:text-surface-50">
                {completedCount}
              </p>
              <p className="text-caption text-surface-500 dark:text-surface-400">en total</p>
            </Card>

            <Card variant="elevated" padding="md">
              <p className="text-label text-surface-500 dark:text-surface-400">Clases esta semana</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-display-sm text-surface-900 dark:text-surface-50">
                  {weekCount}
                </span>
                <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
              </p>
            </Card>

            <Card variant="elevated" padding="md">
              <p className="text-label text-surface-500 dark:text-surface-400">Horas acumuladas</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-display-sm text-surface-900 dark:text-surface-50">
                  {totalHours}
                </span>
                <span className="text-body-sm text-surface-500">h</span>
                <Clock className="ml-auto h-5 w-5 text-accent-500" aria-hidden />
              </p>
            </Card>
          </>
        )}
      </div>

      {/* Historial reciente */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-heading-md text-surface-900 dark:text-surface-50">Historial reciente</h2>
          <Link to={ROUTES.STUDENT.SCHEDULES}>
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>

        <Table
          columns={recentColumns}
          data={recentSchedules}
          isLoading={isLoading}
          loadingRows={5}
          rowKey={(r) => r.id}
          caption="Últimas 5 clases"
          emptyState={
            <ScheduleEmptyState
              title="Sin historial aún"
              description="Cuando completes o agendes clases aparecerán aquí."
            />
          }
        />
      </section>
    </div>
  );
}
