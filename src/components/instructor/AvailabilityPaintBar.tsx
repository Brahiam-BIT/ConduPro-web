import { BookOpen, Car } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { cn } from '@/utils/cn';
import type { AvailabilityClassType } from '@/types/availability.types';
import type { TheoryTopicOption } from '@/hooks/useAllTheoryTopics';

interface AvailabilityPaintBarProps {
  paintMode: AvailabilityClassType;
  onPaintModeChange: (mode: AvailabilityClassType) => void;
  theoryTopicId: string;
  onTheoryTopicChange: (topicId: string, option?: TheoryTopicOption) => void;
  topicOptions: TheoryTopicOption[];
  topicsLoading?: boolean;
}

export function AvailabilityPaintBar({
  paintMode,
  onPaintModeChange,
  theoryTopicId,
  onTheoryTopicChange,
  topicOptions,
  topicsLoading,
}: AvailabilityPaintBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900/80 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5">
        <span className="text-caption font-medium text-surface-500">Tipo de franja</span>
        <div className="inline-flex rounded-lg border border-surface-200 p-0.5 dark:border-surface-700">
          <button
            type="button"
            onClick={() => onPaintModeChange('PRACTICE')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-caption font-semibold transition-colors',
              paintMode === 'PRACTICE'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800',
            )}
          >
            <Car className="h-4 w-4" aria-hidden />
            Práctica
          </button>
          <button
            type="button"
            onClick={() => onPaintModeChange('THEORY')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-caption font-semibold transition-colors',
              paintMode === 'THEORY'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800',
            )}
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Teoría
          </button>
        </div>
      </div>

      {paintMode === 'THEORY' ? (
        <Select
          label="Materia a dictar"
          value={theoryTopicId}
          onChange={(e) => {
            const opt = topicOptions.find((t) => t.id === e.target.value);
            onTheoryTopicChange(e.target.value, opt);
          }}
          disabled={topicsLoading}
          options={[
            { value: '', label: topicsLoading ? 'Cargando temas…' : 'Elige un tema…' },
            ...topicOptions.map((t) => ({ value: t.id, label: t.label })),
          ]}
          containerClassName="min-w-[220px] flex-1"
        />
      ) : (
        <p className="flex-1 pb-2 text-caption text-surface-500">
          Toca cada celda para marcarla en verde. Vuelve a tocar para quitarla.
        </p>
      )}
    </div>
  );
}
