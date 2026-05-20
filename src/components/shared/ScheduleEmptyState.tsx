import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { ListEmptyState } from './ListEmptyState';

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
    <ListEmptyState
      title={title}
      description={description}
      illustration="calendar"
      action={
        showCta ? (
          <Link to={ROUTES.STUDENT.BOOK}>
            <Button iconLeft={<CalendarPlus className="h-4 w-4" />}>Agendar mi primera clase</Button>
          </Link>
        ) : undefined
      }
    />
  );
}
