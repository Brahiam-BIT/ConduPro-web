import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Table, type TableColumn } from '@/components/ui/Table';
import { KpiCard } from '@/components/admin/KpiCard';
import { ReportsPieChart } from '@/components/admin/ReportsPieChart';
import { ListEmptyState } from '@/components/shared/ListEmptyState';
import {
  useExportReport,
  useReportByInstructor,
  useReportSummary,
} from '@/hooks/useAdmin';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { downloadBlob } from '@/utils/download';
import { formatPercent } from '@/utils/formatters';
import { getReportPeriod, type ReportPeriodPreset } from '@/utils/reports';
import type { InstructorReport } from '@/api/reports.api';

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Este mes' },
  { value: 'quarter', label: 'Último trimestre' },
  { value: 'year', label: 'Este año' },
  { value: 'custom', label: 'Rango personalizado' },
] as const;

export default function AdminReports() {
  const toast = useToast();
  const [preset, setPreset] = useState<ReportPeriodPreset>('month');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);

  const range = useMemo(
    () => getReportPeriod(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );

  const { data: summary, isLoading: summaryLoading } = useReportSummary(range);
  const { data: instructors = [], isLoading: instructorsLoading } = useReportByInstructor(range);
  const exportMutation = useExportReport();

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(range);
      downloadBlob(blob, `reporte-${range.startDate}-${range.endDate}.xlsx`);
      toast.success('Exportación lista', 'El archivo se descargó correctamente.');
    } catch (error) {
      toast.error('Error al exportar', extractApiErrorMessage(error));
    }
  };

  const instructorColumns: TableColumn<InstructorReport>[] = [
    {
      key: 'name',
      header: 'Instructor',
      cell: (r) => r.instructorName,
    },
    {
      key: 'classes',
      header: 'Clases',
      sortable: true,
      sortAccessor: (r) => r.totalClasses,
      cell: (r) => r.totalClasses,
    },
    {
      key: 'hours',
      header: 'Horas',
      sortable: true,
      sortAccessor: (r) => r.totalHours,
      cell: (r) => `${r.totalHours} h`,
    },
    {
      key: 'completion',
      header: 'Completitud',
      sortable: true,
      sortAccessor: (r) => r.completionRate,
      align: 'right',
      cell: (r) => formatPercent(r.completionRate),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        actions={
          <Button
            variant="secondary"
            iconLeft={<Download className="h-4 w-4" />}
            onClick={handleExport}
            isLoading={exportMutation.isPending}
          >
            Exportar Excel
          </Button>
        }
      />

      <div className="grid gap-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-900 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Período"
          value={preset}
          onChange={(e) => setPreset(e.target.value as ReportPeriodPreset)}
          options={PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        {preset === 'custom' ? (
          <>
            <DatePicker label="Desde" value={customFrom} onChange={setCustomFrom} />
            <DatePicker
              label="Hasta"
              value={customTo}
              onChange={setCustomTo}
              minDate={customFrom ?? undefined}
            />
          </>
        ) : (
          <p className="flex items-end pb-2 text-body-sm text-surface-600 dark:text-surface-400 sm:col-span-2 lg:col-span-3">
            {range.label}: {range.startDate} — {range.endDate}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total clases"
          value={summary?.totalSchedules ?? 0}
          isLoading={summaryLoading}
        />
        <KpiCard label="Completadas" value={summary?.completed ?? 0} isLoading={summaryLoading} />
        <KpiCard label="Canceladas" value={summary?.cancelled ?? 0} isLoading={summaryLoading} />
        <KpiCard
          label="Tasa de asistencia"
          value={formatPercent(summary?.attendanceRate ?? 0)}
          isLoading={summaryLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <h2 className="text-heading-md text-surface-900 dark:text-surface-50">
            Desempeño por instructor
          </h2>
          <Table
            columns={instructorColumns}
            data={instructors}
            isLoading={instructorsLoading}
            rowKey={(r) => r.instructorId}
            emptyState={
              <ListEmptyState
                illustration="chart"
                title="Sin datos en este período"
                description="No hay clases registradas para los instructores en el rango seleccionado."
              />
            }
          />
        </section>

        <ReportsPieChart
          theoryCount={summary?.theoryCount ?? 0}
          practiceCount={summary?.practiceCount ?? 0}
          isLoading={summaryLoading}
        />
      </div>
    </div>
  );
}
