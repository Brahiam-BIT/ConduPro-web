import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Table, type TableColumn } from '@/components/ui/Table';
import { ScheduleDetailModal } from '@/components/shared/ScheduleDetailModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Pagination } from '@/components/shared/Pagination';
import { ScheduleEmptyState } from '@/components/shared/ScheduleEmptyState';
import { ScheduleStatusBadge, ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import {
  useCancelSchedule,
  useScheduleDetail,
  useStudentSchedulesList,
  type StudentScheduleListFilters,
} from '@/hooks/useStudentSchedules';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import {
  SCHEDULE_STATUS_FILTER_OPTIONS,
  SCHEDULE_TYPE_FILTER_OPTIONS,
} from '@/constants/schedules';
import { formatDate, formatTime } from '@/utils/formatDate';
import { formatInstructorName, toApiDate } from '@/utils/schedule';
import { ROUTES } from '@/constants/routes';
import type { Schedule, ScheduleStatus, ScheduleType } from '@/types/schedule.types';

const PAGE_SIZE = 10;

export default function StudentSchedules() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ScheduleStatus | 'ALL'>('ALL');
  const [type, setType] = useState<ScheduleType | 'ALL'>('ALL');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const filters: StudentScheduleListFilters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      status,
      type,
      fromDate: fromDate ? toApiDate(fromDate) : undefined,
      toDate: toDate ? toApiDate(toDate) : undefined,
    }),
    [page, status, type, fromDate, toDate],
  );

  const { data, isLoading, isError } = useStudentSchedulesList(filters);
  const { data: detailSchedule, isLoading: detailLoading } = useScheduleDetail(selectedId);
  const cancelMutation = useCancelSchedule();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const columns: TableColumn<Schedule>[] = [
    {
      key: 'type',
      header: 'Tipo',
      cell: (r) => <ScheduleTypeBadge type={r.type} />,
    },
    {
      key: 'instructor',
      header: 'Instructor',
      cell: (r) => formatInstructorName(r.instructor),
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
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (r) => <ScheduleStatusBadge status={r.status} />,
    },
  ];

  const handleCancelConfirm = async () => {
    if (!selectedId) return;
    try {
      await cancelMutation.mutateAsync(selectedId);
      toast.success('Clase cancelada', 'Tu clase fue cancelada correctamente.');
      setConfirmCancelOpen(false);
      setSelectedId(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error, 'No se pudo cancelar la clase.'));
    }
  };

  const resetFilters = () => {
    setStatus('ALL');
    setType('ALL');
    setFromDate(null);
    setToDate(null);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Mis clases"
        subtitle="Consulta y gestiona todas tus clases agendadas"
        actions={
          <Link to={ROUTES.STUDENT.BOOK}>
            <Button iconLeft={<CalendarPlus className="h-4 w-4" />}>Agendar clase</Button>
          </Link>
        }
      />

      {/* Filtros */}
      <div className="grid gap-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-900 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Estado"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ScheduleStatus | 'ALL');
            setPage(1);
          }}
          options={SCHEDULE_STATUS_FILTER_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
        />
        <Select
          label="Tipo"
          value={type}
          onChange={(e) => {
            setType(e.target.value as ScheduleType | 'ALL');
            setPage(1);
          }}
          options={SCHEDULE_TYPE_FILTER_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
        />
        <DatePicker
          label="Desde"
          value={fromDate}
          onChange={(d) => {
            setFromDate(d);
            setPage(1);
          }}
        />
        <DatePicker
          label="Hasta"
          value={toDate}
          onChange={(d) => {
            setToDate(d);
            setPage(1);
          }}
          minDate={fromDate ?? undefined}
        />
      </div>

      {(status !== 'ALL' || type !== 'ALL' || fromDate || toDate) && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}

      {isError ? (
        <p className="text-body-sm text-error-600 dark:text-error-500">
          Error al cargar las clases. Intenta de nuevo.
        </p>
      ) : null}

      <Table
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        rowKey={(r) => r.id}
        onRowClick={(r) => setSelectedId(r.id)}
        emptyState={
          <ScheduleEmptyState
            title={
              status !== 'ALL' || type !== 'ALL' || fromDate || toDate
                ? 'No hay clases con estos filtros'
                : 'Todavía no tienes clases'
            }
            description={
              status !== 'ALL' || type !== 'ALL' || fromDate || toDate
                ? 'Prueba ajustando los filtros de búsqueda.'
                : '¡Agenda tu primera clase y comienza tu formación!'
            }
            showCta={status === 'ALL' && type === 'ALL' && !fromDate && !toDate}
          />
        }
      />

      {data && data.total > 0 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={data.total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      <ScheduleDetailModal
        open={!!selectedId && !confirmCancelOpen}
        onClose={() => setSelectedId(null)}
        schedule={detailSchedule ?? null}
        isLoading={detailLoading}
        onCancel={() => setConfirmCancelOpen(true)}
        isCancelling={cancelMutation.isPending}
      />

      <ConfirmDialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        title="¿Cancelar esta clase?"
        description="Esta acción no se puede deshacer. La clase quedará marcada como cancelada."
        confirmLabel="Sí, cancelar"
        variant="danger"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
