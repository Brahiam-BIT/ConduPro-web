import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LicenseProgressCard } from '@/components/student/LicenseProgressCard';
import { ListEmptyState } from '@/components/shared/ListEmptyState';
import { useLicenseCategories } from '@/hooks/useCurriculum';
import {
  useCancelEnrollment,
  useEnrollMe,
  useMyEnrollments,
} from '@/hooks/useStudentEnrollments';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { LICENSE_GROUP_LABELS, LICENSE_GROUP_ORDER } from '@/constants/licenseCategories';
import { ROUTES } from '@/constants/routes';
export default function StudentLicenses() {
  const toast = useToast();
  const [enrollingCode, setEnrollingCode] = useState<string | null>(null);

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useMyEnrollments();
  const { data: categories = [], isLoading: categoriesLoading } = useLicenseCategories();
  const enrollMutation = useEnrollMe();
  const cancelMutation = useCancelEnrollment();

  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');
  const completedEnrollments = enrollments.filter((e) => e.status === 'COMPLETED');
  const enrolledCategoryIds = new Set(enrollments.map((e) => e.licenseCategory.id));

  const availableByGroup = useMemo(() => {
    const map = new Map<string, typeof categories>();
    for (const group of LICENSE_GROUP_ORDER) {
      map.set(
        group,
        categories.filter((c) => c.group === group && c.isActive && !enrolledCategoryIds.has(c.id)),
      );
    }
    return map;
  }, [categories, enrolledCategoryIds]);

  const handleEnroll = async (licenseCategoryId: string, code: string) => {
    setEnrollingCode(code);
    try {
      await enrollMutation.mutateAsync({ licenseCategoryId });
      toast.success('Matrícula creada', `Comenzaste el proceso para licencia ${code}.`);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    } finally {
      setEnrollingCode(null);
    }
  };

  const handleCancel = async (enrollmentId: string, code: string) => {
    if (!window.confirm(`¿Cancelar matrícula en ${code}?`)) return;
    try {
      await cancelMutation.mutateAsync(enrollmentId);
      toast.success('Matrícula cancelada', code);
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const isLoading = enrollmentsLoading || categoriesLoading;
  const hasAnyEnrollment =
    activeEnrollments.length > 0 || completedEnrollments.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        actions={
          <Link to={ROUTES.STUDENT.BOOK}>
            <Button iconLeft={<Plus className="h-4 w-4" />}>Agendar clase</Button>
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-body-sm text-surface-500">Cargando…</p>
      ) : (
        <>
          {activeEnrollments.length > 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-heading-md text-surface-900 dark:text-surface-50">En curso</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {activeEnrollments.map((p) => (
                  <div key={p.enrollmentId} className="flex flex-col gap-2">
                    <LicenseProgressCard progress={p} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-end text-error-600 dark:text-error-500"
                      onClick={() => void handleCancel(p.enrollmentId, p.licenseCategory.code)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancelar matrícula
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {completedEnrollments.length > 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-heading-md text-surface-900 dark:text-surface-50">Completadas</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {completedEnrollments.map((p) => (
                  <LicenseProgressCard key={p.enrollmentId} progress={p} />
                ))}
              </div>
            </section>
          ) : null}

          {!hasAnyEnrollment ? (
            <ListEmptyState
              illustration="default"
              title="Aún no estás matriculado"
              description="Elige la categoría de licencia que deseas obtener para empezar a registrar tu progreso."
            />
          ) : null}

          <section className="flex flex-col gap-4">
            <h2 className="text-heading-md text-surface-900 dark:text-surface-50">
              Inscribirme en otra licencia
            </h2>
            {LICENSE_GROUP_ORDER.map((group) => {
              const items = availableByGroup.get(group) ?? [];
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-surface-500">
                    {LICENSE_GROUP_LABELS[group]}
                  </p>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {items.map((cat) => (
                      <li key={cat.id}>
                        <Card variant="default" padding="md" className="flex h-full flex-col gap-3">
                          <div>
                            <span className="font-mono text-label font-bold text-primary-600">
                              {cat.code}
                            </span>
                            <p className="text-body-sm font-medium text-surface-800 dark:text-surface-100">
                              {cat.name}
                            </p>
                            <p className="mt-1 text-caption text-surface-500">
                              {cat.topicCount} temas · {cat.requiredPracticeSessions} prácticas
                            </p>
                          </div>
                          <Button
                            size="sm"
                            fullWidth
                            iconLeft={<GraduationCap className="h-4 w-4" />}
                            isLoading={enrollingCode === cat.code}
                            disabled={!!enrollingCode}
                            onClick={() => void handleEnroll(cat.id, cat.code)}
                          >
                            Matricularme
                          </Button>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
