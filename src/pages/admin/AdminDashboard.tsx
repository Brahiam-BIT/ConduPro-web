import { Car, CheckCircle2, ClipboardList, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Table, type TableColumn } from '@/components/ui/Table';
import { KpiCard } from '@/components/admin/KpiCard';
import { SchedulesLineChart } from '@/components/admin/SchedulesLineChart';
import { ScheduleStatusBadge, ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import { ScheduleDetailModal } from '@/components/shared/ScheduleDetailModal';
import { StaggerContainer, StaggerItem } from '@/components/shared/StaggerContainer';
import {
  useAdminDashboardKpis,
  useAdminRecentSchedules,
  useAdminScheduleDetail,
  useAdminSchedulesChart,
} from '@/hooks/useAdmin';
import { formatPercent } from '@/utils/formatters';
import { formatDate, formatTime } from '@/utils/formatDate';
import { formatStudentName } from '@/utils/instructor';
import { formatInstructorName } from '@/utils/schedule';
import { getLast30DaysRange } from '@/utils/reports';
import { useState } from 'react';
import type { Schedule } from '@/types/schedule.types';

const chartRange = getLast30DaysRange();

export default function AdminDashboard() {
  const { data: kpis, isLoading: kpisLoading, isError: kpisError } = useAdminDashboardKpis();
  const {
    data: chartData,
    isLoading: chartLoading,
    isError: chartError,
  } = useAdminSchedulesChart(chartRange);
  const {
    data: recent = [],
    isLoading: recentLoading,
    isError: recentError,
  } = useAdminRecentSchedules();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: detail, isLoading: detailLoading } = useAdminScheduleDetail(selectedId);

  const recentColumns: TableColumn<Schedule>[] = [
    {
      key: 'student',
      header: 'Estudiante',
      cell: (r) => formatStudentName(r.student),
    },
    {
      key: 'instructor',
      header: 'Instructor',
      cell: (r) => formatInstructorName(r.instructor),
    },
    { key: 'type', header: 'Tipo', cell: (r) => <ScheduleTypeBadge type={r.type} /> },
    {
      key: 'date',
      header: 'Fecha',
      cell: (r) => `${formatDate(r.startAt, 'd MMM')} · ${formatTime(r.startAt)}`,
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (r) => <ScheduleStatusBadge status={r.status} />,
      align: 'right',
    },
  ];

  return (
    <StaggerContainer className="flex flex-col gap-8">
      {kpisError ? (
        <Card variant="elevated">
          <p className="text-body-sm text-error-600 dark:text-error-500">
            No pudimos cargar los indicadores. El resto del panel puede mostrar datos incompletos.
          </p>
        </Card>
      ) : null}

      <StaggerItem className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Usuarios activos"
          value={kpis?.activeUsers ?? 0}
          icon={<Users className="h-8 w-8" />}
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Clases este mes"
          value={kpis?.monthSchedules ?? 0}
          icon={<ClipboardList className="h-8 w-8" />}
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Tasa de completitud"
          value={formatPercent(kpis?.completionRate ?? 0)}
          icon={<CheckCircle2 className="h-8 w-8" />}
          isLoading={kpisLoading}
        />
        <KpiCard
          label="Vehículos activos"
          value={kpis?.activeVehicles ?? 0}
          icon={<Car className="h-8 w-8" />}
          isLoading={kpisLoading}
        />
      </StaggerItem>

      <StaggerItem delay={0.1}>
        {chartError ? (
          <Card variant="elevated">
            <p className="text-body-sm text-error-600 dark:text-error-500">
              No pudimos cargar el gráfico de agendamientos.
            </p>
          </Card>
        ) : (
          <SchedulesLineChart data={chartData ?? []} isLoading={chartLoading} />
        )}
      </StaggerItem>

      <StaggerItem as="section" className="flex flex-col gap-4" delay={0.3}>
        <h2 className="text-heading-md text-surface-900 dark:text-surface-50">
          Últimos agendamientos
        </h2>
        {recentError ? (
          <Card variant="elevated">
            <p className="text-body-sm text-error-600 dark:text-error-500">
              No pudimos cargar los últimos agendamientos.
            </p>
          </Card>
        ) : null}
        <Table
          columns={recentColumns}
          data={recent}
          isLoading={recentLoading}
          loadingRows={5}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelectedId(r.id)}
          caption="Últimos 10 agendamientos"
        />
      </StaggerItem>

      <ScheduleDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        schedule={detail ?? null}
        isLoading={detailLoading}
        viewer="admin"
      />
    </StaggerContainer>
  );
}
