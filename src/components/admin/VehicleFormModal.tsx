import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { vehicleFormSchema, type VehicleFormValues } from '@/schemas/vehicle.schema';
import type { Vehicle } from '@/types/vehicle.types';

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function VehicleFormModal({
  open,
  onClose,
  vehicle,
  onSubmit,
  isSubmitting,
}: VehicleFormModalProps) {
  const isEdit = !!vehicle;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    mode: 'onTouched',
    defaultValues: {
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (open && vehicle) {
      reset({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
      });
    } else if (open && !vehicle) {
      reset({
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
      });
    }
  }, [open, vehicle, reset]);

  const showError = (field: keyof VehicleFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar vehículo' : 'Agregar vehículo'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Agregar vehículo'}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Placa"
          placeholder="ABC123"
          errorMessage={showError('plate')}
          {...register('plate')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Marca" errorMessage={showError('brand')} {...register('brand')} />
          <Input label="Modelo" errorMessage={showError('model')} {...register('model')} />
        </div>
        <Input
          label="Año"
          type="number"
          errorMessage={showError('year')}
          {...register('year')}
        />
      </form>
    </Modal>
  );
}
