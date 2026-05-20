import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ScheduleTableActionsProps {
  showComplete?: boolean;
  showCancel?: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Acciones compactas para filas de clases: grupo unificado con íconos y estados de color.
 */
export function ScheduleTableActions({
  showComplete = false,
  showCancel = false,
  onComplete,
  onCancel,
  className,
}: ScheduleTableActionsProps) {
  if (!showComplete && !showCancel) {
    return <span className="text-caption text-surface-400">—</span>;
  }

  return (
    <div
      role="group"
      aria-label="Acciones de la clase"
      className={cn(
        'inline-flex items-center rounded-xl border border-surface-200/90 bg-white/90 p-1 shadow-sm ring-1 ring-surface-900/5',
        'dark:border-surface-700 dark:bg-surface-900/90 dark:ring-white/5',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {showComplete ? (
        <button
          type="button"
          title="Marcar como completada"
          aria-label="Marcar como completada"
          onClick={onComplete}
          className={cn(
            'inline-flex h-8 min-w-[2rem] items-center justify-center gap-1.5 rounded-lg px-2.5',
            'text-caption font-semibold text-success-700 transition-all duration-150',
            'hover:bg-success-50 hover:shadow-sm active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500/40',
            'dark:text-success-400 dark:hover:bg-success-500/15',
          )}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
          <span className="hidden min-[420px]:inline">Completar</span>
        </button>
      ) : null}

      {showComplete && showCancel ? (
        <span
          className="mx-0.5 h-5 w-px shrink-0 bg-surface-200 dark:bg-surface-600"
          aria-hidden
        />
      ) : null}

      {showCancel ? (
        <button
          type="button"
          title="Cancelar clase"
          aria-label="Cancelar clase"
          onClick={onCancel}
          className={cn(
            'inline-flex h-8 min-w-[2rem] items-center justify-center gap-1.5 rounded-lg px-2.5',
            'text-caption font-semibold text-surface-600 transition-all duration-150',
            'hover:bg-error-50 hover:text-error-700 hover:shadow-sm active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500/40',
            'dark:text-surface-400 dark:hover:bg-error-500/15 dark:hover:text-error-400',
          )}
        >
          <XCircle className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
          <span className="hidden min-[420px]:inline">Cancelar</span>
        </button>
      ) : null}
    </div>
  );
}
