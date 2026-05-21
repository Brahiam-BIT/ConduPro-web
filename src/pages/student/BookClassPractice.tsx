import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ScheduleTypeBadge } from '@/components/shared/StatusBadge';
import { BookClassStepper } from '@/components/student/BookClassStepper';
import StudentPracticeClasses from '@/pages/student/StudentPracticeClasses';
import { ROUTES } from '@/constants/routes';

/** Paso 2 del flujo Agendar clase — reserva en horarios del instructor. */
export default function BookClassPractice() {
  return (
    <div className="flex flex-col gap-8">
      <BookClassStepper currentStep={1} />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          to={ROUTES.STUDENT.BOOK}
          className="inline-flex items-center gap-1 text-body-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          <ChevronLeft className="h-4 w-4" />
          Cambiar tipo
        </Link>
        <span className="text-surface-300 dark:text-surface-600">·</span>
        <ScheduleTypeBadge type="PRACTICE" />
      </div>

      <StudentPracticeClasses />
    </div>
  );
}
