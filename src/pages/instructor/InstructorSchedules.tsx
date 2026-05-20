import { useMemo, useState } from 'react';
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
  useCancelScheduleAsInstructor,
  useInstructorScheduleDetail,
  useInstructorSchedulesList,
  useUpdateScheduleStatus,
  type ScheduleListFilters,
} from '@/hooks/useInstructorSchedules';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import {
  SCHEDULE_STATUS_FILTER_OPTIONS,
  SCHEDULE_TYPE_FILTER_OPTIONS,
} from '@/constants/schedules';
import { formatDate, formatTime } from '@/utils/formatDate';
import { canCompleteSchedule, formatStudentName } from '@/utils/instructor';
import { toApiDate } from '@/utils/schedule';
import type { Schedule, ScheduleStatus, ScheduleType } from '@/types/schedule.types';

const PAGE_SIZE = 10;

type ConfirmAction = 'cancel' | 'complete' | null;

export default function InstructorSchedules() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ScheduleStatus | 'ALL'>('ALL');
  const [type, setType] = useState<ScheduleType | 'ALL'>('ALL');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const filters: ScheduleListFilters = useMemo(
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

  const { data, isLoading, isError } = useInstructorSchedulesList(filters);
  const { data: detailSchedule, isLoading: detailLoading } = useInstructorScheduleDetail(selectedId);
  const completeMutation = useUpdateScheduleStatus(filters);
  const cancelMutation = useCancelScheduleAsInstructor(filters);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const columns: TableColumn<Schedule>[] = [
    {
      key: 'type',
      header: 'Tipo',
      cell: (r) => <ScheduleTypeBadge type={r.type} />,
    },
    {
      key: 'student',
      header: 'Estudiante',
      cell: (r) => formatStudentName(r.student),
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
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setSelectedId(r.id)}>
            Ver
          </Button>
          {canCompleteSchedule(r) ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(r.id);
                setConfirmAction('complete');
              }}
            >
              Completar
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const handleConfirm = async () => {
    if (!selectedId || !confirmAction) return;
    try {
      if (confirmAction === 'complete') {
        await completeMutation.mutateAsync({ id: selectedId, status: 'COMPLETED' });
        toast.success('Clase completada', 'La clase fue marcada como completada.');
      } else {
        await cancelMutation.mutateAsync(selectedId);
        toast.success('Clase cancelada', 'La clase fue cancelada correctamente.');
      }
      setConfirmAction(null);
      setSelectedId(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const confirmOpen = confirmAction !== null;
  const confirmConfig =
    confirmAction === 'complete'
      ? {
          title: '¿Marcar como completada?',
          description: 'La clase quedará registrada como completada en el sistema.',
          confirmLabel: 'Marcar completada',
          variant: 'primary' as const,
        }
      : {
          title: '¿Cancelar esta clase?',
          description: 'Esta acción no se puede deshacer.',
          confirmLabel: 'Sí, cancelar',
          variant: 'danger' as const,
        };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Mis clases" subtitle="Gestiona las clases que impartes" />

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
        <DatePicker label="Desde" value={fromDate} onChange={(d) => { setFromDate(d); setPage(1); }} />
        <DatePicker
          label="Hasta"
          value={toDate}
          onChange={(d) => { setToDate(d); setPage(1); }}
          minDate={fromDate ?? undefined}
        />
      </div>

      {isError ? (
        <p className="text-body-sm text-error-600 dark:text-error-500">
          Error al cargar las clases.
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
            title="No hay clases"
            description="Cuando tengas clases agendadas aparecerán aquí."
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
        open={!!selectedId && !confirmOpen}
        onClose={() => setSelectedId(null)}
        schedule={detailSchedule ?? null}
        isLoading={detailLoading}
        viewer="instructor"
        onCancel={() => setConfirmAction('cancel')}
        isCancelling={cancelMutation.isPending}
        onComplete={() => setConfirmAction('complete')}
        isCompleting={completeMutation.isPending}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel={confirmConfig.confirmLabel}
        variant={confirmConfig.variant}
        isLoading={completeMutation.isPending || cancelMutation.isPending}
      />
    </div>
  );
}
