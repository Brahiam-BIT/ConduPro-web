import { Link } from 'react-router-dom';
import { BookOpen, Car, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import type { EnrollmentProgress } from '@/types/enrollment.types';

interface LicenseProgressCardProps {
  progress: EnrollmentProgress;
  compact?: boolean;
}

export function LicenseProgressCard({ progress, compact = false }: LicenseProgressCardProps) {
  const { licenseCategory: cat } = progress;
  const statusBadge =
    progress.status === 'COMPLETED' ? (
      <Badge variant="success" dot size="sm">
        Licencia cumplida
      </Badge>
    ) : progress.isLicenseComplete ? (
      <Badge variant="success" dot size="sm">
        Requisitos listos
      </Badge>
    ) : (
      <Badge variant="info" dot size="sm">
        En progreso
      </Badge>
    );

  return (
    <Card variant="elevated" padding="md" className={cn(compact && 'h-full')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-label font-bold text-primary-600 dark:text-primary-400">
            {cat.code}
          </p>
          <h3 className="text-heading-sm text-surface-900 dark:text-surface-50">{cat.name}</h3>
        </div>
        {statusBadge}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <CircularProgress value={progress.overallPercent} size={compact ? 64 : 80} strokeWidth={7} />
        <div className="flex flex-1 flex-col gap-2 text-body-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden />
            <span className="text-surface-800 dark:text-surface-200">
              Teoría: {progress.theoryCompleted}/{progress.theoryRequired}
            </span>
            <span className="text-caption text-surface-500 dark:text-surface-400">
              ({progress.theoryPercent}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden />
            <span className="text-surface-800 dark:text-surface-200">
              Práctica: {progress.practiceCompleted}/{progress.practiceRequired}
            </span>
            <span className="text-caption text-surface-500 dark:text-surface-400">
              ({progress.practicePercent}%)
            </span>
          </div>
        </div>
      </div>

      {!compact && progress.theoryTopics.length > 0 ? (
        <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto border-t border-surface-200 pt-3 dark:border-surface-800">
          {progress.theoryTopics.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center gap-2 text-caption text-surface-600 dark:text-surface-400"
            >
              <CheckCircle2
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  topic.completed
                    ? 'text-success-600 dark:text-success-500'
                    : 'text-surface-300 dark:text-surface-600',
                )}
                aria-hidden
              />
              <span className={topic.completed ? 'line-through opacity-70' : undefined}>
                {topic.title}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {!compact ? (
        <div className="mt-4 flex justify-end">
          <Link to={ROUTES.STUDENT.LICENSES}>
            <Button variant="ghost" size="sm">
              Ver detalle
            </Button>
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
