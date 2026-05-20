import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ListEmptyState } from '@/components/shared/ListEmptyState';
import { UserFormModal } from '@/components/admin/UserFormModal';
import {
  useAdminUsersList,
  useCreateUser,
  useToggleUserActive,
  useUpdateUser,
} from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { ROLE_LABELS } from '@/constants/roles';
import { USER_ROLE_FILTER_OPTIONS, roleFilterToParam, type UserRoleFilter } from '@/constants/users';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';
import type { UserFormValues } from '@/schemas/user.schema';
import type { User } from '@/types/user.types';
import type { Role } from '@/constants/roles';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleTab, setRoleTab] = useState<UserRoleFilter>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      role: roleFilterToParam(roleTab),
    }),
    [page, debouncedSearch, roleTab],
  );

  const { data, isLoading } = useAdminUsersList(filters);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const toggleMutation = useToggleUserActive();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      header: 'Usuario',
      cell: (u) => (
        <span className="inline-flex items-center gap-2">
          <Avatar name={`${u.firstName} ${u.lastName}`} src={u.avatarUrl} size="sm" />
          <span className="font-medium text-surface-800 dark:text-surface-100">
            {u.firstName} {u.lastName}
          </span>
        </span>
      ),
    },
    { key: 'email', header: 'Email', cell: (u) => u.email },
    { key: 'phone', header: 'Teléfono', cell: (u) => u.phone ?? '—' },
    {
      key: 'role',
      header: 'Rol',
      cell: (u) => (
        <Badge variant={u.role === 'ADMIN' ? 'primary' : u.role === 'INSTRUCTOR' ? 'info' : 'neutral'}>
          {ROLE_LABELS[u.role]}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (u) =>
        u.isActive ? (
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
      key: 'created',
      header: 'Creado',
      cell: (u) => formatDate(u.createdAt, 'd MMM yyyy'),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      className: 'w-40',
      mobileLabel: 'Acciones',
      cell: (u) => (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setEditingUser(u);
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
              checked={u.isActive}
              aria-label={
                u.isActive
                  ? `Desactivar usuario ${u.firstName} ${u.lastName}`
                  : `Activar usuario ${u.firstName} ${u.lastName}`
              }
              disabled={toggleMutation.isPending && toggleTarget?.id === u.id}
              onChange={() => setToggleTarget(u)}
            />
            <span
              className={cn(
                'min-w-[3.25rem] text-caption font-semibold',
                u.isActive
                  ? 'text-success-600 dark:text-success-500'
                  : 'text-surface-500 dark:text-surface-400',
              )}
            >
              {u.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      ),
    },
  ];

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser.id,
          payload: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            role: values.role as Role,
            ...(values.password ? { password: values.password } : {}),
          },
        });
        toast.success('Usuario actualizado', 'Los cambios se guardaron correctamente.');
      } else {
        await createMutation.mutateAsync({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          role: values.role as Role,
          password: values.password,
        });
        toast.success('Usuario creado', 'El usuario fue registrado correctamente.');
      }
      setModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    try {
      await toggleMutation.mutateAsync({
        id: toggleTarget.id,
        isActive: !toggleTarget.isActive,
      });
      toast.success(
        toggleTarget.isActive ? 'Usuario desactivado' : 'Usuario activado',
        `${toggleTarget.firstName} ${toggleTarget.lastName}`,
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
              setEditingUser(null);
              setModalOpen(true);
            }}
          >
            Crear usuario
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Input
          label="Buscar"
          placeholder="Nombre o correo…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:max-w-xs"
        />
        <Tabs
          items={USER_ROLE_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={roleTab}
          onValueChange={(v) => {
            setRoleTab(v as UserRoleFilter);
            setPage(1);
          }}
        />
      </div>

      <Table
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        rowKey={(u) => u.id}
        emptyState={
          <ListEmptyState
            illustration="users"
            title={
              debouncedSearch ? 'Sin resultados' : 'No hay usuarios registrados'
            }
            description={
              debouncedSearch
                ? 'No encontramos usuarios con ese nombre o correo.'
                : 'Crea el primer usuario para comenzar.'
            }
            action={
              !debouncedSearch ? (
                <Button
                  iconLeft={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    setEditingUser(null);
                    setModalOpen(true);
                  }}
                >
                  Crear usuario
                </Button>
              ) : undefined
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

      <UserFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleConfirm}
        title={toggleTarget?.isActive ? '¿Desactivar usuario?' : '¿Activar usuario?'}
        description={
          toggleTarget
            ? `${toggleTarget.firstName} ${toggleTarget.lastName} ${toggleTarget.isActive ? 'no podrá acceder' : 'podrá acceder de nuevo'}.`
            : undefined
        }
        confirmLabel={toggleTarget?.isActive ? 'Desactivar' : 'Activar'}
        variant={toggleTarget?.isActive ? 'danger' : 'primary'}
        isLoading={toggleMutation.isPending}
      />
    </div>
  );
}
