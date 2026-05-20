import { cn } from '@/utils/cn';

interface CircularProgressProps {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

/**
 * Progreso circular SVG propio (sin librerías externas).
 */
export function CircularProgress({
  value,
  size = 88,
  strokeWidth = 8,
  className,
  label,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-200 dark:text-surface-800"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary-600 transition-[stroke-dashoffset] duration-500 ease-smooth dark:text-primary-400"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-heading-md font-bold text-surface-900 dark:text-surface-50">
          {Math.round(clamped)}%
        </span>
        {label ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-surface-500 dark:text-surface-400">
            {label}
          </span>
        ) : null}
      </span>
    </div>
  );
}
