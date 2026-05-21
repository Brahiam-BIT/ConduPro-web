import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BookClassStepper } from '@/components/student/BookClassStepper';
import { BookClassTypePicker } from '@/components/student/BookClassTypePicker';
import { ROUTES } from '@/constants/routes';
import type { ScheduleType } from '@/types/schedule.types';

export default function BookClass() {
  const navigate = useNavigate();
  const [classType, setClassType] = useState<ScheduleType | null>(null);

  const handleContinue = () => {
    if (classType === 'THEORY') {
      navigate(ROUTES.STUDENT.BOOK_THEORY);
      return;
    }
    if (classType === 'PRACTICE') {
      navigate(ROUTES.STUDENT.BOOK_PRACTICE);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <BookClassStepper currentStep={0} />

      <p className="text-body-md text-surface-600 dark:text-surface-400">
        Elige el tipo de clase. Verás los <strong>horarios que publicó cada instructor</strong> según
        su disponibilidad y podrás reservar el que prefieras.
      </p>

      <BookClassTypePicker
        selected={classType}
        onSelect={(type) => setClassType(type)}
      />

      <div className="flex justify-end">
        <Button disabled={classType === null} onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
