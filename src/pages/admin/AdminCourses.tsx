import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Car, CheckCircle2, Plus, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Table, type TableColumn } from '@/components/ui/Table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { LicenseCategoryFormModal } from '@/components/admin/LicenseCategoryFormModal';
import { TheoryTopicFormModal } from '@/components/admin/TheoryTopicFormModal';
import { UserAsyncSelect } from '@/components/admin/UserAsyncSelect';
import { useAdminEnrollStudent, useAdminStudentEnrollments } from '@/hooks/useStudentEnrollments';
import {
  useCreateTheoryTopic,
  useDeleteTheoryTopic,
  useLicenseCategories,
  useTheoryTopics,
  useToggleTheoryTopicActive,
  useUpdateLicenseCategory,
  useUpdateTheoryTopic,
} from '@/hooks/useCurriculum';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { LICENSE_GROUP_LABELS, LICENSE_GROUP_ORDER } from '@/constants/licenseCategories';
import { cn } from '@/utils/cn';
import { formatLicenseRequirements } from '@/utils/licenseRequirements';
import type { LicenseCategoryFormValues } from '@/schemas/licenseCategory.schema';
import type { TheoryTopicFormValues } from '@/schemas/theoryTopic.schema';
import type { LicenseCategory, TheoryTopic } from '@/types/curriculum.types';

export default function AdminCourses() {
  const toast = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LicenseCategory | null>(null);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TheoryTopic | null>(null);
  const [categoryToggleTarget, setCategoryToggleTarget] = useState<LicenseCategory | null>(null);
  const [topicToggleTarget, setTopicToggleTarget] = useState<TheoryTopic | null>(null);
  const [deleteTopicTarget, setDeleteTopicTarget] = useState<TheoryTopic | null>(null);
  const [enrollStudentId, setEnrollStudentId] = useState('');

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } =
    useLicenseCategories();
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;

  const { data: topics = [], isLoading: topicsLoading } = useTheoryTopics(selectedCategoryId);

  const updateCategoryMutation = useUpdateLicenseCategory();
  const createTopicMutation = useCreateTheoryTopic();
  const updateTopicMutation = useUpdateTheoryTopic(selectedCategoryId ?? '');
  const deleteTopicMutation = useDeleteTheoryTopic(selectedCategoryId ?? '');
  const toggleTopicMutation = useToggleTheoryTopicActive(selectedCategoryId ?? '');
  const adminEnrollMutation = useAdminEnrollStudent();
  const { data: adminStudentEnrollments = [] } = useAdminStudentEnrollments(enrollStudentId);

  const studentAlreadyInCategory =
    !!selectedCategory &&
    adminStudentEnrollments.some(
      (e) => e.licenseCategory.id === selectedCategory.id && e.status === 'ACTIVE',
    );

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0]!.id);
    }
  }, [categories, selectedCategoryId]);

  const selectedRequirements = selectedCategory
    ? formatLicenseRequirements(selectedCategory)
    : null;

  const groupedCategories = useMemo(() => {
    const map = new Map<string, LicenseCategory[]>();
    for (const group of LICENSE_GROUP_ORDER) {
      map.set(
        group,
        categories.filter((c) => c.group === group),
      );
    }
    return map;
  }, [categories]);

  const topicColumns: TableColumn<TheoryTopic>[] = [
    {
      key: 'order',
      header: '#',
      cell: (t) => <span className="text-surface-500">{t.sortOrder}</span>,
      align: 'center',
    },
    { key: 'title', header: 'Tema / materia', cell: (t) => <span className="font-medium">{t.title}</span> },
    {
      key: 'capacity',
      header: 'Cupo',
      cell: (t) => `${t.sessionCapacity} est.`,
      align: 'center',
    },
    {
      key: 'hours',
      header: 'Horas',
      cell: (t) => (t.estimatedHours != null ? `${t.estimatedHours} h` : '—'),
      align: 'center',
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (t) => (
        <Badge variant={t.isActive ? 'success' : 'neutral'} dot size="sm">
          {t.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      className: 'w-44',
      cell: (t) => (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingTopic(t);
              setTopicModalOpen(true);
            }}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error-600 hover:text-error-700 dark:text-error-500"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTopicTarget(t);
            }}
          >
            Eliminar
          </Button>
          <div
            className="inline-flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Toggle
              size="sm"
              checked={t.isActive}
              aria-label={t.isActive ? `Desactivar tema ${t.title}` : `Activar tema ${t.title}`}
              disabled={toggleTopicMutation.isPending && topicToggleTarget?.id === t.id}
              onChange={() => setTopicToggleTarget(t)}
            />
            <span
              className={cn(
                'min-w-[3.25rem] text-caption font-semibold',
                t.isActive
                  ? 'text-success-600 dark:text-success-500'
                  : 'text-surface-500 dark:text-surface-400',
              )}
            >
              {t.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      ),
    },
  ];

  const handleCategorySubmit = async (values: LicenseCategoryFormValues) => {
    if (!editingCategory) return;
    try {
      await updateCategoryMutation.mutateAsync({ id: editingCategory.id, payload: values });
      toast.success('Categoría actualizada', editingCategory.code);
      setCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const handleTopicSubmit = async (values: TheoryTopicFormValues) => {
    if (!selectedCategory) return;
    const payload = {
      licenseCategoryId: selectedCategory.id,
      title: values.title,
      description: values.description || undefined,
      sortOrder: values.sortOrder,
      sessionCapacity: values.sessionCapacity,
      estimatedHours: values.estimatedHours,
    };
    try {
      if (editingTopic) {
        await updateTopicMutation.mutateAsync({ id: editingTopic.id, payload });
        toast.success('Tema actualizado', values.title);
      } else {
        await createTopicMutation.mutateAsync(payload);
        toast.success('Tema creado', values.title);
      }
      setTopicModalOpen(false);
      setEditingTopic(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const handleCategoryToggleConfirm = async () => {
    if (!categoryToggleTarget) return;
    try {
      await updateCategoryMutation.mutateAsync({
        id: categoryToggleTarget.id,
        payload: { isActive: !categoryToggleTarget.isActive },
      });
      toast.success(
        categoryToggleTarget.isActive ? 'Categoría desactivada' : 'Categoría activada',
        categoryToggleTarget.code,
      );
      setCategoryToggleTarget(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const handleTopicToggleConfirm = async () => {
    if (!topicToggleTarget) return;
    try {
      await toggleTopicMutation.mutateAsync({
        id: topicToggleTarget.id,
        isActive: !topicToggleTarget.isActive,
      });
      setTopicToggleTarget(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const handleDeleteTopicConfirm = async () => {
    if (!deleteTopicTarget) return;
    try {
      await deleteTopicMutation.mutateAsync(deleteTopicTarget.id);
      toast.success('Tema eliminado', deleteTopicTarget.title);
      setDeleteTopicTarget(null);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card variant="default" padding="md" className="border-primary-200/60 dark:border-primary-500/25">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <BookOpen className="h-6 w-6 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
          <div className="text-body-sm text-surface-600 dark:text-surface-400">
            <p className="font-medium text-surface-800 dark:text-surface-100">Clases teóricas</p>
            <p className="mt-1">
              Define el temario teórico y cuántas clases prácticas exige cada licencia (por ejemplo,
              A1: todos los temas activos + 10 prácticas). El seguimiento por estudiante llegará en
              la siguiente fase.
            </p>
            <p className="mt-2 flex items-center gap-2 font-medium text-surface-700 dark:text-surface-200">
              <Car className="h-4 w-4" aria-hidden />
              Clases prácticas: son individuales (1 estudiante). Gestiona vehículos e instructores en
              sus secciones y agenda en Agendamientos.
            </p>
          </div>
        </div>
      </Card>

      {categoriesError ? (
        <Card variant="elevated">
          <p className="text-body-sm text-error-600">
            No se pudieron cargar las categorías. ¿Ejecutaste la migración del API (
            <code className="text-caption">npm run migration:run</code>)?
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr]">
        {/* Categorías */}
        <aside className="flex flex-col gap-4">
          <h2 className="text-heading-sm text-surface-900 dark:text-surface-50">
            Categorías de licencia
          </h2>
          {categoriesLoading ? (
            <p className="text-body-sm text-surface-500">Cargando categorías…</p>
          ) : (
            LICENSE_GROUP_ORDER.map((group) => {
              const items = groupedCategories.get(group) ?? [];
              if (items.length === 0) return null;
              return (
                <div key={group} className="flex flex-col gap-2">
                  <p className="text-caption font-semibold uppercase tracking-wide text-surface-500">
                    {LICENSE_GROUP_LABELS[group]}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {items.map((cat) => {
                      const selected = selectedCategoryId === cat.id;
                      return (
                        <li key={cat.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={cn(
                              'w-full rounded-xl border p-3 text-left transition-colors',
                              selected
                                ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-500/15'
                                : 'border-surface-200 bg-surface-50 hover:border-primary-300 dark:border-surface-800 dark:bg-surface-900',
                              !cat.isActive && 'opacity-60',
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono text-label font-bold text-primary-600 dark:text-primary-400">
                                  {cat.code}
                                </span>
                                <p className="mt-0.5 text-body-sm font-medium text-surface-800 dark:text-surface-100">
                                  {cat.name}
                                </p>
                                <p className="mt-1 text-caption text-surface-500">
                                  {cat.topicCount} tema{cat.topicCount === 1 ? '' : 's'} ·{' '}
                                  {cat.requiredPracticeSessions} prácticas
                                </p>
                              </div>
                              <Badge variant={cat.isActive ? 'success' : 'neutral'} size="sm">
                                {cat.isActive ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </aside>

        {/* Temas teóricos */}
        <section className="flex min-w-0 flex-col gap-4">
          {selectedCategory ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-heading-md text-surface-900 dark:text-surface-50">
                    Temario teórico — {selectedCategory.code}
                  </h2>
                  <p className="mt-1 max-w-2xl text-body-sm text-surface-600 dark:text-surface-400">
                    {selectedCategory.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={<Settings2 className="h-4 w-4" />}
                    onClick={() => {
                      setEditingCategory(selectedCategory);
                      setCategoryModalOpen(true);
                    }}
                  >
                    Editar categoría
                  </Button>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-1.5 dark:border-surface-700">
                    <Toggle
                      size="sm"
                      checked={selectedCategory.isActive}
                      onChange={() => setCategoryToggleTarget(selectedCategory)}
                    />
                    <span className="text-caption font-medium">
                      {selectedCategory.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <Button
                    iconLeft={<Plus className="h-4 w-4" />}
                    size="sm"
                    onClick={() => {
                      setEditingTopic(null);
                      setTopicModalOpen(true);
                    }}
                  >
                    Agregar tema
                  </Button>
                </div>
              </div>

              {selectedRequirements ? (
                <Card variant="default" padding="md" className="border-primary-200/50 dark:border-primary-500/20">
                  <h3 className="text-heading-sm text-surface-900 dark:text-surface-50">
                    Requisitos para licencia {selectedCategory.code}
                  </h3>
                  <p className="mt-1 text-body-sm text-surface-600 dark:text-surface-400">
                    Para obtener esta licencia el estudiante deberá cumplir:
                  </p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    <li className="flex gap-3 rounded-lg bg-surface-100/80 p-3 dark:bg-surface-800/50">
                      <BookOpen
                        className={cn(
                          'h-5 w-5 shrink-0',
                          selectedRequirements.isTheoryReady
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-warning-500',
                        )}
                        aria-hidden
                      />
                      <div>
                        <p className="text-body-sm font-semibold text-surface-800 dark:text-surface-100">
                          Teoría — {selectedRequirements.theoryLabel}
                        </p>
                        <p className="mt-0.5 text-caption text-surface-600 dark:text-surface-400">
                          {selectedRequirements.theoryDetail}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3 rounded-lg bg-surface-100/80 p-3 dark:bg-surface-800/50">
                      <Car
                        className={cn(
                          'h-5 w-5 shrink-0',
                          selectedRequirements.isPracticeConfigured
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-warning-500',
                        )}
                        aria-hidden
                      />
                      <div>
                        <p className="text-body-sm font-semibold text-surface-800 dark:text-surface-100">
                          Práctica — {selectedRequirements.practiceLabel}
                        </p>
                        <p className="mt-0.5 text-caption text-surface-600 dark:text-surface-400">
                          {selectedRequirements.practiceDetail}
                        </p>
                      </div>
                    </li>
                  </ul>
                  {(!selectedRequirements.isTheoryReady ||
                    !selectedRequirements.isPracticeConfigured) && (
                    <p className="mt-3 flex items-start gap-2 text-caption text-warning-700 dark:text-warning-500">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      Configura el temario y las prácticas requeridas en &quot;Editar categoría&quot;.
                    </p>
                  )}
                </Card>
              ) : null}

              <Card variant="default" padding="md">
                <h3 className="text-heading-sm text-surface-800 dark:text-surface-100">
                  Matricular estudiante en {selectedCategory.code}
                </h3>
                <p className="mt-1 text-body-sm text-surface-600 dark:text-surface-400">
                  Asocia un estudiante a esta licencia para que pueda ver su progreso (teoría + práctica).
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:[&>div:first-child]:min-w-0 sm:[&>div:first-child]:flex-1">
                  <div className="min-w-0 flex-1">
                  <UserAsyncSelect
                    label="Estudiante"
                    role="STUDENT"
                    value={enrollStudentId}
                    onChange={(id) => setEnrollStudentId(id)}
                    onClear={() => setEnrollStudentId('')}
                    placeholder="Buscar estudiante…"
                  />
                  </div>
                  <Button
                    disabled={!enrollStudentId || studentAlreadyInCategory}
                    isLoading={adminEnrollMutation.isPending}
                    onClick={async () => {
                      if (!selectedCategory) return;
                      try {
                        await adminEnrollMutation.mutateAsync({
                          studentId: enrollStudentId,
                          licenseCategoryId: selectedCategory.id,
                        });
                        toast.success(
                          'Estudiante matriculado',
                          `${selectedCategory.code} asignado correctamente.`,
                        );
                        setEnrollStudentId('');
                      } catch (error) {
                        toast.error('Error', extractApiErrorMessage(error));
                      }
                    }}
                  >
                    Matricular
                  </Button>
                </div>
                {studentAlreadyInCategory ? (
                  <p className="mt-2 text-body-sm text-warning-600 dark:text-warning-400">
                    Este estudiante ya está matriculado en {selectedCategory?.code}.
                  </p>
                ) : null}
              </Card>

              <Table
                columns={topicColumns}
                data={topics}
                isLoading={topicsLoading}
                rowKey={(t) => t.id}
                caption={`Temas de ${selectedCategory.code}`}
                emptyState={
                  <Card variant="default" padding="md" className="text-center">
                    <p className="text-body-sm text-surface-600 dark:text-surface-400">
                      Aún no hay temas para esta licencia. Agrega la primera materia teórica.
                    </p>
                    <Button
                      className="mt-4"
                      size="sm"
                      onClick={() => {
                        setEditingTopic(null);
                        setTopicModalOpen(true);
                      }}
                    >
                      Agregar tema
                    </Button>
                  </Card>
                }
              />

            </>
          ) : (
            <Card variant="elevated" padding="md" className="flex flex-col items-center py-12 text-center">
              <BookOpen className="mb-3 h-10 w-10 text-surface-400" aria-hidden />
              <p className="text-heading-sm text-surface-800 dark:text-surface-100">
                Selecciona una categoría
              </p>
              <p className="mt-1 max-w-sm text-body-sm text-surface-500">
                Elige A1, B1, C1 u otra licencia a la izquierda para gestionar su temario teórico.
              </p>
            </Card>
          )}
        </section>
      </div>

      <LicenseCategoryFormModal
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleCategorySubmit}
        isSubmitting={updateCategoryMutation.isPending}
      />

      <TheoryTopicFormModal
        open={topicModalOpen}
        onClose={() => {
          setTopicModalOpen(false);
          setEditingTopic(null);
        }}
        category={selectedCategory}
        topic={editingTopic}
        onSubmit={handleTopicSubmit}
        isSubmitting={createTopicMutation.isPending || updateTopicMutation.isPending}
      />

      <ConfirmDialog
        open={!!categoryToggleTarget}
        onClose={() => setCategoryToggleTarget(null)}
        onConfirm={handleCategoryToggleConfirm}
        title={categoryToggleTarget?.isActive ? '¿Desactivar categoría?' : '¿Activar categoría?'}
        description={
          categoryToggleTarget
            ? `${categoryToggleTarget.code}: los nuevos temas no se mostrarán si está inactiva.`
            : undefined
        }
        confirmLabel={categoryToggleTarget?.isActive ? 'Desactivar' : 'Activar'}
        variant={categoryToggleTarget?.isActive ? 'danger' : 'primary'}
        isLoading={updateCategoryMutation.isPending}
      />

      <ConfirmDialog
        open={!!topicToggleTarget}
        onClose={() => setTopicToggleTarget(null)}
        onConfirm={handleTopicToggleConfirm}
        title={topicToggleTarget?.isActive ? '¿Desactivar tema?' : '¿Activar tema?'}
        confirmLabel={topicToggleTarget?.isActive ? 'Desactivar' : 'Activar'}
        variant={topicToggleTarget?.isActive ? 'danger' : 'primary'}
        isLoading={toggleTopicMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTopicTarget}
        onClose={() => setDeleteTopicTarget(null)}
        onConfirm={handleDeleteTopicConfirm}
        title="¿Eliminar tema?"
        description={deleteTopicTarget ? `"${deleteTopicTarget.title}" se eliminará permanentemente.` : undefined}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deleteTopicMutation.isPending}
      />
    </div>
  );
}
