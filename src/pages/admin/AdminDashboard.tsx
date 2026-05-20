import { Car, CheckCircle2, ClipboardList, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { KpiCard } from '@/components/admin/KpiCard';
import { SchedulesLineChart } from '@/components/admin/SchedulesLineChart';
import { ScheduleStatusBadge, ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import { ScheduleDetailModal } from '@/components/shared/ScheduleDetailModal';
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
  const { data: kpis, isLoading: kpisLoading } = useAdminDashboardKpis();
  const { data: chartData, isLoading: chartLoading } = useAdminSchedulesChart(chartRange);
  const { data: recent = [], isLoading: recentLoading } = useAdminRecentSchedules();
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
    {
      key: 'actions',
      header: '',
      cell: (r) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedId(r.id)}>
          Ver
        </Button>
      ),
      align: 'right',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Panel de administración" subtitle="Vista general de la escuela" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
      </div>

      <SchedulesLineChart data={chartData ?? []} isLoading={chartLoading} />

      <section className="flex flex-col gap-4">
        <h2 className="text-heading-md text-surface-900 dark:text-surface-50">
          Últimos agendamientos
        </h2>
        <Table
          columns={recentColumns}
          data={recent}
          isLoading={recentLoading}
          loadingRows={5}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelectedId(r.id)}
          caption="Últimos 10 agendamientos"
        />
      </section>

      <ScheduleDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        schedule={detail ?? null}
        isLoading={detailLoading}
        viewer="admin"
      />
    </div>
  );
}
