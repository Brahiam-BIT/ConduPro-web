import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { VehicleFormModal } from '@/components/admin/VehicleFormModal';
import {
  useAdminVehiclesList,
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
} from '@/hooks/useAdmin';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import type { VehicleFormValues } from '@/schemas/vehicle.schema';
import type { Vehicle } from '@/types/vehicle.types';

const PAGE_SIZE = 10;

export default function AdminVehicles() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const { data, isLoading } = useAdminVehiclesList(page);
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const columns: TableColumn<Vehicle>[] = [
    { key: 'plate', header: 'Placa', cell: (v) => <span className="font-mono font-medium">{v.plate}</span> },
    { key: 'brand', header: 'Marca', cell: (v) => v.brand },
    { key: 'model', header: 'Modelo', cell: (v) => v.model },
    { key: 'year', header: 'Año', cell: (v) => v.year },
    {
      key: 'available',
      header: 'Disponibilidad',
      cell: (v) =>
        v.available ? (
          <Badge variant="success" dot size="sm">
            Disponible
          </Badge>
        ) : (
          <Badge variant="warning" dot size="sm">
            No disponible
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      cell: (v) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingVehicle(v);
              setModalOpen(true);
            }}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(v);
            }}
          >
            Eliminar
          </Button>
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
        await createMutation.mutateAsync(values);
        toast.success('Vehículo creado', 'El vehículo fue agregado a la flota.');
      }
      setModalOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Vehículo eliminado', `${deleteTarget.plate} fue eliminado.`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Vehículos"
        subtitle="Inventario y disponibilidad de la flota"
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
          <p className="py-8 text-center text-body-sm text-surface-500">
            No hay vehículos registrados. Agrega el primero a la flota.
          </p>
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
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar vehículo?"
        description={
          deleteTarget
            ? `Se eliminará ${deleteTarget.brand} ${deleteTarget.model} (${deleteTarget.plate}).`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
