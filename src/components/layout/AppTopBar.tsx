import { useLocation } from 'react-router-dom';
import { CircleHelp, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getPageMeta } from '@/constants/pageMeta';
import { usePageActionsContext } from '@/providers/PageActionsContext';
import { useGuidedTour } from '@/providers/GuidedTourProvider';
import { Button } from '@/components/ui/Button';

export function AppTopBar() {
  const { pathname } = useLocation();
  const meta = getPageMeta(pathname);
  const { actions } = usePageActionsContext();
  const { startTour, hasTourForCurrentPage } = useGuidedTour();

  if (!meta) return null;

  return (
    <header
      className={cn(
        'sticky top-14 z-20 -mx-4 mb-6 border-b border-surface-200/80 bg-gradient-to-r from-surface-50 via-primary-50/30 to-surface-50 px-4 py-5 backdrop-blur-md dark:border-surface-800/80 dark:from-surface-900 dark:via-primary-950/20 dark:to-surface-900 sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8',
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Sparkles
              className="h-4 w-4 shrink-0 text-primary-500 dark:text-primary-400"
              aria-hidden
            />
            <span className="text-caption font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              ConduPro
            </span>
          </div>
          <h1 className="text-display-sm bg-gradient-to-r from-surface-900 to-surface-700 bg-clip-text text-transparent dark:from-surface-50 dark:to-surface-300">
            {meta.title}
          </h1>
          <p className="mt-1 max-w-2xl text-body-md text-surface-600 dark:text-surface-400">
            {meta.subtitle}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 md:justify-end">
          {actions}
          {hasTourForCurrentPage ? (
            <Button
              variant="outline"
              size="sm"
              iconLeft={<CircleHelp className="h-4 w-4" />}
              onClick={startTour}
              className="border-primary-200 bg-bg-primary/80 dark:border-primary-800/50"
            >
              Tutorial guiado
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
