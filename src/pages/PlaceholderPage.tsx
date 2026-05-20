import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

/**
 * Placeholder used across phase 1 to render every protected route while the
 * actual features (dashboards, schedules, etc.) get implemented in later phases.
 */
export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} subtitle={description ?? 'Pantalla pendiente de implementación.'} />
      <Card variant="elevated">
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-heading-sm text-surface-800 dark:text-surface-100">Próximamente</p>
          <p className="max-w-sm text-body-sm text-surface-500 dark:text-surface-400">
            Esta vista se construirá en una fase posterior. Por ahora muestra el header y la estructura
            de layout para validar el design system.
          </p>
        </div>
      </Card>
    </div>
  );
}
