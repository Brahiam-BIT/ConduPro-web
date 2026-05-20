import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Table, type TableColumn } from '@/components/ui/Table';
import { ScheduleDetailModal } from '@/components/shared/ScheduleDetailModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Pagination } from '@/components/shared/Pagination';
import { ScheduleEmptyState } from '@/components/shared/ScheduleEmptyState';
import { ScheduleStatusBadge, ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import { UserAsyncSelect } from '@/components/admin/UserAsyncSelect';
import {
  useAdminCancelSchedule,
  useAdminScheduleDetail,
  useAdminSchedulesList,
  useAdminUpdateScheduleStatus,
  type AdminScheduleFilters,
} from '@/hooks/useAdmin';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import {
  SCHEDULE_STATUS_FILTER_OPTIONS,
  SCHEDULE_TYPE_FILTER_OPTIONS,
} from '@/constants/schedules';
import { formatDate, formatTime } from '@/utils/formatDate';
import { canCancelSchedule, toApiDate } from '@/utils/schedule';
import { formatStudentName } from '@/utils/instructor';
import { formatInstructorName } from '@/utils/schedule';
import type { Schedule, ScheduleStatus, ScheduleType } from '@/types/schedule.types';

const PAGE_SIZE = 10;

export default function AdminSchedules() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ScheduleStatus | 'ALL'>('ALL');
  const [type, setType] = useState<ScheduleType | 'ALL'>('ALL');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [instructorId, setInstructorId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<ScheduleStatus | null>(null);

  const filters: AdminScheduleFilters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      status,
      type,
      fromDate: fromDate ? toApiDate(fromDate) : undefined,
      toDate: toDate ? toApiDate(toDate) : undefined,
      instructorId: instructorId || undefined,
      studentId: studentId || undefined,
    }),
    [page, status, type, fromDate, toDate, instructorId, studentId],
  );

  const { data, isLoading, isError } = useAdminSchedulesList(filters);
  const { data: detailSchedule, isLoading: detailLoading } = useAdminScheduleDetail(selectedId);
  const updateStatusMutation = useAdminUpdateScheduleStatus(filters);
  const cancelMutation = useAdminCancelSchedule(filters);

  useEffect(() => {
    if (detailSchedule) {
      setModalStatus(detailSchedule.status);
    }
  }, [detailSchedule]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const columns: TableColumn<Schedule>[] = [
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
    {
      key: 'type',
      header: 'Tipo',
      cell: (r) => <ScheduleTypeBadge type={r.type} />,
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

  const handleStatusChange = async (newStatus: ScheduleStatus) => {
    if (!selectedId || !detailSchedule || newStatus === detailSchedule.status) return;
    const previous = modalStatus;
    setModalStatus(newStatus);
    try {
      await updateStatusMutation.mutateAsync({ id: selectedId, status: newStatus });
      toast.success('Estado actualizado', 'El agendamiento fue actualizado.');
    } catch (error) {
      setModalStatus(previous);
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const handleCancelConfirm = async () => {
    if (!selectedId) return;
    try {
      await cancelMutation.mutateAsync(selectedId);
      toast.success('Clase cancelada', 'El agendamiento fue cancelado.');
      setConfirmCancelOpen(false);
      setSelectedId(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const showCancel =
    detailSchedule && canCancelSchedule(detailSchedule) && detailSchedule.status !== 'CANCELLED';

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Agendamientos" subtitle="Listado y gestión de todas las clases" />

      <div className="grid gap-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-900 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <UserAsyncSelect
          label="Instructor"
          role="INSTRUCTOR"
          value={instructorId}
          onChange={(id) => {
            setInstructorId(id);
            setPage(1);
          }}
          onClear={() => {
            setInstructorId('');
            setPage(1);
          }}
        />
        <UserAsyncSelect
          label="Estudiante"
          role="STUDENT"
          value={studentId}
          onChange={(id) => {
            setStudentId(id);
            setPage(1);
          }}
          onClear={() => {
            setStudentId('');
            setPage(1);
          }}
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

      {isError ? (
        <p className="text-body-sm text-error-600 dark:text-error-500">
          Error al cargar los agendamientos.
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
            title="No hay agendamientos"
            description="Ajusta los filtros o espera nuevas clases agendadas."
            showCta={false}
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
        viewer="admin"
        statusValue={modalStatus ?? detailSchedule?.status}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={updateStatusMutation.isPending}
        onCancel={showCancel ? () => setConfirmCancelOpen(true) : undefined}
        isCancelling={cancelMutation.isPending}
      />

      <ConfirmDialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        title="¿Cancelar este agendamiento?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        variant="danger"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
