import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGuidedTour } from '@/providers/GuidedTourProvider';

export function GuidedTourOverlay() {
  const { isActive, stepIndex, steps, closeTour, nextStep, prevStep } = useGuidedTour();

  if (!isActive || steps.length === 0) return null;

  const step = steps[stepIndex];
  if (!step) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-surface-950/50 backdrop-blur-sm animate-fade-in"
        aria-hidden
        onClick={closeTour}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
        className="relative z-10 w-full max-w-md animate-slide-down rounded-2xl border border-surface-200 bg-surface-50 p-6 shadow-xl dark:border-surface-700 dark:bg-surface-900"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-caption font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
              Paso {stepIndex + 1} de {steps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={closeTour}
            aria-label="Cerrar tutorial"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 id="guided-tour-title" className="text-heading-md text-surface-900 dark:text-surface-50">
          {step.title}
        </h2>
        <p className="mt-2 text-body-md text-surface-600 dark:text-surface-400">{step.content}</p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={closeTour}>
            Omitir
          </Button>
          <div className="flex gap-2">
            {!isFirst ? (
              <Button
                variant="outline"
                size="sm"
                iconLeft={<ChevronLeft className="h-4 w-4" />}
                onClick={prevStep}
              >
                Anterior
              </Button>
            ) : null}
            <Button
              size="sm"
              iconRight={!isLast ? <ChevronRight className="h-4 w-4" /> : undefined}
              onClick={nextStep}
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
