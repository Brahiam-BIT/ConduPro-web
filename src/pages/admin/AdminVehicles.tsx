import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ListEmptyState } from '@/components/shared/ListEmptyState';
import { VehicleFormModal } from '@/components/admin/VehicleFormModal';
import {
  useAdminVehiclesList,
  useCreateVehicle,
  useToggleVehicleAvailable,
  useUpdateVehicle,
} from '@/hooks/useAdmin';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { cn } from '@/utils/cn';
import type { VehicleFormValues } from '@/schemas/vehicle.schema';
import type { Vehicle } from '@/types/vehicle.types';

const PAGE_SIZE = 10;

export default function AdminVehicles() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Vehicle | null>(null);

  const { data, isLoading } = useAdminVehiclesList(page);
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const toggleMutation = useToggleVehicleAvailable();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const columns: TableColumn<Vehicle>[] = [
    { key: 'plate', header: 'Placa', cell: (v) => <span className="font-mono font-medium">{v.plate}</span> },
    { key: 'brand', header: 'Marca', cell: (v) => v.brand },
    { key: 'model', header: 'Modelo', cell: (v) => v.model },
    { key: 'year', header: 'Año', cell: (v) => v.year },
    {
      key: 'status',
      header: 'Estado',
      cell: (v) =>
        v.available ? (
          <Badge variant="success" dot size="sm">
            Activo
          </Badge>
        ) : (
          <Badge variant="neutral" dot size="sm">
            Inactivo
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      className: 'w-40',
      mobileLabel: 'Acciones',
      cell: (v) => (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setEditingVehicle(v);
              setModalOpen(true);
            }}
          >
            Editar
          </Button>
          <div
            className="inline-flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Toggle
              size="sm"
              checked={v.available}
              aria-label={
                v.available
                  ? `Desactivar vehículo ${v.plate}`
                  : `Activar vehículo ${v.plate}`
              }
              disabled={toggleMutation.isPending && toggleTarget?.id === v.id}
              onChange={() => setToggleTarget(v)}
            />
            <span
              className={cn(
                'min-w-[3.25rem] text-caption font-semibold',
                v.available
                  ? 'text-success-600 dark:text-success-500'
                  : 'text-surface-500 dark:text-surface-400',
              )}
            >
              {v.available ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      ),
    },
  ];

  const handleSubmit = async (values: VehicleFormValues) => {
    try {
      if (editingVehicle) {
        await updateMutation.mutateAsync({
          id: editingVehicle.id,
          payload: values,
        });
        toast.success('Vehículo actualizado', 'Los cambios se guardaron correctamente.');
      } else {
        await createMutation.mutateAsync({ ...values, available: true });
        toast.success('Vehículo creado', 'El vehículo fue agregado a la flota.');
      }
      setModalOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    try {
      await toggleMutation.mutateAsync({
        id: toggleTarget.id,
        available: !toggleTarget.available,
      });
      toast.success(
        toggleTarget.available ? 'Vehículo desactivado' : 'Vehículo activado',
        toggleTarget.plate,
      );
      setToggleTarget(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        actions={
          <Button
            iconLeft={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingVehicle(null);
              setModalOpen(true);
            }}
          >
            Agregar vehículo
          </Button>
        }
      />

      <Table
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        rowKey={(v) => v.id}
        emptyState={
          <ListEmptyState
            illustration="car"
            title="No hay vehículos registrados"
            description="Agrega el primer vehículo a la flota de la escuela."
            action={
              <Button
                iconLeft={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setEditingVehicle(null);
                  setModalOpen(true);
                }}
              >
                Agregar vehículo
              </Button>
            }
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

      <VehicleFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingVehicle(null);
        }}
        vehicle={editingVehicle}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleConfirm}
        title={toggleTarget?.available ? '¿Desactivar vehículo?' : '¿Activar vehículo?'}
        description={
          toggleTarget
            ? `${toggleTarget.brand} ${toggleTarget.model} (${toggleTarget.plate}) ${
                toggleTarget.available
                  ? 'no estará disponible para clases prácticas.'
                  : 'volverá a estar disponible para clases prácticas.'
              }`
            : undefined
        }
        confirmLabel={toggleTarget?.available ? 'Desactivar' : 'Activar'}
        variant={toggleTarget?.available ? 'danger' : 'primary'}
        isLoading={toggleMutation.isPending}
      />
    </div>
  );
}
