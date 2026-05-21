import type { ReactNode } from 'react';
import { BookOpen, Car } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ClassTypeCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}

function ClassTypeCard({ selected, onSelect, icon, title, description }: ClassTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col gap-4 rounded-xl border-2 p-6 text-left transition-all duration-150 ease-smooth',
        selected
          ? 'border-primary-600 bg-primary-50 shadow-md dark:border-primary-500 dark:bg-primary-500/15'
          : 'border-surface-200 bg-surface-50 hover:border-primary-300 dark:border-surface-800 dark:bg-surface-900',
      )}
    >
      <span
        className={cn(
          'inline-flex h-14 w-14 items-center justify-center rounded-xl',
          selected
            ? 'bg-primary-600 text-white'
            : 'bg-surface-200 text-surface-600 dark:bg-surface-800 dark:text-surface-300',
        )}
      >
        {icon}
      </span>
      <div>
        <h3 className="text-heading-sm text-surface-900 dark:text-surface-50">{title}</h3>
        <p className="mt-1 text-body-sm text-surface-600 dark:text-surface-400">{description}</p>
      </div>
    </button>
  );
}

interface BookClassTypePickerProps {
  selected: 'THEORY' | 'PRACTICE' | null;
  onSelect: (type: 'THEORY' | 'PRACTICE') => void;
}

export function BookClassTypePicker({ selected, onSelect }: BookClassTypePickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ClassTypeCard
        selected={selected === 'THEORY'}
        onSelect={() => onSelect('THEORY')}
        icon={<BookOpen className="h-8 w-8" />}
        title="Teórica"
        description="Sesiones en aula según tu licencia: elige día y hora con cupo disponible."
      />
      <ClassTypeCard
        selected={selected === 'PRACTICE'}
        onSelect={() => onSelect('PRACTICE')}
        icon={<Car className="h-8 w-8" />}
        title="Práctica"
        description="Horarios del instructor en carretera; reserva día, hora y vehículo disponible."
      />
    </div>
  );
}
