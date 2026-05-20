import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import {
  licenseCategoryFormSchema,
  type LicenseCategoryFormValues,
} from '@/schemas/licenseCategory.schema';
import type { LicenseCategory } from '@/types/curriculum.types';

interface LicenseCategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category: LicenseCategory | null;
  onSubmit: (values: LicenseCategoryFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function LicenseCategoryFormModal({
  open,
  onClose,
  category,
  onSubmit,
  isSubmitting,
}: LicenseCategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<LicenseCategoryFormValues>({
    resolver: zodResolver(licenseCategoryFormSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (open && category) {
      reset({
        name: category.name,
        description: category.description,
        defaultTheoryCapacity: category.defaultTheoryCapacity,
        requiredPracticeSessions: category.requiredPracticeSessions,
        requiresAllTheoryTopics: category.requiresAllTheoryTopics,
      });
    }
  }, [open, category, reset]);

  const requiresAllTheoryTopics = watch('requiresAllTheoryTopics');

  const showError = (field: keyof LicenseCategoryFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? `Editar ${category.code}` : 'Categoría'}
      description={category ? `${category.groupLabel}` : undefined}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Nombre visible" errorMessage={showError('name')} {...register('name')} />
        <label className="flex flex-col gap-1.5">
          <span className="text-label text-surface-700 dark:text-surface-200">Descripción</span>
          <textarea
            rows={4}
            className="rounded-lg border border-surface-300 bg-surface-50 px-3 py-2 text-body-md focus:border-primary-500 focus:outline-none focus:shadow-glow dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            {...register('description')}
          />
          {showError('description') ? (
            <span className="text-caption text-error-600">{showError('description')}</span>
          ) : null}
        </label>
        <Input
          label="Cupo por defecto (clases teóricas)"
          type="number"
          helperText="Máximo de estudiantes sugerido al crear un tema nuevo."
          errorMessage={showError('defaultTheoryCapacity')}
          {...register('defaultTheoryCapacity')}
        />

        <fieldset className="flex flex-col gap-3 rounded-lg border border-surface-200 p-4 dark:border-surface-700">
          <legend className="px-1 text-label font-semibold text-surface-800 dark:text-surface-100">
            Requisitos para obtener la licencia
          </legend>
          <Toggle
            label="Exigir todos los temas teóricos activos"
            description="El estudiante debe completar cada materia del temario de esta categoría."
            checked={requiresAllTheoryTopics}
            onChange={(e) => setValue('requiresAllTheoryTopics', e.target.checked)}
          />
          <Input
            label="Clases prácticas requeridas"
            type="number"
            helperText="Cantidad de clases prácticas individuales (1 estudiante por clase)."
            errorMessage={showError('requiredPracticeSessions')}
            {...register('requiredPracticeSessions')}
          />
        </fieldset>
      </form>
    </Modal>
  );
}
