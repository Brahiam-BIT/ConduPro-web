import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AuthSuccessBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function AuthSuccessBanner({ message, onDismiss, className }: AuthSuccessBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 px-4 py-3 dark:border-success-500/30 dark:bg-success-500/10',
        className,
      )}
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-600 dark:text-success-500" aria-hidden />
      <p className="flex-1 text-body-sm text-success-800 dark:text-success-100">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar mensaje"
          className="shrink-0 rounded-md p-0.5 text-success-600 transition-colors hover:bg-success-100 dark:text-success-400 dark:hover:bg-success-500/20"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
