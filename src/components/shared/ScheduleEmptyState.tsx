import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

interface ScheduleEmptyStateProps {
  title?: string;
  description?: string;
  showCta?: boolean;
}

export function ScheduleEmptyState({
  title = 'Todavía no tienes clases',
  description = '¡Agenda tu primera clase y comienza tu formación!',
  showCta = true,
}: ScheduleEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
      <svg width="96" height="96" viewBox="0 0 120 120" aria-hidden>
        <defs>
          <linearGradient id="sched-empty-g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <rect x="20" y="24" width="80" height="72" rx="12" fill="url(#sched-empty-g)" opacity="0.15" />
        <rect x="28" y="36" width="64" height="48" rx="8" stroke="url(#sched-empty-g)" strokeWidth="2" fill="none" />
        <circle cx="44" cy="56" r="6" fill="url(#sched-empty-g)" />
        <line x1="56" y1="56" x2="84" y2="56" stroke="url(#sched-empty-g)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="44" cy="72" r="6" fill="url(#sched-empty-g)" opacity="0.4" />
        <line x1="56" y1="72" x2="76" y2="72" stroke="url(#sched-empty-g)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      </svg>
      <div>
        <p className="text-heading-sm text-surface-800 dark:text-surface-100">{title}</p>
        <p className="mt-1 max-w-xs text-body-sm text-surface-500 dark:text-surface-400">{description}</p>
      </div>
      {showCta ? (
        <Link to={ROUTES.STUDENT.BOOK}>
          <Button iconLeft={<CalendarPlus className="h-4 w-4" />}>Agendar mi primera clase</Button>
        </Link>
      ) : null}
    </div>
  );
}
