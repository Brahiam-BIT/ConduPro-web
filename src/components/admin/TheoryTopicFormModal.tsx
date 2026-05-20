import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theoryTopicFormSchema, type TheoryTopicFormValues } from '@/schemas/theoryTopic.schema';
import type { LicenseCategory, TheoryTopic } from '@/types/curriculum.types';

interface TheoryTopicFormModalProps {
  open: boolean;
  onClose: () => void;
  category: LicenseCategory | null;
  topic?: TheoryTopic | null;
  onSubmit: (values: TheoryTopicFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function TheoryTopicFormModal({
  open,
  onClose,
  category,
  topic,
  onSubmit,
  isSubmitting,
}: TheoryTopicFormModalProps) {
  const isEdit = !!topic;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<TheoryTopicFormValues>({
    resolver: zodResolver(theoryTopicFormSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      sortOrder: 0,
      sessionCapacity: category?.defaultTheoryCapacity ?? 20,
      estimatedHours: undefined,
    },
  });

  useEffect(() => {
    if (open && topic) {
      reset({
        title: topic.title,
        description: topic.description ?? '',
        sortOrder: topic.sortOrder,
        sessionCapacity: topic.sessionCapacity,
        estimatedHours: topic.estimatedHours ?? undefined,
      });
    } else if (open && category) {
      reset({
        title: '',
        description: '',
        sortOrder: 0,
        sessionCapacity: category.defaultTheoryCapacity,
        estimatedHours: undefined,
      });
    }
  }, [open, topic, category, reset]);

  const showError = (field: keyof TheoryTopicFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar tema teórico' : 'Nuevo tema teórico'}
      description={category ? `${category.code} — ${category.name}` : undefined}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEdit ? 'Guardar' : 'Crear tema'}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Título del tema" errorMessage={showError('title')} {...register('title')} />
        <label className="flex flex-col gap-1.5">
          <span className="text-label text-surface-700 dark:text-surface-200">
            Contenido / descripción
          </span>
          <textarea
            rows={3}
            className="rounded-lg border border-surface-300 bg-surface-50 px-3 py-2 text-body-md focus:border-primary-500 focus:outline-none focus:shadow-glow dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            {...register('description')}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Orden"
            type="number"
            errorMessage={showError('sortOrder')}
            {...register('sortOrder')}
          />
          <Input
            label="Cupo por clase"
            type="number"
            helperText="Estudiantes por sesión teórica"
            errorMessage={showError('sessionCapacity')}
            {...register('sessionCapacity')}
          />
          <Input
            label="Horas estimadas"
            type="number"
            step="0.5"
            errorMessage={showError('estimatedHours')}
            {...register('estimatedHours')}
          />
        </div>
      </form>
    </Modal>
  );
}
