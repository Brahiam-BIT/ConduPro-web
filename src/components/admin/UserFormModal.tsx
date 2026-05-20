import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PasswordField } from '@/components/auth/PasswordField';
import { ROLE_LABELS, ROLES } from '@/constants/roles';
import { userCreateSchema, userFormSchema, type UserFormValues } from '@/schemas/user.schema';
import type { User } from '@/types/user.types';
interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSubmit: (values: UserFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: ROLE_LABELS.STUDENT },
  { value: ROLES.INSTRUCTOR, label: ROLE_LABELS.INSTRUCTOR },
  { value: ROLES.ADMIN, label: ROLE_LABELS.ADMIN },
];

export function UserFormModal({ open, onClose, user, onSubmit, isSubmitting }: UserFormModalProps) {
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? userFormSchema : userCreateSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: ROLES.STUDENT,
      password: '',
    },
  });

  useEffect(() => {
    if (open && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
        role: user.role,
        password: '',
      });
    } else if (open && !user) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: ROLES.STUDENT,
        password: '',
      });
    }
  }, [open, user, reset]);

  const showError = (field: keyof UserFormValues) =>
    touchedFields[field] ? errors[field]?.message : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar usuario' : 'Crear usuario'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" errorMessage={showError('firstName')} {...register('firstName')} />
          <Input label="Apellido" errorMessage={showError('lastName')} {...register('lastName')} />
        </div>
        <Input
          label="Correo"
          type="email"
          errorMessage={showError('email')}
          {...register('email')}
        />
        <Input label="Teléfono" type="tel" errorMessage={showError('phone')} {...register('phone')} />
        <Select
          label="Rol"
          options={ROLE_OPTIONS}
          errorMessage={showError('role')}
          {...register('role')}
        />
        <PasswordField
          label={isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          autoComplete="new-password"
          errorMessage={showError('password')}
          {...register('password')}
        />
      </form>
    </Modal>
  );
}
