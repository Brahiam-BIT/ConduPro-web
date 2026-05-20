import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Stepper
 * Numbered steps with status: pending | active | completed.
 * Layout: horizontal on >=sm, vertical on mobile.
 */
export interface StepperStep {
  id: string;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepperStep[];
  currentStep: number; // 0-indexed: active step
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <ol
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0',
        className,
      )}
      aria-label="Progreso del flujo"
    >
      {steps.map((step, index) => {
        const status =
          index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending';
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.id}
            className={cn(
              'flex items-start gap-3 sm:flex-1 sm:items-center',
              !isLast && 'sm:after:mx-3 sm:after:h-px sm:after:flex-1 sm:after:bg-surface-300 dark:sm:after:bg-surface-700',
              status !== 'pending' && !isLast && 'sm:after:bg-primary-500',
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-body-sm font-semibold transition-colors duration-200 ease-smooth',
                status === 'completed' &&
                  'bg-primary-600 border-primary-600 text-white',
                status === 'active' &&
                  'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200',
                status === 'pending' &&
                  'border-surface-300 bg-surface-50 text-surface-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400',
              )}
              aria-current={status === 'active' ? 'step' : undefined}
            >
              {status === 'completed' ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  'text-body-sm font-semibold',
                  status === 'pending'
                    ? 'text-surface-500 dark:text-surface-400'
                    : 'text-surface-800 dark:text-surface-100',
                )}
              >
                {step.title}
              </p>
              {step.description ? (
                <p className="text-caption text-surface-500 dark:text-surface-400">{step.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
